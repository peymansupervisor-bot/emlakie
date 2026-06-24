import { NextRequest, NextResponse } from 'next/server';

// Called when landlord's phone is answered (human confirmed by AMD).
// Joins the same conference room as the caller, bridging the two legs.
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room');

  if (!room) {
    return new NextResponse('<Response><Hangup/></Response>', { headers: { 'Content-Type': 'text/xml' } });
  }

  const xml = `<Response>
  <Say voice="Polly.Matthew-Neural">Emlakie inquiry incoming.</Say>
  <Dial>
    <Conference startConferenceOnEnter="true" endConferenceOnExit="true" beep="false">
      ${room}
    </Conference>
  </Dial>
</Response>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}
