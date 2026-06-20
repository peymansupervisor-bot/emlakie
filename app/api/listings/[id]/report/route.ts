import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const VALID_REASONS = [
  'Scam or fraud',
  'Inaccurate listing information',
  'Inappropriate photos',
  'Discriminatory content',
  'Already rented / no longer available',
  'Duplicate listing',
  'Other',
];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: listingId } = await params;
  const { reason, details } = await req.json();

  if (!reason || !VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: 'Invalid reason.' }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;

  const { error } = await sb.from('listing_reports').insert({
    listing_id: listingId,
    reason,
    details: details?.trim().slice(0, 1000) || null,
    reporter_ip: ip,
  });

  if (error) return NextResponse.json({ error: 'Could not submit report.' }, { status: 500 });

  // Fetch listing title for the email
  const { data: listing } = await sb
    .from('listings')
    .select('title, city, state, slug')
    .eq('id', listingId)
    .maybeSingle();

  // Send immediate notification email — fire and forget (don't block the response)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const listingUrl = `https://emlakie.com/rentals/${listing?.slug ?? listingId}`;
    const reviewUrl = `https://emlakie.com/135265826/flags`;
    resend.emails.send({
      from: 'EMLAKIE Flags <alerts@emlakie.com>',
      to: 'peymansupervisor@gmail.com',
      subject: `🚩 Listing flagged: "${listing?.title ?? listingId}"`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
          <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 20px">EMLAKIE</p>
          <h1 style="font-size:18px;font-weight:800;color:#111;margin:0 0 16px">A listing has been flagged</h1>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
            <tr style="background:#f9fafb;">
              <td style="padding:10px 14px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;width:120px;">Listing</td>
              <td style="padding:10px 14px;font-size:14px;color:#111;font-weight:600;">${listing?.title ?? listingId}${listing?.city ? ` · ${listing.city}, ${listing.state}` : ''}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;border-top:1px solid #e5e7eb;">Reason</td>
              <td style="padding:10px 14px;font-size:14px;color:#111;border-top:1px solid #e5e7eb;">${reason}</td>
            </tr>
            ${details ? `
            <tr>
              <td style="padding:10px 14px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;border-top:1px solid #e5e7eb;">Details</td>
              <td style="padding:10px 14px;font-size:14px;color:#374151;border-top:1px solid #e5e7eb;">${details}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:10px 14px;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;border-top:1px solid #e5e7eb;">Reporter IP</td>
              <td style="padding:10px 14px;font-size:13px;color:#6b7280;border-top:1px solid #e5e7eb;">${ip ?? 'unknown'}</td>
            </tr>
          </table>
          <div style="display:flex;gap:12px;">
            <a href="${listingUrl}" style="flex:1;display:block;text-align:center;background:#16a34a;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:12px;border-radius:8px;">View listing ↗</a>
            <a href="${reviewUrl}" style="flex:1;display:block;text-align:center;background:#111;color:#fff;text-decoration:none;font-size:13px;font-weight:700;padding:12px;border-radius:8px;">Review in dashboard →</a>
          </div>
        </div>
      `,
    }).catch(() => {}); // never block the user response on email failure
  }

  return NextResponse.json({ ok: true });
}
