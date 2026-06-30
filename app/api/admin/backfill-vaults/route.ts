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
  const now = new Date().toISOString();

  for (const profile of profiles) {
    // Create the vault folders in storage using service role
    for (const folder of VAULT_FOLDERS) {
      await sb.storage
        .from('listing-photos')
        .upload(`${profile.id}/${folder}`, new Blob([''], { type: 'application/octet-stream' }), { upsert: true });
    }

    const { error: updateErr } = await sb
      .from('profiles')
      .update({ folder_initialized_at: now })
      .eq('id', profile.id);

    if (!updateErr) initialised++;
  }

  return NextResponse.json({ initialised, total: profiles.length });
}
