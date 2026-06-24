import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { generateListingSlug } from '@/lib/format'
import { geocodeAddress } from '@/lib/geocode'
import { logError } from '@/lib/log-error'
import { getOrProvisionVirtualPhone } from '@/lib/twilio'

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

  // Generate slug from address — reuse the same slug if this address was listed before,
  // so Google keeps its SEO ranking for the URL across relists of the same property.
  const baseSlug = generateListingSlug(address, city, state, zip ?? undefined)
  const { data: priorAtAddress } = await supabase
    .from('listings')
    .select('slug')
    .eq('slug', baseSlug)
    .limit(1)
    .single()
  let slug = baseSlug
  if (!priorAtAddress) {
    // No prior listing at this address — check for accidental slug collisions on different addresses
    const { data: collisions } = await supabase
      .from('listings')
      .select('slug')
      .like('slug', `${baseSlug}%`)
    const takenSlugs = new Set((collisions ?? []).map((r: { slug: string }) => r.slug))
    let counter = 2
    while (takenSlugs.has(slug)) slug = `${baseSlug}-${counter++}`
  }

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
      monthly_rent: Number(formData.get('price')),
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      living_area_sqft: formData.get('sqft') ? Number(formData.get('sqft')) : 0,
      property_type: formData.get('propertyType') as string,
      ownership_type: formData.get('ownershipType') as string || null,
      listing_source: (formData.get('listingSource') as string) || 'owner',
      license_number: formData.get('licenseNumber') as string || null,
      virtual_tour_url: formData.get('virtualTourUrl') as string || null,
      amenities,
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
  getOrProvisionVirtualPhone(user.id, zip, city, state).catch(() => {});

  return NextResponse.json(data, { status: 201 })
}
