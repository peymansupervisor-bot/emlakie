import { NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

export const dynamic = 'force-dynamic';

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

  const ids = profiles.map((p) => p.id);

  const { error: updateErr } = await sb
    .from('profiles')
    .update({ folder_initialized_at: new Date().toISOString() })
    .in('id', ids);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ initialised: ids.length, total: ids.length });
}
