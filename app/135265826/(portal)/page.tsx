import { adminClient } from '@/lib/moderator';
import ListingsClient from './ListingsClient';

export const dynamic = 'force-dynamic';

interface SearchParams { q?: string; status?: string; city?: string }

function normalizeBuilding(address: string | null): string {
  if (!address) return 'Unknown Address';
  return address
    .replace(/\s*(unit|apt|apartment|suite|ste|#)\s*[\w-]+\s*$/i, '')
    .trim();
}

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, status, city } = await searchParams;
  const sb = adminClient();

  let query = sb
    .from('listings')
    .select('id, title, address, city, state, status, monthly_rent, created_at, landlord_id, slug, photos, listing_source, property_group')
    .order('city', { ascending: true })
    .order('address', { ascending: true });

  if (status && status !== 'all') query = query.eq('status', status);
  if (city && city !== 'all') query = query.eq('city', city);
  if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,address.ilike.%${q}%`);

  const { data: listings } = await query.limit(500);

  // Get flag counts
  const { data: flagCounts } = await sb
    .from('listing_reports')
    .select('listing_id')
    .eq('reviewed', false);

  const flagMap: Record<string, number> = {};
  (flagCounts ?? []).forEach(({ listing_id }: { listing_id: string }) => {
    flagMap[listing_id] = (flagMap[listing_id] ?? 0) + 1;
  });

  const cities = Array.from(new Set((listings ?? []).map((l) => l.city).filter(Boolean))).sort();

  type ListingRow = NonNullable<typeof listings>[0] & { flags: number };

  // Group by city → building key (property_group takes priority over normalized address)
  const byCity: Record<string, Record<string, ListingRow[]>> = {};

  for (const l of listings ?? []) {
    const c = l.city ?? 'Unknown City';
    const b = l.property_group ?? normalizeBuilding(l.address);
    if (!byCity[c]) byCity[c] = {};
    if (!byCity[c][b]) byCity[c][b] = [];
    byCity[c][b].push({ ...l, flags: flagMap[l.id] ?? 0 });
  }

  const totalListings = listings?.length ?? 0;
  const totalBuildings = Object.values(byCity).reduce((n, buildings) => n + Object.keys(buildings).length, 0);

  const cityGroups = Object.entries(byCity).map(([city, buildings]) => ({
    city,
    buildings: Object.entries(buildings).map(([address, listings]) => ({ address, listings })),
  }));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">All Listings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalListings} unit{totalListings !== 1 ? 's' : ''} across {totalBuildings} building{totalBuildings !== 1 ? 's' : ''}
          </p>
        </div>
        <form method="GET" className="flex flex-wrap gap-2">
          <input
            name="q" defaultValue={q} placeholder="Search address, title…"
            className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500 w-48"
          />
          <select name="city" defaultValue={city ?? 'all'}
            className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white outline-none focus:border-green-500">
            <option value="all">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select name="status" defaultValue={status ?? 'all'}
            className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white outline-none focus:border-green-500">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="rented">Rented</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
          <button type="submit" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
            Search
          </button>
        </form>
      </div>

      {totalListings === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-16 text-center text-gray-500">
          No listings found.
        </div>
      ) : (
        <ListingsClient cityGroups={cityGroups} />
      )}
    </div>
  );
}
