import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.redirect(new URL('/', req.url));

    const sb = supabase();
    const { error } = await sb
      .from('profiles')
      .update({ news_unsubscribed_at: new Date().toISOString() })
      .eq('news_unsubscribe_token', token);

    if (error) return NextResponse.redirect(new URL('/', req.url));

    return NextResponse.redirect(new URL('/unsubscribed', req.url));
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Landlord News › Unsubscribe', message: _msg, details: _stack, endpoint: 'GET /api/landlord/news-unsubscribe', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
