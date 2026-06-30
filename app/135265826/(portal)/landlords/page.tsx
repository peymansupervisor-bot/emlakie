import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import BackfillButton from './BackfillButton';

export const dynamic = 'force-dynamic';

function fmtPhone(raw: string | null | undefined) {
  if (!raw) return '—';
  const d = raw.replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return raw;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

interface SearchParams { q?: string }

export default async function LandlordsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q } = await searchParams;
  const sb = adminClient();

  // Fetch all pages of auth users
  let allAuthUsers: { id: string; banned_until?: string | null }[] = [];
  let authPage = 1;
  while (true) {
    const { data: page } = await sb.auth.admin.listUsers({ perPage: 1000, page: authPage });
    const users = page?.users ?? [];
    allAuthUsers = allAuthUsers.concat(users);
    if (users.length < 1000) break;
    authPage++;
  }

  // Paginate listings to get past Supabase's 1000-row PostgREST cap
  let allListings: { landlord_id: string | null; status: string | null }[] = [];
  const PAGE = 1000;
  let listingPage = 0;
  while (true) {
    const { data: batch } = await sb
      .from('listings')
      .select('landlord_id, status')
      .range(listingPage * PAGE, listingPage * PAGE + PAGE - 1);
    const rows = batch ?? [];
    allListings = allListings.concat(rows);
    if (rows.length < PAGE) break;
    listingPage++;
  }

  const [{ data: profileRows }] = await Promise.all([
    sb.from('profiles').select('id, first_name, last_name, display_name, phone, phone_verified, email, account_id, created_at'),
  ]);

  const now = new Date();
  const bannedIds = new Set(
    allAuthUsers
      .filter(u => u.banned_until && new Date(u.banned_until) > now)
      .map(u => u.id)
  );

  const countMap: Record<string, { total: number; active: number }> = {};
  for (const l of allListings) {
    if (!l.landlord_id) continue;
    if (!countMap[l.landlord_id]) countMap[l.landlord_id] = { total: 0, active: 0 };
    countMap[l.landlord_id].total++;
    if (l.status === 'active') countMap[l.landlord_id].active++;
  }

  function accountNum(id: string | null): number {
    if (!id) return Infinity;
    const m = id.match(/\d+$/);
    return m ? parseInt(m[0], 10) : Infinity;
  }

  let rows = (profileRows ?? []).filter((p) => {
    if (!q) return true;
    const lower = q.toLowerCase();
    return (
      p.email?.toLowerCase().includes(lower) ||
      p.first_name?.toLowerCase().includes(lower) ||
      p.last_name?.toLowerCase().includes(lower) ||
      p.display_name?.toLowerCase().includes(lower) ||
      p.phone?.includes(q) ||
      p.account_id?.toLowerCase().includes(lower)
    );
  });

  rows = rows.sort((a, b) => accountNum(a.account_id) - accountNum(b.account_id));

  const total = rows.length;
  const missingIdCount = (profileRows ?? []).filter((p) => !p.account_id).length;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Registered Landlords</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} account{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <BackfillButton missingCount={missingIdCount} />
          <form method="GET" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, email, phone…"
              className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500 w-64"
            />
            <button
              type="submit"
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-16 text-center text-gray-500">
          No landlords found.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Account ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-center">Listings</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rows.map((p) => {
                const name =
                  [p.first_name, p.last_name].filter(Boolean).join(' ') ||
                  p.display_name ||
                  '—';
                const counts = countMap[p.id];
                const isSuspended = bannedIds.has(p.id);
                return (
                  <tr key={p.id} className={`hover:bg-gray-900/50 transition ${isSuspended ? 'bg-red-950/20' : !p.account_id ? 'bg-amber-950/20' : ''}`}>
                    <td className="px-4 py-3 text-xs font-mono">
                      {p.account_id
                        ? <span className={isSuspended ? 'text-red-400' : 'text-gray-400'}>{p.account_id}</span>
                        : <span className="text-amber-500">missing</span>}
                      <div className="mt-0.5 text-[10px] text-gray-600 select-all">{p.id}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold ${isSuspended ? 'text-red-300' : 'text-white'}`}>{name}</span>
                      {isSuspended && (
                        <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">Suspended</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{p.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {p.phone ? (
                        <span className="flex items-center gap-1">
                          {fmtPhone(p.phone)}
                          {p.phone_verified && (
                            <span className="text-[10px] font-bold text-green-400 bg-green-900/40 rounded px-1 py-0.5">✓</span>
                          )}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {counts ? (
                        <span className={`font-semibold ${isSuspended ? 'text-red-400' : 'text-white'}`}>{counts.total}</span>
                      ) : (
                        <span className="text-gray-600">0</span>
                      )}
                      {counts && counts.active > 0 && !isSuspended && (
                        <span className="ml-1 text-[10px] text-green-400">({counts.active} active)</span>
                      )}
                      {counts && counts.active > 0 && isSuspended && (
                        <span className="ml-1 text-[10px] text-red-400">({counts.active} still active!)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/135265826/landlords/${p.id}`}
                        className="inline-block rounded-lg bg-gray-800 border border-gray-700 px-3 py-1 text-xs font-semibold text-gray-200 hover:bg-gray-700 hover:text-white transition"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
