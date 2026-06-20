import { adminClient } from '@/lib/moderator';
import Link from 'next/link';
import AdminReportActions from './AdminReportActions';

export const dynamic = 'force-dynamic';

export default async function FlagsPage() {
  const sb = adminClient();
  const { data: reports } = await sb
    .from('listing_reports')
    .select('id, reason, details, created_at, reviewed, reporter_ip, listing_id, listings(id, title, city, state, slug, status)')
    .order('created_at', { ascending: false })
    .limit(500);

  const open = (reports ?? []).filter((r) => !r.reviewed);
  const done = (reports ?? []).filter((r) => r.reviewed);

  type Report = NonNullable<typeof reports>[0];
  function ReportRow({ r }: { r: Report }) {
    const listing = Array.isArray(r.listings) ? r.listings[0] : null;
    return (
      <tr className="hover:bg-gray-900/50 transition">
        <td className="px-4 py-3">
          <div className="font-semibold text-white">{listing?.title ?? r.listing_id}</div>
          <div className="text-xs text-gray-500">{listing?.city}, {listing?.state}</div>
        </td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-red-900 px-2 py-0.5 text-xs font-semibold text-red-300">{r.reason}</span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-400 max-w-xs">
          {r.details ?? <span className="text-gray-600 italic">No details</span>}
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {new Date(r.created_at).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {listing && (
              <Link
                href={`/rentals/${listing.slug ?? listing.id}`}
                target="_blank"
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
              >
                View ↗
              </Link>
            )}
            <AdminReportActions reportId={r.id} listingId={r.listing_id} reviewed={r.reviewed} />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-extrabold text-white mb-1">Flagged Reports</h1>
        <p className="text-sm text-gray-400">{open.length} open · {done.length} reviewed</p>
      </div>

      {open.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Open — needs review</h2>
          <div className="rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Listing</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Details</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {open.map((r) => <ReportRow key={r.id} r={r} />)}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {open.length === 0 && (
        <div className="rounded-2xl border border-gray-800 py-16 text-center text-gray-500">
          No open reports — all clear.
        </div>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Reviewed</h2>
          <div className="rounded-2xl border border-gray-800 overflow-hidden opacity-60">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Listing</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Details</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {done.map((r) => <ReportRow key={r.id} r={r} />)}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
