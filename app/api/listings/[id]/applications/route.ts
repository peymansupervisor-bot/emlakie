import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

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

  const { applicationId, status, note } = await req.json();
  if (!applicationId || !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Verify landlord owns the listing and fetch details for the email
  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, address, city, state, slug')
    .eq('id', id)
    .eq('landlord_id', user.id)
    .single();
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .eq('listing_id', id)
    .select('id, tenant_id, tenant_name, tenant_email, status')
    .single();

  if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });

  // Send confirmation email to applicant when landlord responds
  if (status === 'approved' || status === 'rejected') {
    try {
      // Prefer stored email; fall back to auth email for logged-in tenants
      let tenantEmail = data?.tenant_email ?? null;
      if (!tenantEmail && data?.tenant_id) {
        const admin = createSupabaseAdmin();
        const { data: { user: tenantAuth } } = await admin.auth.admin.getUserById(data.tenant_id);
        tenantEmail = tenantAuth?.email ?? null;
      }
      if (tenantEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const listingUrl = `https://emlakie.com/rentals/${listing.slug ?? listing.id}`;
        const location = [listing.city, listing.state].filter(Boolean).join(', ');
        const noteHtml = note
          ? `<div style="margin:16px 0;padding:14px 18px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;font-size:14px;color:#166534;line-height:1.6;">${note}</div>`
          : '';
        const isApproved = status === 'approved';
        await resend.emails.send({
          from: 'EMLAKIE <notifications@emlakie.com>',
          to: tenantEmail,
          subject: isApproved
            ? `Great news — the landlord wants to connect! — ${listing.address}`
            : `Update on your inquiry — ${listing.address}`,
          html: isApproved ? `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;background:#f3f4f6;padding:32px 16px;">
              <div style="background:#16a34a;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
                <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">EMLAKIE</p>
                <p style="margin:4px 0 0;font-size:13px;color:#bbf7d0;">Great news!</p>
              </div>
              <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 32px;">
                <h2 style="margin:0 0 12px;color:#16a34a;font-size:20px;">The landlord wants to connect, ${data.tenant_name?.split(' ')[0] ?? 'there'}!</h2>
                <p style="margin:0 0 8px;font-size:14px;color:#374151;">The landlord at <strong>${listing.address}${location ? `, ${location}` : ''}</strong> has reviewed your inquiry and is ready to move forward.</p>
                ${noteHtml}
                <p style="font-size:14px;color:#374151;">Reply to this email or contact the landlord through the listing page to schedule a showing.</p>
                <a href="${listingUrl}" style="display:inline-block;margin-top:20px;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">View Listing</a>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                <p style="margin:0;font-size:12px;color:#9ca3af;">EMLAKIE · <a href="https://emlakie.com" style="color:#9ca3af;">emlakie.com</a></p>
              </div>
            </div>
          ` : `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;background:#f3f4f6;padding:32px 16px;">
              <div style="background:#374151;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
                <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">EMLAKIE</p>
                <p style="margin:4px 0 0;font-size:13px;color:#d1d5db;">Update on your inquiry</p>
              </div>
              <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 32px;">
                <p style="margin:0 0 12px;font-size:15px;color:#374151;">Hi <strong>${data.tenant_name?.split(' ')[0] ?? 'there'}</strong>,</p>
                <p style="margin:0 0 12px;font-size:14px;color:#374151;">Thank you for your interest in <strong>${listing.address}${location ? `, ${location}` : ''}</strong>. Unfortunately, the landlord has moved forward with another applicant at this time.</p>
                ${note ? `<div style="margin:16px 0;padding:14px 18px;background:#f9fafb;border-left:4px solid #9ca3af;border-radius:6px;font-size:14px;color:#374151;line-height:1.6;">${note}</div>` : ''}
                <p style="font-size:14px;color:#374151;">Don't give up — new listings are added daily on EMLAKIE.</p>
                <a href="https://emlakie.com/rentals" style="display:inline-block;margin-top:20px;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">Browse More Rentals</a>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
                <p style="margin:0;font-size:12px;color:#9ca3af;">EMLAKIE · <a href="https://emlakie.com" style="color:#9ca3af;">emlakie.com</a></p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('[applications] Failed to send response email:', emailErr);
    }
  }

  return NextResponse.json(data);
}
