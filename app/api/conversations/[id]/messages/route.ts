import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
// POST /api/conversations/[id]/messages — landlord sends a message, emails tenant
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { body } = await req.json();
    if (!body?.trim()) return NextResponse.json({ error: 'Message body is required' }, { status: 400 });

    const admin = createSupabaseAdmin();

    // Verify landlord owns this conversation
    const { data: conv } = await admin.from('conversations').select('id, listing_id, tenant_id, landlord_id').eq('id', id).eq('landlord_id', user.id).single();
    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const now = new Date().toISOString();

    // Insert message + update conversation's last_message
    const [msgRes] = await Promise.all([
      admin.from('app_messages').insert({ conversation_id: id, sender_id: user.id, body: body.trim(), created_at: now }).select('id, sender_id, body, created_at').single(),
      admin.from('conversations').update({ last_message: body.trim(), last_message_at: now }).eq('id', id),
    ]);

    if (msgRes.error) return NextResponse.json({ error: msgRes.error.message }, { status: 500 });

    // Email the tenant
    try {
      const [listingRes, landlordProfileRes, tenantProfileRes, tenantAuthRes] = await Promise.all([
        admin.from('listings').select('address, city, state, slug').eq('id', conv.listing_id).single(),
        admin.from('profiles').select('display_name, phone').eq('id', user.id).single(),
        admin.from('profiles').select('display_name, first_name, last_name, email').eq('id', conv.tenant_id).maybeSingle(),
        admin.auth.admin.getUserById(conv.tenant_id),
      ]);

      const listing = listingRes.data;
      const landlordName = landlordProfileRes.data?.display_name ?? 'Your landlord';
      const tenantProfile = tenantProfileRes.data;
      const tenantName = tenantProfile?.display_name ?? [tenantProfile?.first_name, tenantProfile?.last_name].filter(Boolean).join(' ') ?? 'there';
      const tenantEmail = tenantProfile?.email ?? tenantAuthRes.data?.user?.email ?? null;

      if (tenantEmail && listing) {
        const listingUrl = `https://emlakie.com/rentals/${listing.slug ?? conv.listing_id}`;
        const location = [listing.city, listing.state].filter(Boolean).join(', ');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'EMLAKIE <notifications@emlakie.com>',
          to: tenantEmail,
          subject: `New message from your landlord — ${listing.address}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;background:#f3f4f6;padding:32px 16px;">
              <div style="background:#16a34a;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
                <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">EMLAKIE</p>
                <p style="margin:4px 0 0;font-size:13px;color:#bbf7d0;">You have a new message</p>
              </div>
              <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 32px;">
                <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hi <strong>${tenantName}</strong>,</p>
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Re: <strong>${listing.address}${location ? `, ${location}` : ''}</strong></p>
                <div style="margin:16px 0;padding:16px 20px;background:#f9fafb;border-left:4px solid #16a34a;border-radius:6px;font-size:15px;color:#111827;line-height:1.7;white-space:pre-wrap;">${body.trim()}</div>
                ${landlordProfileRes.data?.phone ? `<p style="font-size:13px;color:#374151;">You can also reach ${landlordName} at <strong>${landlordProfileRes.data.phone}</strong>.</p>` : ''}
                <a href="${listingUrl}" style="display:inline-block;margin-top:16px;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">View Listing</a>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                <p style="margin:0;font-size:12px;color:#9ca3af;">EMLAKIE · <a href="https://emlakie.com" style="color:#9ca3af;">emlakie.com</a></p>
              </div>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error('[conversations/messages] email failed:', e);
    }

    return NextResponse.json({
      id: msgRes.data?.id,
      sender_id: user.id,
      body: body.trim(),
      created_at: now,
      from_landlord: true,
    });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Conversations › :id › Messages', message: _msg, details: _stack, endpoint: 'POST /api/conversations/[id]/messages', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
