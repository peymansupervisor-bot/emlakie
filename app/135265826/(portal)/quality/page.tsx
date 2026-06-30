import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import ProvisionPhoneButton from './ProvisionPhoneButton';

export const dynamic = 'force-dynamic';

type IssueKey = 'no_photos' | 'no_virtual_phone' | 'no_profile_phone' | 'broker_no_agent' | 'no_geocode' | 'short_description';

const ISSUE_LABELS: Record<IssueKey, string> = {
  no_photos: 'No photos',
  no_virtual_phone: 'No virtual phone',
  no_profile_phone: 'No profile phone',
  broker_no_agent: 'Broker missing agent name',
  no_geocode: 'Not geocoded',
  short_description: 'Short description',
};

const ISSUE_COLORS: Record<IssueKey, string> = {
  no_photos: 'bg-red-900 text-red-300',
  no_virtual_phone: 'bg-orange-900 text-orange-300',
  no_profile_phone: 'bg-red-900 text-red-300',
  broker_no_agent: 'bg-red-900 text-red-300',
  no_geocode: 'bg-yellow-900 text-yellow-300',
  short_description: 'bg-gray-800 text-gray-400',
};

export default async function QualityPage() {
  const sb = adminClient();

  // Fetch listings from the last 30 days with profile data
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: listings } = await sb
    .from('listings')
    .select('id, slug, title, address, city, state, zip, status, photos, listing_source, agent_name, lat, lng, description, created_at, landlord_id, profiles!landlord_id(phone, virtual_phone)')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(200);

  type Row = NonNullable<typeof listings>[0];
  type ProfileData = { phone?: string | null; virtual_phone?: string | null } | null;

  function getIssues(l: Row): IssueKey[] {
    const issues: IssueKey[] = [];
    const profile = (Array.isArray(l.profiles) ? l.profiles[0] : l.profiles) as ProfileData;

    const photos = (l.photos as string[] | null) ?? [];
    if (photos.length === 0) issues.push('no_photos');

    if (!profile?.virtual_phone) issues.push('no_virtual_phone');
    if (!profile?.phone) issues.push('no_profile_phone');

    if (l.listing_source === 'broker' && !l.agent_name) issues.push('broker_no_agent');

    if (!l.lat || !l.lng) issues.push('no_geocode');

    const desc = (l.description as string | null) ?? '';
    if (desc.trim().length < 50) issues.push('short_description');

    return issues;
  }

  const rows = (listings ?? []).map((l) => ({ ...l, issues: getIssues(l) }));
  const withIssues = rows.filter((r) => r.issues.length > 0);
  const clean = rows.filter((r) => r.issues.length === 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-extrabold text-white mb-1">Listing Quality</h1>
        <p className="text-sm text-gray-400">
          Last 30 days · {withIssues.length} with issues · {clean.length} clean
        </p>
      </div>

      {withIssues.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-16 text-center text-gray-500">
          All recent listings are clean.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Listing</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Issues</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {withIssues.map((l) => {
                const profile = (Array.isArray(l.profiles) ? l.profiles[0] : l.profiles) as ProfileData;
                return (
                  <tr key={l.id} className="hover:bg-gray-900/50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{l.title || l.address}</div>
                      <div className="text-xs text-gray-500">{l.city}, {l.state}</div>
                      <div className="text-xs font-mono text-gray-600 mt-0.5">{l.status}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {l.issues.map((issue) => (
                          <span
                            key={issue}
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ISSUE_COLORS[issue]}`}
                          >
                            {ISSUE_LABELS[issue]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/rentals/${l.slug ?? l.id}`}
                          target="_blank"
                          className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                        >
                          View ↗
                        </Link>
                        <Link
                          href={`/135265826/listings/${l.id}`}
                          className="text-xs text-gray-400 hover:text-white font-semibold"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/135265826/landlords/${l.landlord_id}`}
                          className="text-xs text-gray-400 hover:text-white font-semibold"
                        >
                          Landlord
                        </Link>
                        {l.issues.includes('no_virtual_phone') && (
                          <ProvisionPhoneButton
                            landlordId={l.landlord_id}
                            zip={l.zip ?? undefined}
                            city={l.city ?? undefined}
                            state={l.state ?? undefined}
                            hasProfilePhone={!!profile?.phone}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {clean.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-green-500 uppercase tracking-widest mb-3">
            Clean ({clean.length})
          </h2>
          <div className="rounded-2xl border border-gray-800 overflow-hidden opacity-60">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Listing</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {clean.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-3">
                      <Link href={`/rentals/${l.slug ?? l.id}`} target="_blank" className="text-white hover:text-brand-400 font-semibold">
                        {l.title || l.address}
                      </Link>
                      <div className="text-xs text-gray-500">{l.city}, {l.state}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          l.status === 'active'
                            ? 'bg-green-900 text-green-300'
                            : l.status === 'suspended'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
