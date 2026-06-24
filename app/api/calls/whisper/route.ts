import { NextResponse } from 'next/server';

// Played to the landlord only when they pick up, before the caller is connected.
export async function POST() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">You have an incoming call from someone who saw your listing on Emlakie. Press any key to connect, or hang up to decline.</Say>
  <Gather numDigits="1" />
</Response>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'text/xml' },
  });
}
