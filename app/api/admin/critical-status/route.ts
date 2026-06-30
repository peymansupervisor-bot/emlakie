import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseWithToken } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ADMIN_USER_ID = 'da34cd86-ffa8-49f9-96d5-0daa3dec8953';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userSb = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await userSb.auth.getUser();
  if (authErr || !user || user.id !== ADMIN_USER_ID) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const database = sb();

  // Latest status for each critical flow
  const [signupRow, listingsRow, aiRow] = await Promise.all([
    database.from('system_health').select('status, message, checked_at').eq('service', 'Critical: Landlord Signup').order('checked_at', { ascending: false }).limit(1).maybeSingle(),
    database.from('system_health').select('status, message, checked_at').eq('service', 'Critical: Listing Creation').order('checked_at', { ascending: false }).limit(1).maybeSingle(),
    database.from('system_health').select('status, message, checked_at').eq('service', 'Critical: AI Leasing Assistant').order('checked_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  // Recent critical errors (last 24h)
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentErrors } = await database
    .from('system_error_log')
    .select('source, message, endpoint, created_at')
    .gte('created_at', since24h)
    .or('source.ilike.Listing Create%,source.ilike.AI Assistant%,source.ilike.Landlord Auth%,source.ilike.Critical Check%')
    .order('created_at', { ascending: false })
    .limit(20);

  // Env var readiness
  const envStatus = {
    supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    openai_key: !!process.env.OPENAI_API_KEY,
    ai_enabled: process.env.ENABLE_AI_ASSISTANT === 'true',
    resend: !!process.env.RESEND_API_KEY,
  };

  return NextResponse.json({
    critical: {
      signup: signupRow.data,
      listings: listingsRow.data,
      ai: aiRow.data,
    },
    recent_errors: recentErrors ?? [],
    env: envStatus,
    checked_at: new Date().toISOString(),
  });
}
