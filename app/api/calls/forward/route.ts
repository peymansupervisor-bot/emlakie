import { NextRequest, NextResponse } from 'next/server';
import { getRealPhoneForVirtual } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const toNumber = body.get('To') as string | null;

  if (!toNumber) {
    return new NextResponse(twiml('<Response><Hangup/></Response>'), xmlHeaders());
  }

  const realPhone = await getRealPhoneForVirtual(toNumber);

  if (!realPhone) {
    const msg = '<Response><Say>Sorry, this number is no longer active. Goodbye.</Say><Hangup/></Response>';
    return new NextResponse(twiml(msg), xmlHeaders());
  }

  const digits = realPhone.replace(/\D/g, '');
  const e164 = realPhone.startsWith('+') ? realPhone : `+1${digits.length === 11 ? digits.slice(1) : digits}`;

  const xml = `<Response>
  <Dial callerId="${toNumber}" timeout="30">
    <Number>${e164}</Number>
  </Dial>
</Response>`;

  return new NextResponse(twiml(xml), xmlHeaders());
}

function twiml(xml: string) { return xml; }
function xmlHeaders() {
  return { headers: { 'Content-Type': 'text/xml' } };
}
