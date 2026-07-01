import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithToken } from '@/lib/supabase-server'

import { logError } from '@/lib/log-error'
import { LISTING_PERIOD_MS, MAX_LISTING_EXTENSIONS } from '@/lib/listing-lifecycle'

export const dynamic = 'force-dynamic'

// POST /api/listings/[id]/extend — add 45 days to expires_at, up to MAX_LISTING_EXTENSIONS times
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createSupabaseWithToken(token)
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get current expires_at
    const { data: listing } = await supabase
      .from('listings')
      .select('expires_at, status, extension_count')
      .eq('id', id)
      .eq('landlord_id', user.id)
      .single()

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    if ((listing.extension_count ?? 0) >= MAX_LISTING_EXTENSIONS) {
      return NextResponse.json(
        { error: 'This listing has used all of its extensions and is permanently off-market. Create a new listing to re-list this property.' },
        { status: 400 },
      )
    }

    const base = listing.status === 'expired' || !listing.expires_at
      ? new Date()
      : new Date(listing.expires_at)
    const newExpiry = new Date(base.getTime() + LISTING_PERIOD_MS)

    const { data, error } = await supabase
      .from('listings')
      .update({
        expires_at: newExpiry.toISOString(),
        status: 'active',
        extension_count: (listing.extension_count ?? 0) + 1,
      })
      .eq('id', id)
      .eq('landlord_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    return NextResponse.json(data)
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Listings › :id › Extend', message: _msg, details: _stack, endpoint: 'POST /api/listings/[id]/extend', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
