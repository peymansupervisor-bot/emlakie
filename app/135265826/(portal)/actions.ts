'use server';

import { adminClient } from '@/lib/moderator';
import { getModeratorSession } from '@/lib/moderator';

export async function assignPropertyGroup(ids: string[], group: string | null) {
  const session = await getModeratorSession();
  if (!session) throw new Error('Unauthorized');
  if (ids.length === 0) return;

  const sb = adminClient();
  await sb.from('listings').update({ property_group: group }).in('id', ids);
}
