import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';
import { getReferralSummary } from '@/lib/referrals';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

// GET /api/referrals — the signed-in landlord's referral code, link, stats, credits
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const summary = await getReferralSummary(user.id);
    return NextResponse.json(summary);
  } catch (err) {
    await logError({ source: 'Referrals', message: err instanceof Error ? err.message : String(err), endpoint: 'GET /api/referrals', user_id: user.id, http_status: 500 });
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
