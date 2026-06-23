import { NextRequest, NextResponse } from 'next/server';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
const LISTHUB_TOKEN_URL = 'https://auth.listhub.com/oauth2/token';
const LISTHUB_API_URL = 'https://api.listhub.com/odata/listings';

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(LISTHUB_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`ListHub auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

// GET /api/listhub — fetch active listings from ListHub
export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.LISTHUB_CLIENT_ID;
    const clientSecret = process.env.LISTHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'ListHub credentials not configured' }, { status: 500 });
    }

    try {
      const token = await getAccessToken(clientId, clientSecret);

      const filter = `StandardStatus eq 'Active'`;
      const select = [
        'ListingKey', 'ListingId', 'UnparsedAddress', 'City', 'StateOrProvince',
        'PostalCode', 'ListPrice', 'BedroomsTotal', 'BathroomsTotalInteger',
        'LivingArea', 'PropertyType', 'PropertySubType', 'PublicRemarks',
        'Media', 'Latitude', 'Longitude', 'ListAgentFullName', 'ModificationTimestamp'
      ].join(',');

      const url = `${LISTHUB_API_URL}?$filter=${encodeURIComponent(filter)}&$select=${encodeURIComponent(select)}&$top=50&$orderby=ModificationTimestamp desc`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      });

      if (!res.ok) throw new Error(`ListHub API error: ${res.status}`);
      const data = await res.json();

      return NextResponse.json({ listings: data.value ?? [] });
    } catch (err) {
      console.error('[listhub] fetch error:', err);
      return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Listhub', message: _msg, details: _stack, endpoint: 'GET /api/listhub', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
