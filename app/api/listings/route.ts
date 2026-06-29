import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { generateListingSlug } from '@/lib/format'
import { geocodeAddress } from '@/lib/geocode'
import { logError } from '@/lib/log-error'
import { getOrProvisionVirtualPhone } from '@/lib/twilio'
import { submitToIndexNow } from '@/lib/indexnow'
import { stateByAbbr } from '@/lib/states'
import { qualifyReferralOnFirstListing } from '@/lib/referrals'

export const dynamic = 'force-dynamic'
// Route segment config — tells Next.js/Vercel this route needs extended body size
// (up to 20 photos × 10 MB each before server-side compression)
export const runtime = 'nodejs'
export const maxDuration = 60

// GET /api/listings — returns the landlord's own listings
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('landlord_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })

  const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    lat: row.lat != null ? Number(row.lat) : undefined,
    lng: row.lng != null ? Number(row.lng) : undefined,
    price: Number(row.monthly_rent ?? row.price ?? 0),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    sqft: Number(row.living_area_sqft ?? row.sqft ?? 0),
    property_type: row.property_type,
    ownership_type: row.ownership_type,
    amenities: (row.amenities as string[]) ?? [],
    photos: (row.photos as string[]) ?? [],
    status: row.status,
    availableFrom: row.available_date,
    view_count: Number(row.view_count ?? 0),
    applicant_count: Number(row.applicant_count ?? 0),
    listing_source: row.listing_source ?? 'owner',
    license_number: row.license_number,
    virtual_tour_url: row.virtual_tour_url,
    slug: row.slug,
    expiresAt: row.expires_at,
    section_8_accepted: row.section_8_accepted ?? false,
    furnished: row.furnished ?? false,
    laundry_type: row.laundry_type ?? null,
    pool: row.pool ?? false,
    pool_type: row.pool_type ?? null,
  }))
  return NextResponse.json(mapped)
}

// POST /api/listings — create a new listing with photos
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Parse multipart form
  const formData = await req.formData()

  // Photos are now uploaded directly from the browser to Supabase Storage.
  // The route receives only the resulting public URLs — no binary data,
  // no body-size pressure, no 413 regardless of how many photos.
  const photoUrls = formData.getAll('photoUrl').map(String).filter(Boolean)

  const amenities = JSON.parse(formData.get('amenities') as string ?? '[]')

  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const zip = formData.get('zip') as string || null
  const listingSource = (formData.get('listingSource') as string) || 'owner'
  const agentName = formData.get('agentName') as string || null
  const price = Number(formData.get('price'))
  const bedrooms = Number(formData.get('bedrooms'))
  const bathrooms = Number(formData.get('bathrooms'))
  const propertyType = formData.get('propertyType') as string

  // ── Server-side validation ────────────────────────────────────────────────
  const validationErrors: string[] = []
  if (!address?.trim()) validationErrors.push('Address is required.')
  if (!city?.trim()) validationErrors.push('City is required.')
  if (!state?.trim()) validationErrors.push('State is required.')
  if (!propertyType?.trim()) validationErrors.push('Property type is required.')
  if (!price || price <= 0) validationErrors.push('A valid monthly rent is required.')
  if (!bedrooms || bedrooms <= 0) validationErrors.push('Number of bedrooms is required.')
  if (!bathrooms || bathrooms <= 0) validationErrors.push('Number of bathrooms is required.')
  if (photoUrls.length === 0) validationErrors.push('At least one photo is required.')
  if (listingSource === 'broker' && !agentName?.trim()) validationErrors.push('Agent/broker name is required for broker listings.')

  // Verify the landlord has a phone — accept from form or existing profile
  const adminSb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const formPhone = (formData.get('phone') as string)?.trim() ?? ''
  const { data: profile } = await adminSb.from('profiles').select('phone').eq('id', user.id).single()
  const resolvedPhone = profile?.phone?.trim() || formPhone
  if (!resolvedPhone) {
    validationErrors.push('A contact phone number is required on your profile before listing.')
  } else if (!profile?.phone?.trim() && formPhone) {
    // Phone came from the form but isn't in the DB yet — save it now server-side
    await adminSb.from('profiles').update({ phone: formPhone }).eq('id', user.id)
  }

  if (validationErrors.length > 0) {
    return NextResponse.json({ error: validationErrors.join(' ') }, { status: 422 })
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Generate slug from address. Reuse the base slug only if it's not currently
  // taken — preserves SEO ranking when a property is re-listed after being removed.
  const baseSlug = generateListingSlug(address, city, state, zip ?? undefined)
  const { data: collisions } = await supabase
    .from('listings')
    .select('slug')
    .like('slug', `${baseSlug}%`)
  const takenSlugs = new Set((collisions ?? []).map((r: { slug: string }) => r.slug))
  let slug = baseSlug
  let counter = 2
  while (takenSlugs.has(slug)) slug = `${baseSlug}-${counter++}`

  const { data, error } = await supabase
    .from('listings')
    .insert({
      landlord_id: user.id,
      slug,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      address,
      city,
      state,
      zip,
      monthly_rent: price,
      bedrooms,
      bathrooms,
      living_area_sqft: formData.get('sqft') ? Number(formData.get('sqft')) : 0,
      property_type: propertyType,
      ownership_type: formData.get('ownershipType') as string || null,
      listing_source: listingSource,
      agent_name: agentName,
      license_number: formData.get('licenseNumber') as string || null,
      virtual_tour_url: formData.get('virtualTourUrl') as string || null,
      amenities,
      section_8_accepted: formData.get('section8Accepted') === 'true',
      furnished: formData.get('furnished') === 'true',
      laundry_type: formData.get('laundryType') as string || null,
      pool: formData.get('pool') === 'true',
      pool_type: formData.get('poolType') as string || null,
      photos: photoUrls,
      available_date: formData.get('availableFrom') as string || null,
      status: 'active',
      expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) {
    await logError({ source: 'Listing Create', message: error.message, user_id: user.id, endpoint: 'POST /api/listings', http_status: 500, context: { address, city, state } });
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }

  // Geocode address to lat/lng so nearby scores & schools always show
  const coords = await geocodeAddress(address, city, state, zip)
  if (coords) {
    await supabase.from('listings').update({ lat: coords.lat, lng: coords.lng }).eq('id', data.id)
  }

  // Provision a virtual phone for the landlord if they don't have one yet (fire and forget)
  // Only runs when landlord has at least one active listing — which is now true since we just inserted one
  getOrProvisionVirtualPhone(user.id, zip ?? undefined, city ?? undefined, state ?? undefined).catch(() => {});

  // Notify IndexNow (Bing/Yandex) about the new listing plus the city/state
  // pages it now belongs to, so they recrawl quickly. Fire-and-forget.
  const citySlug = city ? city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null
  const stateSlug = stateByAbbr.get((state ?? '').toUpperCase())?.slug ?? null
  submitToIndexNow([
    `/rentals/${data.slug ?? data.id}`,
    ...(citySlug ? [`/rentals/city/${citySlug}`] : []),
    ...(stateSlug ? [`/rentals/state/${stateSlug}`] : []),
  ]).catch(() => {});

  // If this is a referred landlord's first listing, qualify the referral and
  // grant both parties a free 30-day boost (auto-applied here). Fire-and-forget.
  qualifyReferralOnFirstListing(user.id, data.id).catch(() => {});

  return NextResponse.json(data, { status: 201 })
}
