import { NextRequest, NextResponse } from 'next/server';
import { RekognitionClient, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
const AWS_REGION = process.env.AWS_REGION ?? 'us-west-2';
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID ?? '';
const AWS_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? '';

export async function POST(req: NextRequest) {
  try {
    // If AWS credentials not configured, fail open so landlords aren't blocked
    if (!AWS_ACCESS_KEY || !AWS_SECRET_KEY) {
      return NextResponse.json({ safe: true });
    }

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    try {
      // Fetch the image bytes from Supabase storage
      const imageRes = await fetch(url);
      if (!imageRes.ok) throw new Error('Could not fetch image for moderation');
      const imageBytes = new Uint8Array(await imageRes.arrayBuffer());

      const client = new RekognitionClient({
        region: AWS_REGION,
        credentials: { accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY },
      });

      const command = new DetectModerationLabelsCommand({
        Image: { Bytes: imageBytes },
        MinConfidence: 70, // Only flag if 70%+ confident it's inappropriate
      });

      const result = await client.send(command);
      const labels = result.ModerationLabels ?? [];
      const safe = labels.length === 0;

      return NextResponse.json({
        safe,
        flags: labels.map((l) => l.Name),
      });
    } catch {
      // On any error, fail open so an outage doesn't block landlords
      return NextResponse.json({ safe: true });
    }
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Moderate-image', message: _msg, details: _stack, endpoint: 'POST /api/moderate-image', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
