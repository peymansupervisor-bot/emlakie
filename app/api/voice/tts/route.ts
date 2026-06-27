import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') ?? '';
  if (!text.trim()) {
    return new NextResponse('Missing text', { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new NextResponse('TTS not configured', { status: 503 });
  }

  try {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: 'nova',
        input: text.slice(0, 4096),
        response_format: 'pcm', // 24kHz mono 16-bit LE — stream directly, no buffering
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[voice/tts] OpenAI error:', res.status, err);
      return new NextResponse('TTS unavailable', { status: 502 });
    }

    // Pipe the PCM stream directly to the client — no server-side buffering
    return new NextResponse(res.body, {
      headers: {
        'Content-Type': 'audio/pcm',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[voice/tts]', err);
    return new NextResponse('TTS unavailable', { status: 502 });
  }
}
