import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
// POST /api/welcome — send a one-time welcome email to a landlord after profile setup
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createSupabaseAdmin();
    const { data: profile } = await admin.from('profiles').select('display_name, first_name, email, welcome_sent').eq('id', user.id).single();

    // Only send once
    if (!profile || profile.welcome_sent) return NextResponse.json({ ok: true, skipped: true });

    const recipientEmail = profile.email ?? user.email;
    if (!recipientEmail) return NextResponse.json({ ok: true, skipped: true });

    const firstName = profile.first_name ?? profile.display_name?.split(' ')[0] ?? 'there';

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'EMLAKIE <notifications@emlakie.com>',
        to: recipientEmail,
        subject: 'Welcome to EMLAKIE — your listing goes live in minutes',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111;background:#f3f4f6;padding:32px 16px;">
            <div style="background:#16a34a;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#fff;">EMLAKIE</p>
              <p style="margin:4px 0 0;font-size:13px;color:#bbf7d0;">Welcome aboard</p>
            </div>
            <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 32px;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#111;">Hi ${firstName}, welcome to EMLAKIE!</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">You're all set. Here's what you can do right now:</p>
              <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#374151;line-height:2;">
                <li><strong>List your first property</strong> — it goes live instantly and is searchable on emlakie.com</li>
                <li><strong>Review tenant inquiries</strong> — each application includes an AI match score</li>
                <li><strong>Message applicants</strong> directly from your dashboard</li>
              </ul>
              <a href="https://emlakie.com/landlord/properties/new" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">List Your First Property →</a>
              <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Questions? Reply to this email and we'll help you get started.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
              <p style="margin:0;font-size:12px;color:#9ca3af;">EMLAKIE · <a href="https://emlakie.com" style="color:#9ca3af;">emlakie.com</a></p>
            </div>
          </div>
        `,
      });

      // Mark welcome email as sent
      await admin.from('profiles').update({ welcome_sent: true }).eq('id', user.id);

      // Notify admin of the new landlord signup
      try {
        await resend.emails.send({
          from: 'EMLAKIE <notifications@emlakie.com>',
          to: 'peymansupervisor@gmail.com',
          subject: `New landlord signup: ${firstName}`,
          html: `
            <div style="font-family:sans-serif;font-size:14px;color:#111;line-height:1.6;">
              <p>A new landlord just completed signup on EMLAKIE.</p>
              <ul>
                <li><strong>Name:</strong> ${profile.display_name ?? firstName}</li>
                <li><strong>Email:</strong> ${recipientEmail}</li>
                <li><strong>User ID:</strong> ${user.id}</li>
              </ul>
            </div>
          `,
        });
      } catch (e) {
        console.error('[welcome] admin notification failed:', e);
      }
    } catch (e) {
      console.error('[welcome] email failed:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Welcome', message: _msg, details: _stack, endpoint: 'POST /api/welcome', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
