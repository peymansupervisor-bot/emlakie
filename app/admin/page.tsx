import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import AdminListingActions from './AdminListingActions';

export const dynamic = 'force-dynamic';

interface SearchParams { q?: string; status?: string }

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, status } = await searchParams;
  const sb = adminClient();

  let query = sb
    .from('listings')
    .select('id, title, city, state, status, monthly_rent, created_at, landlord_id, slug, photos, listing_source')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);
  if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,address.ilike.%${q}%`);

  const { data: listings } = await query.limit(200);

  // Get flag counts
  const { data: flagCounts } = await sb
    .from('listing_reports')
    .select('listing_id')
    .eq('reviewed', false);

  const flagMap: Record<string, number> = {};
  (flagCounts ?? []).forEach(({ listing_id }) => {
    flagMap[listing_id] = (flagMap[listing_id] ?? 0) + 1;
  });

  const statusColor: Record<string, string> = {
    active: 'bg-green-900 text-green-300',
    rented: 'bg-blue-900 text-blue-300',
    expired: 'bg-gray-700 text-gray-300',
    suspended: 'bg-red-900 text-red-300',
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-xl font-extrabold text-white">All Listings</h1>
        <form method="GET" className="flex gap-2">
          <input
            name="q" defaultValue={q} placeholder="Search title, city…"
            className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500 w-52"
          />
          <select name="status" defaultValue={status ?? 'all'}
            className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white outline-none focus:border-brand-500">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="rented">Rented</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
          <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition">
            Search
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Listing</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Rent</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {(listings ?? []).map((l) => {
              const flags = flagMap[l.id] ?? 0;
              return (
                <tr key={l.id} className="hover:bg-gray-900/50 transition">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white line-clamp-1 max-w-xs">{l.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{l.listing_source ?? 'owner'}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{l.city}, {l.state}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColor[l.status] ?? 'bg-gray-700 text-gray-300'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">${l.monthly_rent?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {flags > 0 ? (
                      <Link href="/admin/flags" className="inline-flex items-center gap-1 rounded-full bg-red-900 px-2 py-0.5 text-xs font-bold text-red-300 hover:bg-red-800 transition">
                        ⚑ {flags}
                      </Link>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/rentals/${l.slug ?? l.id}`}
                        target="_blank"
                        className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                      >
                        View ↗
                      </Link>
                      <AdminListingActions listingId={l.id} currentStatus={l.status} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!listings || listings.length === 0) && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No listings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
