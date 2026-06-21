'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deactivateListing, extendListing, getApplications, getMyListing, markRented } from '@/lib/landlord/client';
import { Application, LandlordListing } from '@/lib/landlord/types';
import { formatBaths, formatBeds, formatPrice, formatSqft } from '@/lib/format';
import PhotoManager from '@/components/PhotoManager';

type Tab = 'overview' | 'inquiries' | 'photos';

const LEASE_TERMS = [
  { value: 'month_to_month', label: 'Month-to-month' },
  { value: '6_months',       label: '6 months' },
  { value: '12_months',      label: '12 months' },
  { value: '24_months',      label: '24 months' },
]

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

function ExpiryBadge({ expiresAt }: { expiresAt?: string | null }) {
  const days = daysUntil(expiresAt);
  if (days === null) return null;
  if (days < 0) return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
      Expired
    </span>
  );
  if (days <= 7) return (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
      Expires in {days}d
    </span>
  );
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
      {days} days left
    </span>
  );
}

function MatchScore({ score }: { score?: number }) {
  if (score == null) return null;
  const color =
    score >= 80 ? 'text-brand-700 bg-brand-50' : score >= 60 ? 'text-amber-700 bg-amber-50' : 'text-gray-600 bg-gray-100';
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>
      {score}% match
    </span>
  );
}

export default function PropertyDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<LandlordListing | null | undefined>(undefined);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [rentedModal, setRentedModal] = useState(false);
  const [finalRent, setFinalRent] = useState('');
  const [leaseTerm, setLeaseTerm] = useState('12_months');

  async function handleExtend() {
    setActionBusy(true);
    try {
      const updated = await extendListing(id);
      setListing(updated);
      setActionMsg('Listing extended by 45 days.');
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Could not extend.');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm('Deactivate this listing? It will no longer appear in search results.')) return;
    setActionBusy(true);
    try {
      await deactivateListing(id);
      router.push('/landlord');
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Could not deactivate.');
      setActionBusy(false);
    }
  }

  async function handleMarkRented() {
    setFinalRent(listing?.price ? String(listing.price) : '');
    setRentedModal(true);
  }

  async function submitRented() {
    setActionBusy(true);
    try {
      await markRented(id, {
        finalRent: finalRent ? Number(finalRent) : undefined,
        leaseTerm,
      });
      router.push('/landlord');
    } catch (e) {
      setActionMsg(e instanceof Error ? e.message : 'Could not update status.');
      setActionBusy(false);
      setRentedModal(false);
    }
  }

  useEffect(() => {
    getMyListing(id).then(setListing).catch(() => setListing(null));
    getApplications(id).then(setApplications).catch(() => setApplications([]));
  }, [id]);

  if (listing === undefined) {
    return <p className="py-16 text-center text-gray-500">Loading property…</p>;
  }
  if (listing === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">Property not found</p>
        <Link href="/landlord" className="mt-3 inline-block font-semibold text-brand-600">
          ← Back to properties
        </Link>
      </div>
    );
  }

  const pending = applications.filter((a) => a.status === 'pending');

  return (
    <div>
      <Link href="/landlord" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← All properties
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-center gap-4">
        <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {listing.photos?.[0] && (
            <Image src={listing.photos[0]} alt="" fill sizes="112px" className="object-cover" />
          )}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">{listing.address}</h1>
            {listing.status === 'active' && (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
                ✓ Listed for rent
              </span>
            )}
            <ExpiryBadge expiresAt={listing.expiresAt} />
          </div>
          <p className="text-gray-600">
            {listing.city}, {listing.state} {listing.zip} · {formatPrice(listing.price)} ·{' '}
            {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)} · {formatSqft(listing.sqft)}
          </p>

          {/* Action buttons */}
          {actionMsg && (
            <p className="mt-2 text-sm font-semibold text-brand-700">{actionMsg}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/landlord/properties/${id}/edit`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-400 hover:text-brand-700">
              Edit listing
            </Link>
            <button onClick={handleExtend} disabled={actionBusy}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60">
              Extend 45 days
            </button>
            <button onClick={handleMarkRented} disabled={actionBusy}
              className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60">
              Mark as Rented
            </button>
            <button onClick={handleDeactivate} disabled={actionBusy}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-60">
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        {(['overview', 'photos', 'inquiries'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize transition ${
              tab === t
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t}
            {t === 'inquiries' && pending.length > 0 && (
              <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mark as Rented modal */}
      {rentedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-gray-900">Mark as Rented</h2>
            <p className="mt-1 text-sm text-gray-500">
              This data helps EMLAKIE provide accurate E-rent Value™ and E-sale Value™ estimates and supports licensed
              appraisers who use our comparable rental data.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Final rent amount <span className="font-normal text-gray-500">(what the tenant actually pays)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    value={finalRent}
                    onChange={(e) => setFinalRent(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-2.5 pl-8 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder={listing?.price ? String(listing.price) : '0'}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Pre-filled with your asking price. Update if tenant negotiated a different rate.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lease term</label>
                <select
                  value={leaseTerm}
                  onChange={(e) => setLeaseTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-2.5 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  {LEASE_TERMS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={submitRented}
                disabled={actionBusy}
                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {actionBusy ? 'Saving…' : 'Confirm — Mark as Rented'}
              </button>
              <button
                onClick={() => setRentedModal(false)}
                disabled={actionBusy}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'photos' ? (
        <div className="mt-8">
          <PhotoManager listingId={listing.id} initialPhotos={listing.photos ?? []} />
        </div>
      ) : tab === 'inquiries' ? (
        <div className="mt-8 space-y-4">
          {applications.length === 0 && (
            <p className="py-12 text-center text-gray-500">
              No inquiries yet. Share your listing to get applicants.
            </p>
          )}
          {applications.map((app) => (
            <div key={app.id} className="rounded-2xl border border-gray-200 p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                    {(app.tenant_name ?? '?').charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">{app.tenant_name ?? 'Applicant'}</p>
                    <p className="text-xs text-gray-500">
                      Income ${app.income.toLocaleString()}/mo ·{' '}
                      {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MatchScore score={app.ai_match_score} />
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                      app.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : app.status === 'approved'
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {app.status === 'approved' ? 'Responded' : app.status === 'rejected' ? 'Ignored' : app.status}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-gray-700">{app.message}</p>
              {app.ai_summary && (
                <p className="mt-3 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-900">
                  <span className="font-semibold">AI summary:</span> {app.ai_summary}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : tab === 'overview' ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { label: 'Views', value: listing.view_count ?? 0 },
            { label: 'Inquiries', value: listing.applicant_count ?? applications.length },
            { label: 'Monthly rent', value: formatPrice(listing.price) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-200 p-6 shadow-card">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-gray-200 p-6 shadow-card sm:col-span-3">
            <h2 className="font-bold text-gray-900">Listing details</h2>
            <p className="mt-2 text-gray-700">{listing.title}</p>
            {listing.amenities?.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">Amenities: {listing.amenities.join(', ')}</p>
            )}
            <Link
              href={`/rentals/${listing.slug ?? listing.id}`}
              className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View public listing →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
