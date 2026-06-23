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

    // Check if they already have one — never overwrite
    const { data: profile } = await admin
      .from('profiles')
      .select('account_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.account_id) {
      return NextResponse.json({ account_id: profile.account_id });
    }

    // Get the next sequence value directly from the DB
    const { data: seqRow } = await admin
      .rpc('next_account_id');

    if (!seqRow) return NextResponse.json({ error: 'Could not generate account ID' }, { status: 500 });

    const { error } = await admin
      .from('profiles')
      .update({ account_id: seqRow })
      .eq('id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ account_id: seqRow });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Landlord › Assign-account-id', message: _msg, details: _stack, endpoint: 'POST /api/landlord/assign-account-id', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
