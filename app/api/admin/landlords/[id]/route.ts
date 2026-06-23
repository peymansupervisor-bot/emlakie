import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
async function auth() {
  return await getModeratorSession();
}

// PATCH: suspend or unsuspend a landlord
// body: { action: 'suspend' | 'unsuspend' }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const { action } = await req.json();

    if (action !== 'suspend' && action !== 'unsuspend') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const sb = adminClient();

    // Ban/unban the auth user — 87600h = 10 years (effectively permanent)
    const { error: authErr } = await sb.auth.admin.updateUserById(id, {
      ban_duration: action === 'suspend' ? '87600h' : 'none',
    });
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 });

    // Also suspend/unsuspend all their listings
    if (action === 'suspend') {
      await sb.from('listings').update({ status: 'suspended' }).eq('landlord_id', id);
    } else {
      // Restore suspended listings back to active
      await sb.from('listings').update({ status: 'active' }).eq('landlord_id', id).eq('status', 'suspended');
    }

    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Landlords › :id', message: _msg, details: _stack, endpoint: 'PATCH /api/admin/landlords/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}

// DELETE: permanently delete a landlord account and all their data
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const sb = adminClient();

    // Delete all their listings first
    await sb.from('listings').delete().eq('landlord_id', id);

    // Delete the profile row (not cascaded automatically)
    await sb.from('profiles').delete().eq('id', id);

    // Delete the auth user
    const { error } = await sb.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Landlords › :id', message: _msg, details: _stack, endpoint: 'DELETE /api/admin/landlords/[id]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
