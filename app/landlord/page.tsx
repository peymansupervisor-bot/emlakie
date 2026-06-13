'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMyListings } from '@/lib/landlord/client';
import { LandlordListing } from '@/lib/landlord/types';
import { formatPrice, formatPropertyType } from '@/lib/format';

type Tab = 'all' | 'forRent' | 'offMarket';

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
  const visible = tab === 'all' ? listings : tab === 'forRent' ? forRent : offMarket;

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

      <div className="mt-6 flex gap-2">
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
                <th className="px-4 py-3">Applicants</th>
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
                        <span className="font-semibold text-brand-700">
                          {listing.applicant_count} applicant{listing.applicant_count === 1 ? '' : 's'}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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
