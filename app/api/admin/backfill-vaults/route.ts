import { NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';
import { createSupabaseAdmin } from '@/lib/supabase-server';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

const VAULT_FOLDERS = ['photos/.keep', 'documents/.keep', 'media/.keep'];

export async function POST() {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = adminClient();
  const admin = createSupabaseAdmin();

  // Find all non-tenant landlords with uninitialised vaults older than 10 min
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('id, account_id')
    .is('folder_initialized_at', null)
    .neq('role', 'tenant')
    .lt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!profiles?.length) return NextResponse.json({ initialised: 0, total: 0 });

  let initialised = 0;
  const errors: string[] = [];

  for (const profile of profiles) {
    const failed: string[] = [];

    for (const path of VAULT_FOLDERS) {
      const fullPath = `${profile.id}/${path}`;
      const { error: uploadErr } = await admin.storage
        .from('listing-photos')
        .upload(fullPath, new Blob([''], { type: 'text/plain' }), { upsert: true });
      if (uploadErr && !uploadErr.message.includes('already exists')) {
        failed.push(`${fullPath}: ${uploadErr.message}`);
      }
    }

    if (failed.length > 0) {
      await logError({
        source: 'Admin › BackfillVaults',
        message: `Vault init failed for ${profile.account_id ?? profile.id}`,
        details: failed.join(' | '),
        endpoint: 'POST /api/admin/backfill-vaults',
        http_status: 500,
      });
      errors.push(profile.account_id ?? profile.id);
      continue;
    }

    const { error: updateErr } = await sb
      .from('profiles')
      .update({ folder_initialized_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (updateErr) {
      errors.push(`${profile.account_id ?? profile.id}: mark failed`);
    } else {
      initialised++;
    }
  }

  return NextResponse.json({ initialised, total: profiles.length, errors });
}
