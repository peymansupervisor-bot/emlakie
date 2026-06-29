import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { adminClient } from '@/lib/moderator';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export async function POST() {
  try {
    const sb = await createSupabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = adminClient();

    // Atomic: sequence advances only if profile update succeeds — no gaps
    const { data: accountId, error } = await admin
      .rpc('assign_account_id', { p_user_id: user.id });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!accountId) return NextResponse.json({ error: 'Could not generate account ID' }, { status: 500 });

    return NextResponse.json({ account_id: accountId });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Landlord › Assign-account-id', message: _msg, details: _stack, endpoint: 'POST /api/landlord/assign-account-id', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
