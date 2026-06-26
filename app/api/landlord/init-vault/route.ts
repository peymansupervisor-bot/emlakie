import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

const VAULT_FOLDERS = [
  'photos/.keep',
  'documents/.keep',
  'media/.keep',
];

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

  const failed: string[] = [];

  for (const path of VAULT_FOLDERS) {
    const fullPath = `${user.id}/${path}`;
    // Use the landlord's own session so auth.uid() matches the folder path
    const { error } = await supabase.storage
      .from('listing-photos')
      .upload(fullPath, new Blob([''], { type: 'text/plain' }), { upsert: true });
    if (error && !error.message.includes('already exists')) {
      failed.push(`${fullPath}: ${error.message}`);
    }
  }

  if (failed.length > 0) {
    // Log every failure — this must never be silent
    await logError({
      source: 'VaultInit',
      message: `Storage vault init failed for landlord ${profile?.account_id ?? user.id}`,
      details: failed.join(' | '),
      endpoint: 'POST /api/landlord/init-vault',
      http_status: 500,
    });
    return NextResponse.json({ error: 'Vault init failed', details: failed }, { status: 500 });
  }

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
    // Storage folders were created — return ok so landlord isn't blocked.
    // Next login will retry marking initialized.
  }

  return NextResponse.json({ ok: true });
}
