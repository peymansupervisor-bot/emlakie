import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';
import { sendWelcomeEmail } from '@/lib/welcome-email';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
// POST /api/welcome — send a one-time welcome email to a landlord after profile setup
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await sendWelcomeEmail(user.id);
    return NextResponse.json(result);
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Welcome', message: _msg, details: _stack, endpoint: 'POST /api/welcome', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
