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
  if (status === 'approved') {
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
        await resend.emails.send({
          from: 'EMLAKIE <notifications@emlakie.com>',
          to: tenantEmail,
          subject: `The landlord has responded to your inquiry — ${listing.address}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
              <h2 style="color:#16a34a">Good news, ${data.tenant_name ?? 'there'}!</h2>
              <p>The landlord at <strong>${listing.address}${location ? `, ${location}` : ''}</strong> has reviewed your inquiry and is ready to connect with you.</p>
              ${noteHtml}
              <p>Reply directly to this email or contact the landlord through the listing page to schedule a showing or ask questions.</p>
              <p style="margin:28px 0">
                <a href="${listingUrl}" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Listing</a>
              </p>
              <p style="color:#6b7280;font-size:13px">You submitted this inquiry on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. If you're no longer interested, you can ignore this message.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
              <p style="color:#9ca3af;font-size:12px">EMLAKIE · <a href="https://emlakie.com" style="color:#9ca3af">emlakie.com</a></p>
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
