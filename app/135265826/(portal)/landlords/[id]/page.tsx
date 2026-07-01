import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LandlordActions from './LandlordActions';
import EditProfileForm from './EditProfileForm';
import { fmtPhone } from '@/lib/format-phone';

export const dynamic = 'force-dynamic';

export default async function LandlordProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = adminClient();

  const [{ data: profile }, { data: authUser }] = await Promise.all([
    sb.from('profiles')
      .select('id, first_name, last_name, display_name, phone, phone_verified, email, account_id, created_at, virtual_phone')
      .eq('id', id)
      .maybeSingle(),
    sb.auth.admin.getUserById(id),
  ]);

  // Show the page even for ghost users (auth account exists but no profile row)
  if (!authUser.user) notFound();

  const { data: listings } = await sb
    .from('listings')
    .select('id, title, address, city, state, status, monthly_rent, created_at, slug')
    .eq('landlord_id', id)
    .order('created_at', { ascending: false });

  const displayEmail = profile?.email ?? authUser.user.email ?? null;
  const joinedAt = profile?.created_at ?? authUser.user.created_at;

  const name =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    profile?.display_name ||
    displayEmail?.split('@')[0] ||
    'Unknown';

  const isBanned = !!authUser.user?.banned_until &&
    new Date(authUser.user.banned_until) > new Date();

  const statusColor: Record<string, string> = {
    active: 'text-green-400 bg-green-900/40',
    rented: 'text-blue-400 bg-blue-900/40',
    expired: 'text-gray-400 bg-gray-800',
    inactive: 'text-amber-400 bg-amber-900/40',
    suspended: 'text-red-400 bg-red-900/40',
    draft: 'text-gray-400 bg-gray-800',
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href="/135265826/landlords" className="text-xs text-gray-400 hover:text-white transition">
          ← Back to Landlords
        </Link>
      </div>

      {/* Profile card */}
      <div className={`rounded-2xl border p-6 mb-8 ${isBanned ? 'border-red-700 bg-red-950/40' : 'border-gray-800 bg-gray-900'}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{name}</h1>
              {isBanned && (
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                  Suspended
                </span>
              )}
            </div>
            {profile?.account_id && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">Account {profile.account_id}</p>
            )}
            {!profile && (
              <span className="mt-1 inline-block rounded bg-purple-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">No Profile</span>
            )}
            <p className="text-[10px] text-gray-600 font-mono mt-0.5 select-all">{id}</p>
          </div>
          <div className="text-xs text-gray-500">
            Joined {new Date(joinedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Email</p>
            <p className="text-sm text-white">{displayEmail ?? '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Phone</p>
            <p className="text-sm text-white flex items-center gap-1">
              {fmtPhone(profile?.phone)}
              {profile?.phone_verified && (
                <span className="text-[10px] font-bold text-green-400 bg-green-900/40 rounded px-1 py-0.5">verified</span>
              )}
            </p>
            {profile && (
              <EditProfileForm
                landlordId={id}
                firstName={profile.first_name}
                lastName={profile.last_name}
                phone={profile.phone}
              />
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Virtual Phone</p>
            <p className="text-sm text-white">
              {profile?.virtual_phone ? fmtPhone(profile.virtual_phone) : <span className="text-amber-400">Not provisioned</span>}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <LandlordActions landlordId={id} isBanned={isBanned} hasVirtualPhone={!!profile?.virtual_phone} />
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
                <th className="px-4 py-3 text-left">Actions</th>
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
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/135265826/listings/${l.id}`}
                        className="rounded-lg bg-green-700 hover:bg-green-600 px-3 py-1 text-xs font-semibold text-white transition"
                      >
                        Edit
                      </Link>
                      {l.slug && (
                        <Link
                          href={`/rentals/${l.slug}`}
                          target="_blank"
                          className="text-xs text-gray-400 hover:text-white transition"
                        >
                          View ↗
                        </Link>
                      )}
                    </div>
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
