import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
// GET /api/applications — fetch all applications across all landlord's listings in one query
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // First get all listing IDs owned by this landlord
    const { data: listings, error: listingsErr } = await supabase
      .from('listings')
      .select('id, address')
      .eq('landlord_id', user.id);

    if (listingsErr) return NextResponse.json({ error: listingsErr.message }, { status: 500 });
    if (!listings || listings.length === 0) return NextResponse.json([]);

    const listingIds = listings.map((l) => l.id);
    const addressMap = Object.fromEntries(listings.map((l) => [l.id, l.address]));

    // Fetch all applications for those listings in one query
    const { data, error } = await supabase
      .from('applications')
      .select('id, listing_id, tenant_name, tenant_phone, message, income, credit_score, move_in, ai_match_score, ai_summary, status, created_at, source')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });

    const mapped = (data ?? []).map((a) => ({
      ...a,
      listingAddress: addressMap[a.listing_id as string] ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Applications', message: _msg, details: _stack, endpoint: 'GET /api/applications', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
