import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
    const session = await getModeratorSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 });

    const sb = adminClient();

    // Look up the user by email in auth.users
    const { data: users, error: lookupErr } = await sb.auth.admin.listUsers();
    if (lookupErr) return NextResponse.json({ error: 'Could not look up users.' }, { status: 500 });

    const match = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!match) return NextResponse.json({ error: 'No EMLAKIE account found for that email.' }, { status: 404 });

    const { error } = await sb.from('moderators').insert({ user_id: match.id, email: match.email });
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Already a moderator.' }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Moderators', message: _msg, details: _stack, endpoint: 'POST /api/admin/moderators', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
