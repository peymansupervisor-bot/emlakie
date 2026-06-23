import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
const VALID_REASONS = [
  'Scam or fraud',
  'Inaccurate listing information',
  'Inappropriate photos',
  'Discriminatory content',
  'Already rented / no longer available',
  'Duplicate listing',
  'Other',
];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: listingId } = await params;
    const { reason, details } = await req.json();

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason.' }, { status: 400 });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;

    const { error } = await sb.from('listing_reports').insert({
      listing_id: listingId,
      reason,
      details: details?.trim().slice(0, 1000) || null,
      reporter_ip: ip,
    });

    if (error) return NextResponse.json({ error: 'Could not submit report.' }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Listings › :id › Report', message: _msg, details: _stack, endpoint: 'POST /api/listings/[id]/report', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
