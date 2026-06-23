import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

import { logError } from '@/lib/log-error'
// GET /api/conversations — list all conversations for the logged-in landlord
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createSupabaseAdmin();

    const { data, error } = await admin
      .from('conversations')
      .select('id, listing_id, tenant_id, last_message, last_message_at, created_at')
      .eq('landlord_id', user.id)
      .order('last_message_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data?.length) return NextResponse.json([]);

    // Enrich with listing address and tenant name
    const listingIds = Array.from(new Set(data.map((c) => c.listing_id).filter(Boolean)));
    const tenantIds = Array.from(new Set(data.map((c) => c.tenant_id).filter(Boolean)));

    const [listingsRes, profilesRes, unreadRes] = await Promise.all([
      admin.from('listings').select('id, address, city, state').in('id', listingIds),
      admin.from('profiles').select('id, display_name, first_name, last_name').in('id', tenantIds),
      admin.from('app_messages')
        .select('conversation_id')
        .in('conversation_id', data.map((c) => c.id))
        .neq('sender_id', user.id)
        .is('read_at', null),
    ]);

    const listingMap = Object.fromEntries((listingsRes.data ?? []).map((l) => [l.id, l]));
    const profileMap = Object.fromEntries((profilesRes.data ?? []).map((p) => [p.id, p]));
    const unreadSet = new Set((unreadRes.data ?? []).map((m) => m.conversation_id));

    const enriched = data.map((c) => {
      const listing = listingMap[c.listing_id];
      const profile = profileMap[c.tenant_id];
      const tenantName = profile?.display_name
        ?? [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
        ?? 'Tenant';
      return {
        id: c.id,
        listing_id: c.listing_id,
        listing_title: listing ? `${listing.address}, ${listing.city}` : null,
        tenant_name: tenantName,
        last_message: c.last_message,
        last_message_at: c.last_message_at,
        unread: unreadSet.has(c.id),
      };
    });

    return NextResponse.json(enriched);
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Conversations', message: _msg, details: _stack, endpoint: 'GET /api/conversations', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}

// POST /api/conversations — find or create conversation for a listing+tenant (from application)
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { listing_id, application_id } = await req.json();
    if (!listing_id || !application_id) return NextResponse.json({ error: 'listing_id and application_id required' }, { status: 400 });

    const admin = createSupabaseAdmin();

    // Verify landlord owns the listing
    const { data: listing } = await admin.from('listings').select('id, address, city, state').eq('id', listing_id).eq('landlord_id', user.id).single();
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Get application for tenant info
    const { data: app } = await admin.from('applications').select('id, tenant_id, tenant_name, tenant_email, message, created_at').eq('id', application_id).eq('listing_id', listing_id).single();
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    // Find existing conversation or create one
    const { data: existing } = await admin.from('conversations').select('id').eq('listing_id', listing_id).eq('landlord_id', user.id).eq('tenant_id', app.tenant_id ?? application_id).maybeSingle();

    if (existing) return NextResponse.json({ id: existing.id });

    const now = new Date().toISOString();
    const { data: conv, error: convErr } = await admin.from('conversations').insert({
      listing_id,
      landlord_id: user.id,
      tenant_id: app.tenant_id ?? application_id,
      last_message: app.message,
      last_message_at: app.created_at ?? now,
      created_at: now,
    }).select('id').single();

    if (convErr || !conv) return NextResponse.json({ error: convErr?.message ?? 'Failed to create conversation' }, { status: 500 });

    // Seed the first message from the application
    if (app.message) {
      await admin.from('app_messages').insert({
        conversation_id: conv.id,
        sender_id: app.tenant_id ?? application_id,
        body: app.message,
        created_at: app.created_at ?? now,
      });
    }

    return NextResponse.json({ id: conv.id });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Conversations', message: _msg, details: _stack, endpoint: 'POST /api/conversations', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
