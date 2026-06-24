import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const recordingUrl = body.get('RecordingUrl') as string | null;
  const dialStatus = body.get('DialCallStatus') as string | null;

  // Recording finished — nothing to do
  if (recordingUrl) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  // Only intercept when landlord didn't answer
  if (dialStatus && !['no-answer', 'busy', 'failed'].includes(dialStatus)) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew-Neural">EMLAKIE connecting you now. Please leave a message after the beep.</Say>
  <Record maxLength="120" playBeep="true" action="https://emlakie.com/api/calls/voicemail" method="POST" />
</Response>`;

  return new NextResponse(xml, { headers: { 'Content-Type': 'text/xml' } });
}
