// Quick diagnostic - add temporarily
import { NextResponse } from 'next/server';
export async function GET() {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return NextResponse.json({ error: 'no key' });
  const res = await fetch(
    'https://zllw-working-api.p.rapidapi.com/pro/byaddress?propertyaddress=123+Main+St+Los+Angeles+CA',
    { headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'zllw-working-api.p.rapidapi.com' }, cache: 'no-store' }
  );
  const body = await res.text();
  return NextResponse.json({ status: res.status, body: body.slice(0, 500), keyPrefix: key.slice(0, 8) });
}
