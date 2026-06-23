import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getModeratorSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { error } = await adminClient().from('moderators').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Moderators › :id', message: _msg, details: _stack, endpoint: 'DELETE /api/admin/moderators/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
