import { NextResponse } from 'next/server';

export async function POST() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="https://emlakie.com/api/calls/whisper/accept" method="POST" timeout="10">
    <Say voice="Polly.Joanna-Neural">You have an incoming call from someone who saw your listing on Emlakie dot com. Press any key to connect.</Say>
  </Gather>
  <Hangup/>
</Response>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}
