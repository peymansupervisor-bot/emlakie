import { Resend } from 'resend';
import { createSupabaseAdmin } from './supabase-server';

export type SendWelcomeEmailResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string };

// Sends the one-time landlord welcome email for the given user, unless it was already sent.
export async function sendWelcomeEmail(userId: string): Promise<SendWelcomeEmailResult> {
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin.from('profiles').select('display_name, first_name, phone, email, welcome_sent').eq('id', userId).single();

  if (!profile || profile.welcome_sent) return { ok: true, skipped: true };

  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const recipientEmail = profile.email ?? authUser.user?.email;
  if (!recipientEmail) return { ok: true, skipped: true };

  const firstName = profile.first_name ?? profile.display_name?.split(' ')[0] ?? 'there';
  const profileComplete = !!(profile.first_name && profile.phone);

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
              ${profileComplete ? '' : '<li><strong>Complete your profile</strong> — add your full name and phone number, required before you can post a listing</li>'}
              <li><strong>List your first property</strong> — it goes live instantly and is searchable on emlakie.com</li>
              <li><strong>Review tenant inquiries</strong> — each application includes an AI match score</li>
              <li><strong>Message applicants</strong> directly from your dashboard</li>
            </ul>
            <a href="https://emlakie.com/landlord/${profileComplete ? 'properties/new' : 'profile'}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;">${profileComplete ? 'List Your First Property →' : 'Complete Your Profile →'}</a>
            <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Questions? Reply to this email and we'll help you get started.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
            <p style="margin:0;font-size:12px;color:#9ca3af;">EMLAKIE · <a href="https://emlakie.com" style="color:#9ca3af;">emlakie.com</a></p>
          </div>
        </div>
      `,
    });

    await admin.from('profiles').update({ welcome_sent: true }).eq('id', userId);

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
              <li><strong>User ID:</strong> ${userId}</li>
            </ul>
          </div>
        `,
      });
    } catch (e) {
      console.error('[welcome] admin notification failed:', e);
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[welcome] email failed:', e);
    return { ok: false, error: message };
  }
}
