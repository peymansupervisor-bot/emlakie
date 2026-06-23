import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession } from '@/lib/moderator';

import { logError } from '@/lib/log-error'
export async function POST(req: NextRequest) {
  try {
    const session = await getModeratorSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = process.env.CRON_SECRET;
    if (!secret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
    const res = await fetch(`${origin}/api/cron/ada-audit`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    });

    if (!res.ok) return NextResponse.json({ error: 'ADA audit failed' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Run-ada-audit', message: _msg, details: _stack, endpoint: 'POST /api/admin/run-ada-audit', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
