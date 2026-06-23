import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });

    // Server-side sign-in: sets auth cookies directly in the response
    const sb = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll(); },
          setAll(toSet) {
            toSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Verify this user is a moderator
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Session error.' }, { status: 401 });

    const { data: mod } = await admin.from('moderators').select('email').eq('user_id', user.id).maybeSingle();
    if (!mod) {
      return NextResponse.json({ error: 'Access denied. You are not a moderator.' }, { status: 403 });
    }

    return response;
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Login', message: _msg, details: _stack, endpoint: 'POST /api/admin/login', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
