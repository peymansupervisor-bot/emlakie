import { NextRequest, NextResponse } from 'next/server';
import { adminClient, getModeratorSession } from '@/lib/moderator';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!await getModeratorSession()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { source } = await req.json().catch(() => ({}));
  const sb = adminClient();

  let query = sb.from('system_error_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (source) query = (query as typeof query).eq('source', source);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
