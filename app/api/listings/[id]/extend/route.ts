import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'

// POST /api/listings/[id]/extend — add 45 days to expires_at
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get current expires_at
  const { data: listing } = await supabase
    .from('listings')
    .select('expires_at, status')
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single()

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const base = listing.status === 'expired' || !listing.expires_at
    ? new Date()
    : new Date(listing.expires_at)
  const newExpiry = new Date(base.getTime() + 45 * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('listings')
    .update({ expires_at: newExpiry.toISOString(), status: 'active' })
    .eq('id', id)
    .eq('landlord_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  return NextResponse.json(data)
}
