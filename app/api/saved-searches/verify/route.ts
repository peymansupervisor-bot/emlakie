import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
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
}
