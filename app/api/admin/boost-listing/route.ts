export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DAYS: Record<string, number> = { '7day': 7, '30day': 30, '90day': 90 };

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (!adminSecret || adminSecret !== process.env.ADMIN_BYPASS_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { listingId, planId } = await req.json();
  const days = DAYS[planId];
  if (!listingId || !days) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  const boostedUntil = new Date();
  boostedUntil.setDate(boostedUntil.getDate() + days);

  const { error } = await supabase
    .from('listings')
    .update({ boosted_until: boostedUntil.toISOString() })
    .eq('id', listingId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, boosted_until: boostedUntil.toISOString() });
}
