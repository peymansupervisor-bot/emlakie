import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getRealPhoneForVirtual } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const toNumber = body.get('To') as string | null;
  const callSid = body.get('CallSid') as string | null;

  if (!toNumber || !callSid) {
    return xml('<Response><Hangup/></Response>');
  }

  const realPhone = await getRealPhoneForVirtual(toNumber);
  if (!realPhone) {
    return xml('<Response><Say>Sorry, this number is no longer active.</Say><Hangup/></Response>');
  }

  const digits = realPhone.replace(/\D/g, '');
  const e164 = realPhone.startsWith('+') ? realPhone : `+1${digits.length === 11 ? digits.slice(1) : digits}`;
  const base = 'https://emlakie.com';

  // Dial landlord via REST API with AMD — detects human vs voicemail
  const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  await client.calls.create({
    to: e164,
    from: toNumber,
    url: `${base}/api/calls/landlord-connect?room=${callSid}`,
    machineDetection: 'DetectMessageEnd',
    asyncAmdStatusCallback: `${base}/api/calls/landlord-amd?inbound=${callSid}`,
    asyncAmdStatusCallbackMethod: 'POST',
    timeout: 25,
  });

  // Put caller in a conference room on hold until landlord bridges in
  return xml(`<Response>
  <Dial>
    <Conference waitUrl="https://twimlets.com/holdmusic?Bucket=com.twilio.music.classical"
                startConferenceOnEnter="false"
                endConferenceOnExit="true"
                beep="false">
      ${callSid}
    </Conference>
  </Dial>
</Response>`);
}

function xml(body: string) {
  return new NextResponse(body, { headers: { 'Content-Type': 'text/xml' } });
}
