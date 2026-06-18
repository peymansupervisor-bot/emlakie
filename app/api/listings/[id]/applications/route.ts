import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/lib/supabase-server';

// GET /api/listings/[id]/applications — fetch all applicants for a listing the landlord owns
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the landlord owns this listing
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single();
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('applications')
    .select('id, listing_id, tenant_name, tenant_phone, message, income, credit_score, move_in, ai_match_score, ai_summary, status, created_at, source')
    .eq('listing_id', id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// PATCH /api/listings/[id]/applications — update a single application's status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { applicationId, status } = await req.json();
  if (!applicationId || !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Verify landlord owns the listing this application belongs to
  const { data: listing } = await supabase
    .from('listings')
    .select('id')
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single();
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .eq('listing_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  return NextResponse.json(data);
}
