import { NextRequest, NextResponse } from 'next/server';
import { getPropertyRecord } from '@/lib/rentcast';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

// Maps RentCast's property type enum to EMLAKIE's internal property_type values.
// "Multi-Family" has no clean equivalent (could be a duplex-style house or a
// converted apartment building) so it's intentionally left unmapped — better to
// leave the landlord's own selection alone than guess wrong.
const RENTCAST_TO_EMLAKIE_TYPE: Record<string, string> = {
  'Single Family': 'house',
  'Condo': 'condo',
  'Townhouse': 'townhouse',
  'Apartment': 'apartment',
  'Manufactured': 'house',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const zip = searchParams.get('zip');

    if (!address || !city || !state) {
      return NextResponse.json({ error: 'address, city, and state are required' }, { status: 400 });
    }

    const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');
    const record = await getPropertyRecord(fullAddress);

    if (!record) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      bedrooms: record.bedrooms,
      bathrooms: record.bathrooms,
      sqft: record.squareFootage,
      propertyType: record.propertyType ? RENTCAST_TO_EMLAKIE_TYPE[record.propertyType] ?? null : null,
    });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'properties/lookup', message: _msg, details: _stack, endpoint: 'GET /api/properties/lookup', http_status: 500 });
    return NextResponse.json({ found: false });
  }
}
