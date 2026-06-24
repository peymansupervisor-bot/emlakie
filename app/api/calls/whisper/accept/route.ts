import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const digits = body.get('Digits') as string | null;

  if (!digits) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    headers: { 'Content-Type': 'text/xml' },
  });
}
