import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'

// POST /api/listings/[id]/deactivate
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
}
