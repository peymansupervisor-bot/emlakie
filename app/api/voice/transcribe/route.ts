import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Transcription not configured' }, { status: 503 });
  }

  const formData = await req.formData();
  const audio = formData.get('audio') as File | null;
  if (!audio) {
    return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
  }

  const body = new FormData();
  body.append('file', audio);
  body.append('model', 'whisper-1');
  body.append('language', 'en');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[transcribe] OpenAI error:', res.status, err);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ text: data.text ?? '' });
}
