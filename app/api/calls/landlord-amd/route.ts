import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Async AMD callback — Twilio tells us if a human or machine answered.
// If machine: redirect the caller's held call to our voicemail flow.
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const inboundSid = searchParams.get('inbound');

  const body = await req.formData();
  const answeredBy = body.get('AnsweredBy') as string | null;

  // machine_end_beep = voicemail finished its greeting, ready to record
  if (answeredBy && answeredBy.startsWith('machine') && inboundSid) {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
    await client.calls(inboundSid).update({
      twiml: `<Response>
  <Say voice="Polly.Matthew-Neural">EMLAKIE connecting you now. Please leave a message after the beep.</Say>
  <Record maxLength="120" playBeep="true" />
</Response>`,
    });
  }

  return new NextResponse('', { status: 204 });
}
