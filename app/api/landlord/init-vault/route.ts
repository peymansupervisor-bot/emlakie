import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createSupabaseAdmin();

  const { data: profile } = await admin
    .from('profiles')
    .select('folder_initialized_at, account_id')
    .eq('id', user.id)
    .single();

  if (profile?.folder_initialized_at) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  // Supabase Storage folders are virtual — they are created implicitly when the
  // first real file is uploaded. No placeholder files are needed. Just mark the
  // vault as initialized so the health probe stops reporting it as missing.
  const { error: updateErr } = await admin
    .from('profiles')
    .update({ folder_initialized_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updateErr) {
    await logError({
      source: 'VaultInit',
      message: `Could not mark vault as initialized for landlord ${profile?.account_id ?? user.id}`,
      details: updateErr.message,
      endpoint: 'POST /api/landlord/init-vault',
      http_status: 500,
    });
    return NextResponse.json({ error: 'Vault init failed', details: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
