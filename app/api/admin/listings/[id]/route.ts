import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

async function auth() {
  const session = await getModeratorSession();
  if (!session) return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const allowed = ['status', 'title', 'description', 'monthly_rent', 'address', 'city', 'state', 'zip', 'bedrooms', 'bathrooms', 'sqft', 'available_from', 'property_type', 'pets_allowed', 'parking'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) { if (body[key] !== undefined) update[key] = body[key]; }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  const { error } = await adminClient().from('listings').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { error } = await adminClient().from('listings').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
