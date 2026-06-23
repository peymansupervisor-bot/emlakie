import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const { id, appId } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify identity with user token
    const userClient = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify landlord owns the listing using user-scoped client
    const { data: listing } = await userClient
      .from('listings')
      .select('id')
      .eq('id', id)
      .eq('landlord_id', user.id)
      .single();
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Use admin client for the delete so RLS doesn't block it
    const admin = createSupabaseAdmin();
    const { error } = await admin
      .from('applications')
      .delete()
      .eq('id', appId)
      .eq('listing_id', id);

    if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Listings › :id › Applications › :id', message: _msg, details: _stack, endpoint: 'DELETE /api/listings/[id]/applications/[appId]', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
