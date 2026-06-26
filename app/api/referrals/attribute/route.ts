import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';
import { attributeReferral } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

// POST /api/referrals/attribute { code } — link the signed-in landlord to the
// referrer who owns `code`. Idempotent; ignores self-referral / unknown codes.
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code) return NextResponse.json({ ok: true }); // nothing to attribute

  await attributeReferral(user.id, code);
  return NextResponse.json({ ok: true });
}
