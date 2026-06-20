import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.MODERATE_CONTENT_API_KEY ?? '';

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    // If no key configured, allow all uploads (fail open)
    return NextResponse.json({ safe: true });
  }

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  try {
    const res = await fetch(
      `https://api.moderatecontent.com/moderate/?key=${API_KEY}&url=${encodeURIComponent(url)}`,
    );
    const data = await res.json();

    // rating_index: 1 = everyone, 2 = teen, 3 = adult
    const safe = data.rating_index !== 3;
    return NextResponse.json({ safe, rating: data.rating_label ?? data.rating });
  } catch {
    // On API error, fail open so a service outage doesn't block landlords
    return NextResponse.json({ safe: true });
  }
}
