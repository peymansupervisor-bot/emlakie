import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LandlordProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = adminClient();

  const { data: profile } = await sb
    .from('profiles')
    .select('id, first_name, last_name, display_name, phone, phone_verified, email, account_id, created_at')
    .eq('id', id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: listings } = await sb
    .from('listings')
    .select('id, title, address, city, state, status, monthly_rent, created_at, slug, photos')
    .eq('landlord_id', id)
    .order('created_at', { ascending: false });

  const name =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    profile.display_name ||
    profile.email?.split('@')[0] ||
    'Unknown';

  const statusColor: Record<string, string> = {
    active: 'text-green-400 bg-green-900/40',
    rented: 'text-blue-400 bg-blue-900/40',
    expired: 'text-gray-400 bg-gray-800',
    suspended: 'text-red-400 bg-red-900/40',
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/135265826/landlords" className="text-xs text-gray-400 hover:text-white transition">
          ← Back to Landlords
        </Link>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{name}</h1>
            {profile.account_id && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">Account {profile.account_id}</p>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Email</p>
            <p className="text-sm text-white">{profile.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Phone</p>
            <p className="text-sm text-white flex items-center gap-1">
              {profile.phone ?? '—'}
              {profile.phone_verified && (
                <span className="text-[10px] font-bold text-green-400 bg-green-900/40 rounded px-1 py-0.5">verified</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">User ID</p>
            <p className="text-xs text-gray-400 font-mono break-all">{profile.id}</p>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="text-base font-bold text-white mb-3">
        Listings <span className="text-gray-500 font-normal">({listings?.length ?? 0})</span>
      </h2>

      {!listings || listings.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-12 text-center text-gray-500 text-sm">
          No listings for this landlord.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Title / Address</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Rent</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Added</th>
                <th className="px-4 py-3 text-left">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-gray-900/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white line-clamp-1">{l.title || l.address}</p>
                    {l.title && l.address && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{l.address}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{l.city}{l.state ? `, ${l.state}` : ''}</td>
                  <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                    {l.monthly_rent ? `$${l.monthly_rent.toLocaleString()}/mo` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor[l.status] ?? 'text-gray-400 bg-gray-800'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {l.slug && (
                      <Link
                        href={`/rentals/${l.slug}`}
                        target="_blank"
                        className="text-xs text-green-400 hover:text-green-300 transition"
                      >
                        Listing ↗
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
