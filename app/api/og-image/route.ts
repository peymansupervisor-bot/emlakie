import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOST = 'qibqfgxrzkjwdvmwslrg.supabase.co';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  // Only proxy our own Supabase bucket — reject anything else
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }
  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return new NextResponse('Upstream error', { status: 502 });

  const buffer = Buffer.from(await res.arrayBuffer());
  const jpeg = await sharp(buffer).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();

  return new NextResponse(jpeg, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
