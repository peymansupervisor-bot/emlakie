import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Proxy Google Translate TTS — avoids CORS and works server-side.
// Returns MP3 audio for the given text. Swap for OpenAI/ElevenLabs when ready.
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') ?? '';
  if (!text.trim()) {
    return new NextResponse('Missing text', { status: 400 });
  }

  try {
    const url =
      `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=` +
      encodeURIComponent(text.slice(0, 200)); // Google caps at ~200 chars

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!res.ok) throw new Error(`Google TTS ${res.status}`);

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[voice/tts]', err);
    return new NextResponse('TTS unavailable', { status: 502 });
  }
}
