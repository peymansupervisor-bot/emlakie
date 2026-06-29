/**
 * POST /api/assistant/save
 *
 * Saves a set of listing IDs to the authenticated user's saved_listings.
 * Called when the user taps "Save all" in the assistant panel.
 *
 * Body: { listing_ids: string[] }
 * Auth: Bearer token in Authorization header
 *
 * Returns: { saved: number } — count of newly saved listings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  let listing_ids: unknown;
  try {
    ({ listing_ids } = await req.json() as { listing_ids: unknown });
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!Array.isArray(listing_ids) || listing_ids.length === 0) {
    return NextResponse.json({ error: 'listing_ids required' }, { status: 400 });
  }

  // Sanitize — only accept string UUIDs, max 10
  const ids = (listing_ids as unknown[])
    .filter((id): id is string => typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id))
    .slice(0, 10);

  if (ids.length === 0) {
    return NextResponse.json({ error: 'no valid listing_ids' }, { status: 400 });
  }

  const rows = ids.map((listing_id) => ({ user_id: user.id, listing_id }));

  const { error } = await supabase
    .from('saved_listings')
    .upsert(rows, { onConflict: 'user_id,listing_id', ignoreDuplicates: true });

  if (error) {
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }

  return NextResponse.json({ saved: ids.length });
}
