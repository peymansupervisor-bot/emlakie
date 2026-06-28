import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession } from '@/lib/moderator';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
  const res = await fetch(`${origin}/api/cron/send-alerts`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    await logError('Send Alerts Cron', `Cron returned ${res.status}`, body || undefined);
    return NextResponse.json({ error: 'Cron failed', details: body }, { status: 502 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: true, sent: data.sent ?? 0 });
}
