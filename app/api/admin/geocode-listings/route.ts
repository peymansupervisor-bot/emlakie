import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'
export const dynamic = 'force-dynamic';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

async function geocode(address: string, city: string, state: string, zip: string) {
  const query = encodeURIComponent(`${address}, ${city}, ${state} ${zip}, USA`);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=us`,
    { headers: { 'User-Agent': 'emlakie-geocoder/1.0', 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };

  // Fallback: try just the street name + city
  const fallback = encodeURIComponent(`${city}, ${state} ${zip}, USA`);
  const res2 = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${fallback}&format=json&limit=1&countrycodes=us`,
    { headers: { 'User-Agent': 'emlakie-geocoder/1.0', 'Accept-Language': 'en' } }
  );
  const data2 = await res2.json();
  if (data2.length > 0) return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };

  return null;
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { data: listings, error } = await sb
      .from('listings')
      .select('id, address, city, state, zip')
      .eq('status', 'active')
      .is('lat', null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!listings?.length) return NextResponse.json({ message: 'No listings to geocode', updated: 0 });

    const results = [];
    for (const l of listings) {
      await new Promise((r) => setTimeout(r, 1000)); // Nominatim rate limit
      const coords = await geocode(l.address, l.city, l.state, l.zip ?? '');
      if (coords) {
        await sb.from('listings').update({ lat: coords.lat, lng: coords.lng }).eq('id', l.id);
        results.push({ address: l.address, city: l.city, ...coords, status: 'ok' });
      } else {
        results.push({ address: l.address, city: l.city, status: 'failed' });
      }
    }

    return NextResponse.json({ updated: results.filter(r => r.status === 'ok').length, results });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Admin › Geocode-listings', message: _msg, details: _stack, endpoint: 'POST /api/admin/geocode-listings', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
