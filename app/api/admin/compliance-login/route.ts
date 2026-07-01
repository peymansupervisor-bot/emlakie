import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });

  // Server-side sign-in: sets auth cookies directly in the response, matching
  // how middleware.ts and requireAdmin() read the session — signing in via
  // the client-side (localStorage) supabase client here would leave the
  // cookie session unset and the whole /admin area unreachable.
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
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Session error.' }, { status: 401 });

  const admin = createSupabaseAdmin();
  const { data: adminUser } = await admin
    .from('compliance_admin_users')
    .select('is_active')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminUser?.is_active) {
    await sb.auth.signOut();
    // Must carry over response's queued cookies (sign-in then signOut's
    // clearing calls both wrote to `response`) — returning a fresh
    // NextResponse here would drop those and leave the session cookies set.
    const forbidden = NextResponse.json({ error: 'Access denied. You are not an active admin.' }, { status: 403 });
    response.cookies.getAll().forEach((c) => forbidden.cookies.set(c));
    return forbidden;
  }

  return response;
}
