import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

// GET /api/conversations/[id] — get a conversation with all its messages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createSupabaseAdmin();

  // Verify landlord is part of this conversation
  const { data: conv } = await admin.from('conversations').select('id, listing_id, tenant_id, landlord_id').eq('id', id).eq('landlord_id', user.id).single();
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [messagesRes, listingRes, profileRes] = await Promise.all([
    admin.from('app_messages').select('id, sender_id, body, created_at, read_at').eq('conversation_id', id).order('created_at', { ascending: true }),
    admin.from('listings').select('id, address, city, state, slug').eq('id', conv.listing_id).single(),
    admin.from('profiles').select('id, display_name, first_name, last_name').eq('id', conv.tenant_id).maybeSingle(),
  ]);

  // Mark unread messages as read
  const unreadIds = (messagesRes.data ?? []).filter((m) => m.sender_id !== user.id && !m.read_at).map((m) => m.id);
  if (unreadIds.length > 0) {
    await admin.from('app_messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds);
  }

  const profile = profileRes.data;
  const tenantName = profile?.display_name ?? [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ?? 'Tenant';
  const listing = listingRes.data;

  return NextResponse.json({
    id: conv.id,
    listing: listing ? { id: listing.id, address: listing.address, city: listing.city, state: listing.state, slug: listing.slug } : null,
    tenant_name: tenantName,
    landlord_id: conv.landlord_id,
    messages: (messagesRes.data ?? []).map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      body: m.body,
      created_at: m.created_at,
      from_landlord: m.sender_id === user.id,
    })),
  });
}
