import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic'

// Rate-limit: max 20 client errors per IP per minute (in-memory, resets on cold start)
const ipCounts = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.reset) {
    ipCounts.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 20;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const source = typeof body.source === 'string' ? body.source.slice(0, 100) : 'Client';
  const message = typeof body.message === 'string' ? body.message.slice(0, 1000) : 'Unknown error';
  const details = typeof body.details === 'string' ? body.details.slice(0, 5000) : undefined;
  const userId = typeof body.user_id === 'string' ? body.user_id : undefined;
  const endpoint = typeof body.endpoint === 'string' ? body.endpoint.slice(0, 200) : undefined;
  const httpStatus = typeof body.http_status === 'number' ? body.http_status : undefined;
  const context = body.context && typeof body.context === 'object' && !Array.isArray(body.context)
    ? body.context as Record<string, unknown>
    : undefined;

  await logError({ source, message, details, user_id: userId, endpoint, http_status: httpStatus, context });
  return NextResponse.json({ ok: true });
}
