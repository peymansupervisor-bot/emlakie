'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMyListings } from '@/lib/landlord/client';
import { LandlordListing } from '@/lib/landlord/types';
import { formatPrice, formatPropertyType } from '@/lib/format';

type Tab = 'all' | 'forRent' | 'offMarket';

const leaseLabel: Record<string, { label: string; cls: string }> = {
  active: { label: 'Seeking tenant', cls: 'text-brand-700' },
  rented: { label: 'Leased', cls: 'text-blue-700' },
  paused: { label: 'Paused', cls: 'text-amber-700' },
  draft: { label: '—', cls: 'text-gray-400' },
};

const statusPill: Record<string, { label: string; cls: string }> = {
  active: { label: 'Listed for rent', cls: 'bg-brand-100 text-brand-800' },
  rented: { label: 'Rented', cls: 'bg-blue-100 text-blue-800' },
  paused: { label: 'Paused', cls: 'bg-amber-100 text-amber-800' },
  draft: { label: 'Draft', cls: 'bg-gray-200 text-gray-700' },
};

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const justCreated = searchParams.get('created') === '1';
  const [listings, setListings] = useState<LandlordListing[] | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMyListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load properties.'));
  }, []);

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>;
  }
  if (!listings) {
    return <p className="py-16 text-center text-gray-400">Loading properties…</p>;
  }

  const forRent = listings.filter((l) => l.status === 'active');
  const offMarket = listings.filter((l) => l.status !== 'active');
  const byTab = tab === 'all' ? listings : tab === 'forRent' ? forRent : offMarket;
  const q = search.toLowerCase();
  const visible = q
    ? byTab.filter((l) =>
        l.address?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.zip?.includes(q)
      )
    : byTab;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: `All (${listings.length})` },
    { id: 'forRent', label: `For rent (${forRent.length})` },
    { id: 'offMarket', label: `Off market (${offMarket.length})` },
  ];

  const totalViews = listings?.reduce((s, l) => s + (l.view_count ?? 0), 0) ?? 0;
  const totalApplicants = listings?.reduce((s, l) => s + (l.applicant_count ?? 0), 0) ?? 0;
  const activeCount = listings?.filter((l) => l.status === 'active').length ?? 0;

  return (
    <div>
      {justCreated && (
        <div className="mb-6 rounded-xl bg-brand-50 border border-brand-200 px-5 py-4 text-brand-800 font-semibold">
          ✓ Your listing was published successfully! It may take a few minutes to appear in search results.
        </div>
      )}

      {/* Stats overview */}
      {listings && listings.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Active listings', value: activeCount },
            { label: 'Total listings', value: listings.length },
            { label: 'Total views', value: totalViews },
            { label: 'Total applicants', value: totalApplicants },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{s.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Properties</h1>
        <Link
          href="/landlord/properties/new"
          className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
        >
          + Add a property
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                tab === t.id
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-gray-400" fill="none" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by address, city, or ZIP"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-1.5 pl-9 pr-4 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-gray-900">No properties here yet</p>
          <p className="mt-2 text-gray-600">
            Add your first property and start receiving applications.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Address</th>
                <th className="hidden px-4 py-3 sm:table-cell">Rent</th>
                <th className="hidden px-4 py-3 md:table-cell">Views</th>
                <th className="px-4 py-3">Leads</th>
                <th className="hidden px-4 py-3 lg:table-cell">Lease</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((listing) => {
                const pill = statusPill[listing.status] ?? statusPill.draft;
                return (
                  <tr key={listing.id} className="bg-white transition hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/landlord/properties/${listing.id}`} className="flex items-center gap-3">
                        <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {listing.photos?.[0] && (
                            <Image src={listing.photos[0]} alt="" fill sizes="64px" className="object-cover" />
                          )}
                        </span>
                        <span>
                          <span className="block font-semibold text-gray-900">{listing.address}</span>
                          <span className="block text-xs text-gray-500">
                            {listing.city}, {listing.state} · {formatPropertyType(listing.property_type)}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 font-semibold text-gray-900 sm:table-cell">
                      {formatPrice(listing.price)}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">
                      {listing.view_count ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      {listing.applicant_count ? (
                        <Link href={`/landlord/leads?listing=${listing.id}`}
                          className="font-semibold text-brand-700 hover:underline">
                          {listing.applicant_count} new{listing.applicant_count === 1 ? '' : ''}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className={`text-sm font-semibold ${(leaseLabel[listing.status] ?? leaseLabel.draft).cls}`}>
                        {(leaseLabel[listing.status] ?? leaseLabel.draft).label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pill.cls}`}>
                        {pill.label}
                      </span>
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
