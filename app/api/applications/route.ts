import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';

// GET /api/applications — fetch all applications across all landlord's listings in one query
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('applications')
    .select('id, listing_id, tenant_name, tenant_phone, message, income, credit_score, move_in, ai_match_score, ai_summary, status, created_at, source, listings!inner(address, landlord_id)')
    .eq('listings.landlord_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = (data ?? []).map((a: Record<string, unknown>) => {
    const listing = a.listings as { address: string } | null;
    return {
      id: a.id,
      listing_id: a.listing_id,
      tenant_name: a.tenant_name,
      tenant_phone: a.tenant_phone,
      message: a.message,
      income: a.income,
      credit_score: a.credit_score,
      move_in: a.move_in,
      ai_match_score: a.ai_match_score,
      ai_summary: a.ai_summary,
      status: a.status,
      created_at: a.created_at,
      source: a.source,
      listingAddress: listing?.address ?? null,
    };
  });

  return NextResponse.json(mapped);
}
