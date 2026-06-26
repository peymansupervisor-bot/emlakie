import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';
import { redeemBoostCredit } from '@/lib/referrals';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

// POST /api/referrals/redeem { creditId, listingId } — apply a free boost credit
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { creditId, listingId } = (await req.json().catch(() => ({}))) as { creditId?: string; listingId?: string };
  if (!creditId || !listingId) return NextResponse.json({ error: 'creditId and listingId are required' }, { status: 400 });

  try {
    const result = await redeemBoostCredit(user.id, creditId, listingId);
    if (!result.ok) return NextResponse.json({ error: result.error ?? 'Could not redeem' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({ source: 'Referrals', message: err instanceof Error ? err.message : String(err), endpoint: 'POST /api/referrals/redeem', user_id: user.id, http_status: 500 });
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
