import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json([]);

  // Cities from our own listings
  const sb = supabase();
  const { data: cityRows } = await sb
    .from('listings')
    .select('city, state')
    .ilike('city', `${q}%`)
    .eq('status', 'active')
    .limit(50);

  // Deduplicate city+state pairs and sort by frequency
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
    }));

  // Address suggestions from Nominatim (only if input looks like an address)
  let addresses: { type: 'address'; label: string; value: string }[] = [];
  if (q.length >= 4 && /\d/.test(q)) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=4&countrycodes=us`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Emlakie/1.0 (emlakie.com)' },
        signal: AbortSignal.timeout(2000),
      });
      const data: { display_name: string; address: { road?: string; house_number?: string } }[] = await res.json();
      addresses = data.slice(0, 3).map((item) => ({
        type: 'address' as const,
        label: item.display_name.split(', United States')[0],
        value: item.display_name.split(', United States')[0],
      }));
    } catch {
      // Nominatim timeout — skip address suggestions
    }
  }

  return NextResponse.json([...cities, ...addresses]);
}
