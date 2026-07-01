import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';
import { sendWelcomeEmail } from '@/lib/welcome-email';

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
    const { data: profile } = await admin.from('profiles').select('display_name, first_name, phone, email, welcome_sent').eq('id', user.id).single();

    // Only send once
    if (!profile || profile.welcome_sent) return NextResponse.json({ ok: true, skipped: true });

    const recipientEmail = profile.email ?? user.email;
    if (!recipientEmail) return NextResponse.json({ ok: true, skipped: true });

    const firstName = profile.first_name ?? profile.display_name?.split(' ')[0] ?? 'there';
    const profileComplete = !!(profile.first_name && profile.phone);

    try {
      await sendWelcomeEmail({ email: recipientEmail, firstName, profileComplete });

      // Mark welcome email as sent
      await admin.from('profiles').update({ welcome_sent: true }).eq('id', user.id);

      // Notify admin of the new landlord signup
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
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
