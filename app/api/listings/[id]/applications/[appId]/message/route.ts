import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const { id, appId } = await params;
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseWithToken(token);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

  // Verify landlord owns the listing
  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, address, city, state, slug')
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single();
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Get application (tenant contact info)
  const { data: app } = await supabase
    .from('applications')
    .select('id, tenant_name, tenant_email, tenant_phone')
    .eq('id', appId)
    .eq('listing_id', id)
    .single();
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const tenantEmail = app.tenant_email;
  if (!tenantEmail) return NextResponse.json({ error: 'Tenant has no email on file' }, { status: 422 });

  // Get landlord display name and phone
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name, phone')
    .eq('id', user.id)
    .single();

  const landlordName = profile?.display_name ?? 'Your landlord';
  const landlordPhone = profile?.phone ?? null;
  const listingUrl = `https://emlakie.com/rentals/${listing.slug ?? listing.id}`;
  const location = [listing.city, listing.state].filter(Boolean).join(', ');

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'EMLAKIE <notifications@emlakie.com>',
    to: tenantEmail,
    subject: `Message from your landlord — ${listing.address}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;background:#f3f4f6;padding:32px 16px;">
        <div style="background:#16a34a;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">EMLAKIE</p>
          <p style="margin:4px 0 0;font-size:13px;color:#bbf7d0;">Message from your landlord</p>
        </div>
        <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 32px;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${app.tenant_name ?? 'there'}</strong>,</p>
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Regarding: <strong>${listing.address}${location ? `, ${location}` : ''}</strong></p>
          <div style="margin:16px 0;padding:16px 20px;background:#f9fafb;border-left:4px solid #16a34a;border-radius:6px;font-size:15px;color:#111827;line-height:1.7;white-space:pre-wrap;">${message.trim()}</div>
          <p style="margin:20px 0 8px;font-size:13px;color:#374151;font-weight:600;">How to reach ${landlordName}:</p>
          ${landlordPhone ? `<p style="margin:0 0 4px;font-size:14px;color:#374151;">📞 ${landlordPhone}</p>` : ''}
          <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">You can also view the listing for more details.</p>
          <a href="${listingUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">View Listing</a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="margin:0;font-size:12px;color:#9ca3af;">EMLAKIE · <a href="https://emlakie.com" style="color:#9ca3af;">emlakie.com</a></p>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
