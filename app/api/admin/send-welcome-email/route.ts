import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession } from '@/lib/moderator';
import { sendWelcomeEmail } from '@/lib/welcome-email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { landlordId } = await req.json();
  if (!landlordId) return NextResponse.json({ error: 'landlordId required' }, { status: 400 });

  const result = await sendWelcomeEmail(landlordId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  return NextResponse.json(result);
}
