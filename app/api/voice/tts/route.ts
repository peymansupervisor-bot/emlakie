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
        response_format: 'pcm', // 24kHz mono 16-bit LE
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[voice/tts] OpenAI error:', res.status, err);
      return new NextResponse('TTS unavailable', { status: 502 });
    }

    // Use TransformStream to pipe — direct res.body passthrough is unreliable in Next.js Node runtime
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    res.body!.pipeTo(writable).catch(() => {});

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'audio/pcm',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Accel-Buffering': 'no',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[voice/tts]', err);
    return new NextResponse('TTS unavailable', { status: 502 });
  }
}
