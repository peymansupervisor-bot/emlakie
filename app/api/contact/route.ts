import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Basic input length limits
  if (name.length > 200 || email.length > 200 || (subject && subject.length > 500) || message.length > 5000) {
    return NextResponse.json({ error: 'Input too long.' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('[contact] RESEND_API_KEY not set');
    return NextResponse.json({ error: 'Email service unavailable.' }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = subject ? escapeHtml(subject) : '';
  const safeMessage = escapeHtml(message);

  try {
    await resend.emails.send({
      from: 'EMLAKIE Contact <notifications@emlakie.com>',
      to: 'support@emlakie.com',
      replyTo: email,
      subject: safeSubject ? `[Contact] ${safeSubject}` : `[Contact] Message from ${safeName}`,
      html: `
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safeSubject ? `<p><strong>Subject:</strong> ${safeSubject}</p>` : ''}
        <hr/>
        <p style="white-space:pre-line">${safeMessage}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] Failed to send:', err);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
