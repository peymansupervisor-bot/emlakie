/**
 * POST /api/assistant/realtime-lab/token
 *
 * Issues a short-lived ephemeral OpenAI Realtime token so the browser can
 * open a WebRTC session directly with OpenAI without ever seeing the API key.
 *
 * Guards:
 *   - Returns 403 if ENABLE_AI_ASSISTANT or ASSISTANT_LAB_ENABLED are not 'true'
 *   - Returns 500 if OPENAI_API_KEY is missing
 *   - Returns 502 if OpenAI returns a non-200 response
 *
 * The OPENAI_API_KEY is only read server-side and never included in the response.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(): Promise<NextResponse> {
  // Guard: both feature flags must be active
  if (
    process.env.ENABLE_AI_ASSISTANT !== 'true' ||
    process.env.ASSISTANT_LAB_ENABLED !== 'true'
  ) {
    return NextResponse.json({ error: 'lab_not_enabled' }, { status: 403 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Log absence but not the key itself
    console.error('[realtime-lab/token] OPENAI_API_KEY is not set');
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
          model: 'gpt-realtime-2',
          audio: {
            output: {
              voice: 'marin',
            },
          },
        },
      }),
    });

    if (!openAIRes.ok) {
      let openAIError = 'unknown';
      try {
        const errBody = await openAIRes.json() as { error?: { message?: string; code?: string } };
        // Log message and code but never the API key or user content
        openAIError = errBody?.error?.code ?? errBody?.error?.message ?? 'unknown';
      } catch {
        openAIError = `http_${openAIRes.status}`;
      }
      console.error(`[realtime-lab/token] OpenAI returned ${openAIRes.status}: ${openAIError}`);
      return NextResponse.json(
        { error: 'openai_session_failed', detail: openAIError, httpStatus: openAIRes.status },
        { status: 502 },
      );
    }

    // Forward the full OpenAI response — browser needs data.value (new API format)
    const data: unknown = await openAIRes.json();
    return NextResponse.json(data);

  } catch (err) {
    console.error(
      '[realtime-lab/token] Network error:',
      err instanceof Error ? err.message : 'unknown',
    );
    return NextResponse.json({ error: 'network_error' }, { status: 500 });
  }
}
