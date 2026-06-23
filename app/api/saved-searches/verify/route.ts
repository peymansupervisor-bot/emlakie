import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.redirect(new URL('/rentals?alert=invalid', req.url));

    const sb = supabase();
    const { error } = await sb
      .from('saved_searches')
      .update({ verified: true })
      .eq('verify_token', token)
      .eq('verified', false);

    if (error) return NextResponse.redirect(new URL('/rentals?alert=invalid', req.url));

    return NextResponse.redirect(new URL('/rentals?alert=verified', req.url));
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Saved-searches › Verify', message: _msg, details: _stack, endpoint: 'GET /api/saved-searches/verify', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
