import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getRealPhoneForVirtual } from '@/lib/twilio';
import { createClient } from '@supabase/supabase-js';

// Called by Twilio when the landlord doesn't answer (DialCallStatus=no-answer/busy/failed).
// Step 1 — POST with no RecordingUrl: play greeting and start recording.
// Step 2 — POST with RecordingUrl: recording is done, notify the landlord.
export async function POST(req: NextRequest) {
  const body = await req.formData();
  const recordingUrl = body.get('RecordingUrl') as string | null;
  const to = body.get('To') as string | null;         // virtual number
  const caller = body.get('From') as string | null;   // tenant's number
  const dialStatus = body.get('DialCallStatus') as string | null;

  // Step 2: recording finished — notify landlord
  if (recordingUrl) {
    await notifyLandlord(to, caller, recordingUrl);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // Step 1: landlord didn't answer — only handle no-answer/busy/failed
  if (dialStatus && !['no-answer', 'busy', 'failed'].includes(dialStatus)) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew-Neural">Emlakie inquiry incoming. The landlord is unavailable. Please leave a message after the beep.</Say>
  <Record maxLength="120" playBeep="true" action="https://emlakie.com/api/calls/voicemail" method="POST" />
</Response>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}

async function notifyLandlord(virtualPhone: string | null, caller: string | null, recordingUrl: string) {
  try {
    if (!virtualPhone) return;

    // Get landlord's real phone and email
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: profile } = await db
      .from('profiles')
      .select('phone, email')
      .eq('virtual_phone', virtualPhone)
      .single();

    if (!profile?.email) return;

    const resend = new Resend(process.env.RESEND_API_KEY);
    const callerDisplay = caller ? caller.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : 'Unknown';

    await resend.emails.send({
      from: 'EMLAKIE <notifications@emlakie.com>',
      to: profile.email,
      subject: 'You have a new voicemail from an Emlakie inquiry',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2 style="color:#16a34a">New Voicemail — Emlakie Listing Inquiry</h2>
          <p>Someone called your Emlakie listing number and left a voicemail.</p>
          <p><strong>Caller:</strong> ${callerDisplay}</p>
          <p>
            <a href="${recordingUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
              Listen to Voicemail
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px">This call was routed through your Emlakie listing. Reply to this email if you need help.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[voicemail] notify error:', err);
  }
}
