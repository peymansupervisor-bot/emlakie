import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'

// PUT /api/listings/[id] — update status, title, price, etc.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Map frontend field names to DB column names
  const { price, ...rest } = body as { price?: number; [key: string]: unknown }
  const dbPayload = { ...rest, ...(price !== undefined ? { monthly_rent: price } : {}) }

  const { data, error } = await supabase
    .from('listings')
    .update(dbPayload)
    .eq('id', id)
    .eq('landlord_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
