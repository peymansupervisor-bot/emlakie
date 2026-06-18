'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getApplications, getMyListings } from '@/lib/landlord/client';
import { Application, LandlordListing } from '@/lib/landlord/types';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

function MatchScore({ score }: { score?: number }) {
  if (score == null) return null;
  const cls = score >= 80
    ? 'bg-brand-50 text-brand-700'
    : score >= 60
    ? 'bg-amber-50 text-amber-700'
    : 'bg-gray-100 text-gray-600';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>
      {score}% match
    </span>
  );
}

interface Lead extends Application {
  listingAddress?: string;
}

export default function LeadsPage() {
  const searchParams = useSearchParams();
  const filterListing = searchParams.get('listing');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [listings, setListings] = useState<LandlordListing[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMyListings().then(async (ls) => {
      setListings(ls);
      const allApps = await Promise.all(
        ls.map((l) =>
          getApplications(l.id).then((apps) =>
            apps.map((a) => ({ ...a, listingAddress: l.address }))
          ).catch(() => [] as Lead[])
        )
      );
      setLeads(allApps.flat().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    }).catch(() => setLeads([]));
  }, []);

  if (!leads) return <p className="py-16 text-center text-gray-500">Loading leads…</p>;

  const filtered = leads.filter((l) => {
    if (filterListing && l.listing_id !== filterListing) return false;
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.tenant_name?.toLowerCase().includes(q) ||
        l.listingAddress?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pending = leads.filter((l) => l.status === 'pending').length;

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: `All (${leads.length})` },
    { id: 'pending', label: `New (${pending})` },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Declined' },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">All applicants across your properties</p>
        </div>
        {pending > 0 && (
          <span className="rounded-full bg-brand-600 px-3 py-1 text-sm font-bold text-white">
            {pending} new
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter leads" className="flex gap-2">
          {filters.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                filter === f.id
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <label htmlFor="leads-search" className="sr-only">Search leads</label>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-gray-400" fill="none" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input id="leads-search" type="text" placeholder="Search by name or address"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-semibold text-gray-900">No leads yet</p>
          <p className="mt-2 text-sm text-gray-500">
            When renters apply to your listings they'll appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 shrink-0">
                    {(lead.tenant_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{lead.tenant_name ?? 'Applicant'}</p>
                    <p className="text-xs text-gray-500">
                      {lead.listingAddress} · Income ${lead.income.toLocaleString()}/mo ·{' '}
                      {new Date(lead.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MatchScore score={lead.ai_match_score} />
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    lead.status === 'pending' ? 'bg-amber-100 text-amber-800'
                    : lead.status === 'approved' ? 'bg-brand-100 text-brand-800'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700">{lead.message}</p>
              {lead.ai_summary && (
                <p className="mt-3 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-900">
                  <span className="font-semibold">AI summary:</span> {lead.ai_summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
