/**
 * POST /api/assistant/token
 *
 * Issues a short-lived ephemeral OpenAI Realtime token for the production
 * AI Leasing Assistant. The browser uses it for the WebRTC SDP exchange
 * without ever seeing the API key.
 *
 * Guard: returns 403 if ENABLE_AI_ASSISTANT is not 'true'.
 * Security: OPENAI_API_KEY is read only server-side and never returned.
 */

import { NextResponse } from 'next/server';
import { ASSISTANT_SYSTEM_INSTRUCTION, REALTIME_MODEL, REALTIME_VOICE } from '@/lib/assistant/realtime/config';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  if (process.env.ENABLE_AI_ASSISTANT !== 'true') {
    return NextResponse.json({ error: 'assistant_not_enabled' }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[assistant/token] OPENAI_API_KEY is not set');
    return NextResponse.json({ error: 'openai_key_missing' }, { status: 500 });
  }

  try {
    const openAIRes = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: REALTIME_MODEL,
          output_modalities: ['audio'],
          instructions: ASSISTANT_SYSTEM_INSTRUCTION,
          audio: {
            input: {
              transcription: { model: 'whisper-1' },
            },
            output: {
              voice: REALTIME_VOICE,
            },
          },
        },
      }),
    });

    if (!openAIRes.ok) {
      let errCode = 'unknown';
      try {
        const body = (await openAIRes.json()) as { error?: { code?: string; message?: string } };
        errCode = body?.error?.code ?? body?.error?.message ?? 'unknown';
      } catch {
        errCode = `http_${openAIRes.status}`;
      }
      console.error(`[assistant/token] OpenAI returned ${openAIRes.status}: ${errCode}`);
      return NextResponse.json(
        { error: 'openai_session_failed', detail: errCode, httpStatus: openAIRes.status },
        { status: 502 },
      );
    }

    const data = (await openAIRes.json()) as Record<string, unknown>;
    return NextResponse.json(data);
  } catch (err) {
    console.error(
      '[assistant/token] Network error:',
      err instanceof Error ? err.message : 'unknown',
    );
    return NextResponse.json({ error: 'network_error' }, { status: 500 });
  }
}
