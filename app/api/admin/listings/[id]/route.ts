import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
async function auth() {
  const session = await getModeratorSession();
  if (!session) return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await req.json();
    const allowed = [
      'status', 'title', 'description', 'monthly_rent', 'address', 'city', 'state', 'zip',
      'bedrooms', 'bathrooms', 'living_area_sqft', 'available_date', 'property_type',
      'listing_source', 'agent_name', 'office_name', 'license_number',
      'virtual_tour_url', 'building_name', 'section_8_accepted', 'furnished',
      'laundry_type', 'pool', 'pool_type', 'fireplace', 'fireplace_location',
      'parking', 'parking_spaces', 'parking_type', 'air_conditioning', 'heating_type',
      'pets_policy', 'yard', 'yard_type', 'utilities_included', 'lease_terms',
      'smoking_allowed', 'appliances', 'amenities', 'deposit',
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowed) { if (body[key] !== undefined) update[key] = body[key]; }
    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    const { error } = await adminClient().from('listings').update(update).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Listings › :id', message: _msg, details: _stack, endpoint: 'PATCH /api/admin/listings/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { error } = await adminClient().from('listings').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Listings › :id', message: _msg, details: _stack, endpoint: 'DELETE /api/admin/listings/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
