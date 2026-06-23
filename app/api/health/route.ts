import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
// Lightweight public health endpoint — checks only critical features.
// Returns 200 if everything is ok, 500 if any critical check fails.
// Safe to expose publicly (no secrets in response).
export async function GET() {
  try {
    const failures: string[] = [];

    // 1. Supabase DB
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { error } = await sb.from('listings').select('id').limit(1);
      if (error) failures.push('database');
    } catch {
      failures.push('database');
    }

    // 2. Supabase Storage (photo bucket)
    try {
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      const { error } = await sb.storage.from('listing-photos').list('', { limit: 1 });
      if (error) failures.push('photo-storage');
    } catch {
      failures.push('photo-storage');
    }

    // 3. Resend email API
    try {
      const key = process.env.RESEND_API_KEY;
      if (!key) {
        failures.push('email');
      } else {
        const res = await fetch('https://api.resend.com/domains', {
          headers: { Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(5000),
        });
        if (res.status !== 200) failures.push('email');
      }
    } catch {
      failures.push('email');
    }

    if (failures.length > 0) {
      return NextResponse.json(
        { status: 'degraded', failures },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: 'ok' });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Health', message: _msg, details: _stack, endpoint: 'GET /api/health', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
