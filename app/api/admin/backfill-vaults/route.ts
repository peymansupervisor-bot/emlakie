import { NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

export const dynamic = 'force-dynamic';

const VAULT_FOLDERS = ['photos/.keep', 'documents/.keep', 'media/.keep'];

export async function POST() {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = adminClient();

  const { data: profiles, error: queryErr } = await sb
    .from('profiles')
    .select('id')
    .is('folder_initialized_at', null)
    .neq('role', 'tenant')
    .lt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

  if (queryErr) return NextResponse.json({ error: queryErr.message }, { status: 500 });
  if (!profiles?.length) return NextResponse.json({ initialised: 0, total: 0 });

  let initialised = 0;
  const storageErrors: string[] = [];
  const updateErrors: string[] = [];

  for (const profile of profiles) {
    let storageFailed = false;

    for (const path of VAULT_FOLDERS) {
      const fullPath = `${profile.id}/${path}`;
      const { error: uploadErr } = await sb.storage
        .from('listing-photos')
        .upload(fullPath, Buffer.from(''), { contentType: 'text/plain', upsert: true });

      if (uploadErr && !uploadErr.message.toLowerCase().includes('already exist')) {
        storageErrors.push(`${profile.id}/${path}: ${uploadErr.message}`);
        storageFailed = true;
      }
    }

    if (storageFailed) continue;

    const { error: updateErr } = await sb
      .from('profiles')
      .update({ folder_initialized_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (updateErr) {
      updateErrors.push(`${profile.id}: ${updateErr.message}`);
    } else {
      initialised++;
    }
  }

  return NextResponse.json({
    initialised,
    total: profiles.length,
    storageErrors,
    updateErrors,
  });
}
