import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error';
import { cronRun } from '@/lib/cron-runner';

export const dynamic = 'force-dynamic';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// GET /api/cron/expire-listings — daily sweep that flips any active listing whose
// expires_at has passed to status 'expired'. Listings that have already used both
// of their extensions (extension_count >= 2, see lib/listing-lifecycle.ts) have no
// "Extend" option left in the landlord UI, so this is the point they permanently go
// off-market; listings still under the cap can still be revived via Extend.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '');
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return await cronRun('Listing Expiration Cron', async (record) => {
      const sb = supabase();
      const now = new Date().toISOString();

      const { data, error } = await sb
        .from('listings')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', now)
        .select('id');

      if (error) {
        record(`Failed to expire listings: ${error.message}`, 'degraded');
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const count = data?.length ?? 0;
      record(`Run — expired ${count} listing${count === 1 ? '' : 's'}`);
      return NextResponse.json({ expired: count });
    });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Cron › Expire-listings', message: _msg, details: _stack, endpoint: 'GET /api/cron/expire-listings', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
