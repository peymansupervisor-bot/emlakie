import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin, createSupabaseWithToken } from '@/lib/supabase-server'
import { generateListingSlug } from '@/lib/format'
import { logError } from '@/lib/log-error'
import { maybeReleaseVirtualPhone } from '@/lib/twilio'

export const dynamic = 'force-dynamic'

// PUT /api/listings/[id] — update status, title, price, etc.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Only allow safe, landlord-editable fields — prevents boosted_until/landlord_id/slug injection
  const ALLOWED = new Set(['title', 'description', 'monthly_rent', 'available_date', 'amenities',
    'status', 'virtual_tour_url', 'ownership_type', 'bedrooms', 'bathrooms',
    'living_area_sqft', 'property_type', 'address', 'city', 'state', 'zip', 'listing_source',
    'section_8_accepted', 'furnished', 'laundry_type', 'pool', 'pool_type',
    'fireplace', 'fireplace_location', 'parking', 'parking_spaces', 'parking_type',
    'air_conditioning', 'heating_type', 'pets_policy', 'yard', 'yard_type',
    'utilities_included', 'lease_terms', 'smoking_allowed', 'appliances',
    'building_name', 'agent_name', 'license_number'])
  const ALLOWED_STATUS = new Set(['active', 'inactive', 'lease_in_progress', 'coming_soon', 'rented'])

  const { price, ...rest } = body as { price?: number; [key: string]: unknown }
  const raw = { ...rest, ...(price !== undefined ? { monthly_rent: price } : {}) }
  const dbPayload: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (!ALLOWED.has(k)) continue
    if (k === 'status' && typeof v === 'string' && !ALLOWED_STATUS.has(v)) continue
    dbPayload[k] = v
  }
  if (Object.keys(dbPayload).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // If address changed, regenerate slug and geocode for accurate lat/lng
  const addrChanged = ['address', 'city', 'state', 'zip'].some((k) => k in dbPayload)
  if (addrChanged) {
    // Fetch current row to fill in any address parts not in this payload
    const { data: current } = await supabase
      .from('listings')
      .select('address, city, state, zip')
      .eq('id', id)
      .eq('landlord_id', user.id)
      .single()

    const addr = String(dbPayload.address ?? current?.address ?? '')
    const city = String(dbPayload.city ?? current?.city ?? '')
    const state = String(dbPayload.state ?? current?.state ?? '')
    const zip = String(dbPayload.zip ?? current?.zip ?? '')

    dbPayload.slug = generateListingSlug(addr, city, state, zip)

    const q = encodeURIComponent([addr, city, state, zip].filter(Boolean).join(', ') + ', USA')
    try {
      const geo = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`,
        { headers: { 'User-Agent': 'emlakie.com/1.0' } }
      )
      const geoData = await geo.json()
      if (geoData?.[0]) {
        dbPayload.lat = parseFloat(geoData[0].lat)
        dbPayload.lng = parseFloat(geoData[0].lon)
      }
    } catch { /* geocoding failure is non-fatal */ }
  }

  const { error } = await supabase
    .from('listings')
    .update(dbPayload)
    .eq('id', id)
    .eq('landlord_id', user.id)

  if (error) {
    await logError({ source: 'Listing Update', message: error.message, user_id: user.id, endpoint: `PUT /api/listings/${id}`, http_status: 500, context: { listing_id: id, fields: Object.keys(dbPayload) } });
    return NextResponse.json({ error: error.message ?? 'Something went wrong' }, { status: 500 })
  }

  // If status changed away from active, release the virtual phone if no active listings remain
  const inactiveStatuses = new Set(['rented', 'inactive', 'deactivated', 'lease_in_progress', 'coming_soon'])
  if (typeof dbPayload.status === 'string' && inactiveStatuses.has(dbPayload.status)) {
    maybeReleaseVirtualPhone(user.id).catch(() => {});
  }

  return NextResponse.json({ ok: true, slug: dbPayload.slug ?? null })
}

// DELETE /api/listings/[id] — permanently delete a listing
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership with user-scoped client
  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: listing } = await supabase
    .from('listings')
    .select('id, landlord_id')
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found or not yours' }, { status: 404 })

  // Use admin client to bypass RLS for the delete
  const admin = createSupabaseAdmin()
  const { error } = await admin
    .from('listings')
    .delete()
    .eq('id', id)

  if (error) {
    await logError({ source: 'Listing Delete', message: error.message, user_id: user.id, endpoint: `DELETE /api/listings/${id}`, http_status: 500, context: { listing_id: id } });
    return NextResponse.json({ error: error.message ?? 'Something went wrong' }, { status: 500 })
  }

  // Release virtual phone if no active listings remain after deletion
  maybeReleaseVirtualPhone(user.id).catch(() => {});

  return NextResponse.json({ ok: true })
}
