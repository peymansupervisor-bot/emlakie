import { NextResponse } from 'next/server';

// Played to the landlord only when they pick up, before the caller is connected.
export async function POST() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="https://emlakie.com/api/calls/whisper/accept" method="POST" timeout="10">
    <Say voice="Polly.Joanna">You have an incoming call from someone who saw your listing on Emlakie. Press any key to connect.</Say>
  </Gather>
  <Hangup/>
</Response>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
