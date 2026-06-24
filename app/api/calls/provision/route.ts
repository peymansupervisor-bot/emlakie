import { NextRequest, NextResponse } from 'next/server';
import { getOrProvisionVirtualPhone } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const virtualPhone = await getOrProvisionVirtualPhone(userId);
    if (!virtualPhone) return NextResponse.json({ error: 'Could not provision number' }, { status: 422 });

    return NextResponse.json({ virtualPhone });
  } catch (err) {
    console.error('provision error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
