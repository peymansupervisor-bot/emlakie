import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    if (q.length < 2) return NextResponse.json([]);

    const sb = supabase();

    // Cities from our own listings
    const { data: cityRows } = await sb
      .from('listings')
      .select('city, state')
      .ilike('city', `${q}%`)
      .eq('status', 'active')
      .limit(50);

    const freq: Record<string, { city: string; state: string; count: number }> = {};
    for (const row of cityRows ?? []) {
      if (!row.city) continue;
      const key = `${row.city}|${row.state}`;
      if (!freq[key]) freq[key] = { city: row.city, state: row.state, count: 0 };
      freq[key].count++;
    }
    const cities = Object.values(freq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((r) => ({
        type: 'city' as const,
        label: `${r.city}, ${r.state}`,
        value: r.city,
        slug: null as null,
      }));

    // Unit-level address suggestions from our own DB — always unit-specific, never building-level
    let listingAddresses: { type: 'listing'; label: string; value: string; slug: string }[] = [];
    if (q.length >= 3 && /\d/.test(q)) {
      const { data: addrRows } = await sb
        .from('listings')
        .select('address, city, state, slug, id, status')
        .ilike('address', `%${q}%`)
        .order('address')
        .limit(30);

      listingAddresses = (addrRows ?? [])
        .filter((r) => r.address)
        .map((r) => ({
          type: 'listing' as const,
          label: [r.address, r.city, r.state].filter(Boolean).join(', '),
          value: [r.address, r.city, r.state].filter(Boolean).join(', '),
          slug: (r.slug ?? r.id) as string,
        }));
    }

    // Only fall back to Nominatim if our DB has no address matches
    let nominatimAddresses: { type: 'address'; label: string; value: string; slug: null }[] = [];
    if (listingAddresses.length === 0 && q.length >= 4 && /\d/.test(q)) {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=4&countrycodes=us`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Emlakie/1.0 (emlakie.com)' },
          signal: AbortSignal.timeout(2000),
        });
        const data: { display_name: string }[] = await res.json();
        nominatimAddresses = data.slice(0, 3).map((item) => ({
          type: 'address' as const,
          label: item.display_name.split(', United States')[0],
          value: item.display_name.split(', United States')[0],
          slug: null,
        }));
      } catch {
        // Nominatim timeout — skip
      }
    }

    return NextResponse.json([...cities, ...listingAddresses, ...nominatimAddresses]);
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Autocomplete', message: _msg, details: _stack, endpoint: 'GET /api/autocomplete', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
