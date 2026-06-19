import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { generateListingSlug } from '@/lib/format'

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
  const photoFiles = formData.getAll('photos') as File[]

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  // Upload photos to Supabase Storage
  const photoUrls: string[] = []
  for (const file of photoFiles) {
    if (!ALLOWED_TYPES.includes(file.type)) continue;
    if (file.size > MAX_SIZE) continue;
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' }[file.type] ?? 'jpg';
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await supabase.storage
      .from('listing-photos')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (!uploadErr) {
      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(path)
      photoUrls.push(publicUrl)
    }
  }

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
      living_area_sqft: formData.get('sqft') ? Number(formData.get('sqft')) : null,
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

  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
