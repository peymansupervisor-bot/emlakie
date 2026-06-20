import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession } from '@/lib/moderator';

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
  const res = await fetch(`${origin}/api/cron/health-check`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secret}` },
  });

  if (!res.ok) return NextResponse.json({ error: 'Health check failed' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
