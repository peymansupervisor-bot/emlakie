import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'

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
  const ALLOWED = new Set(['title', 'description', 'monthly_rent', 'available_from', 'amenities',
    'status', 'virtual_tour_url', 'ownership_type', 'bedrooms', 'bathrooms',
    'living_area_sqft', 'property_type', 'address', 'city', 'state', 'zip', 'listing_source'])
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

  const { data, error } = await supabase
    .from('listings')
    .update(dbPayload)
    .eq('id', id)
    .eq('landlord_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  return NextResponse.json(data)
}
