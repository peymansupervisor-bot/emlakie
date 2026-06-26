import { NextRequest, NextResponse } from 'next/server';
import { getRealPhoneForVirtual } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const toNumber = body.get('To') as string | null;

  if (!toNumber) {
    return xml('<Response><Hangup/></Response>');
  }

  console.log('[calls/forward] toNumber:', toNumber);
  const realPhone = await getRealPhoneForVirtual(toNumber);
  console.log('[calls/forward] realPhone:', realPhone);
  if (!realPhone) {
    return xml('<Response><Say>Sorry, this number is no longer active.</Say><Hangup/></Response>');
  }

  const digits = realPhone.replace(/\D/g, '');
  const e164 = realPhone.startsWith('+') ? realPhone : `+1${digits.length === 11 ? digits.slice(1) : digits}`;

  const xml_body = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${toNumber}" timeout="30">
    <Number url="https://emlakie.com/api/calls/whisper" method="POST">${e164}</Number>
  </Dial>
</Response>`;

  return xml(xml_body);
}

function xml(body: string) {
  return new NextResponse(body, { headers: { 'Content-Type': 'text/xml' } });
}
