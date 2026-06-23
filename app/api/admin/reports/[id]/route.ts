import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

import { logError } from '@/lib/log-error'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getModeratorSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { reviewed } = await req.json();
    const { error } = await adminClient().from('listing_reports').update({ reviewed: !!reviewed }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Reports › :id', message: _msg, details: _stack, endpoint: 'PATCH /api/admin/reports/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
