import { Resend } from 'resend';

export async function sendWelcomeEmail({ email, firstName, profileComplete = true }: { email: string; firstName: string; profileComplete?: boolean }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'EMLAKIE <notifications@emlakie.com>',
    to: email,
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
}
