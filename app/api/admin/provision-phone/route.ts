import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession } from '@/lib/moderator';
import { getOrProvisionVirtualPhone } from '@/lib/twilio';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { landlordId, zip, city, state } = await req.json();
  if (!landlordId) return NextResponse.json({ error: 'landlordId required' }, { status: 400 });

  const phone = await getOrProvisionVirtualPhone(landlordId, zip, city, state);
  if (!phone) return NextResponse.json({ error: 'Could not provision a virtual phone — Twilio may be out of numbers in that area.' }, { status: 502 });

  return NextResponse.json({ phone });
}
