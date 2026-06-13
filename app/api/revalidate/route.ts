import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Called by the backend whenever a listing is created or updated.
// Triggers immediate ISR regeneration of the affected city page.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let zip: string | undefined;
  try {
    ({ zip } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!zip) {
    return NextResponse.json({ error: 'zip is required' }, { status: 400 });
  }

  revalidatePath(`/homes/${zip}`);

  // Warm the page immediately so the first real visitor doesn't wait.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
  fetch(`${baseUrl}/homes/${zip}`, { method: 'HEAD' }).catch(() => null);

  return NextResponse.json({ revalidated: true, zip });
}
