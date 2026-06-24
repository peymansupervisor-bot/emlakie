import { NextRequest, NextResponse } from 'next/server';

// Called by Twilio after the landlord presses a key (or the gather times out).
// Returning empty <Response/> connects the caller.
// Returning <Hangup/> drops the call (voicemail protection).
export async function POST(req: NextRequest) {
  const body = await req.formData();
  const digits = body.get('Digits') as string | null;

  // No key pressed = voicemail picked up — hang up
  if (!digits) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // Key pressed = real person — connect the caller
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    headers: { 'Content-Type': 'text/xml' },
  });
}
