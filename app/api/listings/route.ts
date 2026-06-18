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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
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

  // Upload photos to Supabase Storage
  const photoUrls: string[] = []
  for (const file of photoFiles) {
    const ext = file.name.split('.').pop() ?? 'jpg'
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

  // Generate unique slug from address
  const baseSlug = generateListingSlug(address, city, state, zip ?? undefined)
  const { data: existing } = await supabase
    .from('listings')
    .select('slug')
    .like('slug', `${baseSlug}%`)
  const takenSlugs = new Set((existing ?? []).map((r: { slug: string }) => r.slug))
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
      price: Number(formData.get('price')),
      bedrooms: Number(formData.get('bedrooms')),
      bathrooms: Number(formData.get('bathrooms')),
      sqft: formData.get('sqft') ? Number(formData.get('sqft')) : null,
      property_type: formData.get('propertyType') as string,
      ownership_type: formData.get('ownershipType') as string || null,
      listing_source: (formData.get('listingSource') as string) || 'owner',
      license_number: formData.get('licenseNumber') as string || null,
      virtual_tour_url: formData.get('virtualTourUrl') as string || null,
      amenities,
      photos: photoUrls,
      available_from: formData.get('availableFrom') as string || null,
      status: 'active',
      expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
