import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
// POST /api/listings/[id]/deactivate
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createSupabaseWithToken(token)
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from('listings')
      .update({ status: 'deactivated' })
      .eq('id', id)
      .eq('landlord_id', user.id)

    if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Listings › :id › Deactivate', message: _msg, details: _stack, endpoint: 'POST /api/listings/[id]/deactivate', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
