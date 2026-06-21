'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMyListings, updateListing } from '@/lib/landlord/client';
import { LandlordListing } from '@/lib/landlord/types';
import { formatPrice, formatPropertyType } from '@/lib/format';

type Tab = 'all' | 'forRent' | 'offMarket';

function expiryText(iso?: string | null): { text: string; cls: string } {
  if (!iso) return { text: '—', cls: 'text-gray-500' };
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: 'Expired', cls: 'font-semibold text-red-600' };
  if (days <= 7) return { text: `${days}d left`, cls: 'font-semibold text-amber-600' };
  return { text: `${days}d left`, cls: 'text-gray-500' };
}

const leaseLabel: Record<string, { label: string; cls: string }> = {
  active: { label: 'Seeking tenant', cls: 'text-brand-700' },
  rented: { label: 'Leased', cls: 'text-blue-700' },
  lease_in_progress: { label: 'Lease in progress', cls: 'text-amber-700' },
  coming_soon: { label: 'Coming soon', cls: 'text-purple-700' },
  draft: { label: '—', cls: 'text-gray-500' },
};

const statusPill: Record<string, { label: string; cls: string }> = {
  active: { label: 'Listed for rent', cls: 'bg-brand-100 text-brand-800' },
  rented: { label: 'Rented', cls: 'bg-blue-100 text-blue-800' },
  lease_in_progress: { label: 'Lease in progress', cls: 'bg-amber-100 text-amber-800' },
  coming_soon: { label: 'Coming soon', cls: 'bg-purple-100 text-purple-800' },
  draft: { label: 'Draft', cls: 'bg-gray-200 text-gray-700' },
};

function PriceEditor({ listing, onSaved }: { listing: LandlordListing; onSaved: (id: string, price: number) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(listing.price ?? ''));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function openEditor(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setValue(String(listing.price ?? ''));
    setErr('');
    setOpen(true);
    setTimeout(() => inputRef.current?.select(), 30);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (!num) { setErr('Enter a valid price.'); return; }
    if (num === listing.price) { setOpen(false); return; }
    setSaving(true);
    setErr('');
    try {
      await updateListing(listing.id, { price: num });
      onSaved(listing.id, num);
      setOpen(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="relative inline-flex items-center gap-1.5">
      <span className="font-semibold text-gray-900">{formatPrice(listing.price)}</span>
      <button
        onClick={openEditor}
        aria-label="Edit price"
        className="rounded p-0.5 text-gray-400 opacity-0 transition hover:text-brand-600 group-hover/row:opacity-100 focus:opacity-100"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
        </svg>
      </button>

      {open && (
        <>
          <span className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-full z-20 mt-1 flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
          >
            <span className="pl-1 text-sm text-gray-500">$</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
              className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
            />
            <span className="text-xs text-gray-400">/mo</span>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? '…' : 'Save'}
            </button>
          </form>
          {err && (
            <span className="absolute left-0 top-full mt-1 z-30 rounded bg-red-50 border border-red-200 px-2 py-1 text-xs text-red-700 whitespace-nowrap">
              {err}
            </span>
          )}
        </>
      )}
    </span>
  );
}

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const justCreated = searchParams.get('created') === '1';
  const [listings, setListings] = useState<LandlordListing[] | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  function handlePriceSaved(id: string, price: number) {
    setListings((prev) => prev?.map((l) => l.id === id ? { ...l, price } : l) ?? null);
  }

  useEffect(() => {
    getMyListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load properties.'));
  }, []);

  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>;
  }
  if (!listings) {
    return <p className="py-16 text-center text-gray-500">Loading properties…</p>;
  }

  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  const sorted = [...listings].sort((a, b) =>
    collator.compare(a.address ?? '', b.address ?? '')
  );
  const forRent = sorted.filter((l) => l.status === 'active');
  const offMarket = sorted.filter((l) => l.status !== 'active');
  const byTab = tab === 'all' ? sorted : tab === 'forRent' ? forRent : offMarket;
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

  const totalApplicants = listings?.reduce((s, l) => s + (l.applicant_count ?? 0), 0) ?? 0;
  const activeCount = listings?.filter((l) => l.status === 'active').length ?? 0;
  const comingSoonCount = listings?.filter((l) => l.status === 'coming_soon').length ?? 0;
  const lease_in_progressCount = listings?.filter((l) => l.status === 'lease_in_progress').length ?? 0;

  return (
    <div>
      {justCreated && (
        <div role="status" aria-live="polite" className="mb-6 rounded-xl bg-brand-50 border border-brand-200 px-5 py-4 text-brand-800 font-semibold">
          ✓ Your listing was published successfully! It may take a few minutes to appear in search results.
        </div>
      )}

      {/* Stats overview */}
      {listings && listings.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Active listings', value: activeCount, filter: 'forRent' as Tab },
            { label: 'Coming soon', value: comingSoonCount, filter: null },
            { label: 'Lease in progress', value: lease_in_progressCount, filter: null },
            { label: 'Total applicants', value: totalApplicants, filter: null },
          ].map((s) => (
            s.label === 'Total applicants' ? (
              <Link
                key={s.label}
                href="/landlord/leads"
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card text-left transition hover:border-brand-400 hover:shadow-card-hover"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">{s.value}</p>
              </Link>
            ) : s.filter ? (
              <button
                key={s.label}
                onClick={() => { setTab(s.filter!); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
                className={`rounded-2xl border p-4 shadow-card text-left transition hover:border-brand-400 hover:shadow-card-hover ${tab === s.filter ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">{s.value}</p>
              </button>
            ) : (
              <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{s.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">{s.value}</p>
              </div>
            )
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">Properties</h1>
        <div className="flex gap-3">
          <Link
            href="/landlord/properties/import"
            className="rounded-xl border border-brand-600 px-5 py-2.5 font-semibold text-brand-600 transition hover:bg-brand-50"
          >
            Import from MLS
          </Link>
          <Link
            href="/landlord/properties/new"
            className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            + Add a property
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter properties" className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              onClick={() => setTab(t.id)}
              aria-selected={tab === t.id}
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
          <label htmlFor="property-search" className="sr-only">Search properties</label>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-gray-400" fill="none" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            id="property-search"
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
                <th scope="col" className="px-4 py-3">Address</th>
                <th scope="col" className="hidden px-4 py-3 sm:table-cell">Rent</th>
                <th scope="col" className="hidden px-4 py-3 md:table-cell">Views</th>
                <th scope="col" className="px-4 py-3">Leads</th>
                <th scope="col" className="hidden px-4 py-3 lg:table-cell">Expires</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((listing) => {
                const pill = statusPill[listing.status] ?? statusPill.draft;
                return (
                  <tr key={listing.id} className="group/row bg-white transition hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/landlord/properties/${listing.id}`} className="flex items-center gap-3">
                        <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {listing.photos?.[0] && (
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={listing.photos[0]} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
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
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <PriceEditor listing={listing} onSaved={handlePriceSaved} />
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
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className={`text-sm ${expiryText(listing.expiresAt).cls}`}>
                        {expiryText(listing.expiresAt).text}
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
