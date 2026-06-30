import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession, adminClient } from '@/lib/moderator';
import { getOrProvisionVirtualPhone, forceReprovisionVirtualPhone } from '@/lib/twilio';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { landlordId, zip, city, state, reprovision } = await req.json();
  if (!landlordId) return NextResponse.json({ error: 'landlordId required' }, { status: 400 });

  // If caller didn't supply location, look it up from the landlord's most recent active listing
  let resolvedZip = zip as string | undefined;
  let resolvedCity = city as string | undefined;
  let resolvedState = state as string | undefined;

  if (!resolvedZip && !resolvedCity && !resolvedState) {
    const sb = adminClient();
    const { data: listing } = await sb
      .from('listings')
      .select('zip, city, state')
      .eq('landlord_id', landlordId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (listing) {
      resolvedZip = listing.zip ?? undefined;
      resolvedCity = listing.city ?? undefined;
      resolvedState = listing.state ?? undefined;
    }
  }

  const phone = reprovision
    ? await forceReprovisionVirtualPhone(landlordId, resolvedZip, resolvedCity, resolvedState)
    : await getOrProvisionVirtualPhone(landlordId, resolvedZip, resolvedCity, resolvedState);
  if (!phone) return NextResponse.json({ error: 'Could not provision a virtual phone — landlord may be missing a real phone number, or Twilio has no numbers available in that area.' }, { status: 502 });

  return NextResponse.json({ phone });
}
