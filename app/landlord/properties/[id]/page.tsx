'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getApplications, getMyListing } from '@/lib/landlord/client';
import { Application, LandlordListing } from '@/lib/landlord/types';
import { formatBaths, formatBeds, formatPrice, formatSqft } from '@/lib/format';

type Tab = 'overview' | 'applications';

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
  const [listing, setListing] = useState<LandlordListing | null | undefined>(undefined);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    getMyListing(id).then(setListing).catch(() => setListing(null));
    getApplications(id).then(setApplications).catch(() => setApplications([]));
  }, [id]);

  if (listing === undefined) {
    return <p className="py-16 text-center text-gray-400">Loading property…</p>;
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
          </div>
          <p className="text-gray-600">
            {listing.city}, {listing.state} {listing.zip} · {formatPrice(listing.price)} ·{' '}
            {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)} · {formatSqft(listing.sqft)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        {(['overview', 'applications'] as Tab[]).map((t) => (
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
            {t === 'applications' && pending.length > 0 && (
              <span className="ml-2 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { label: 'Views', value: listing.view_count ?? 0 },
            { label: 'Applicants', value: listing.applicant_count ?? applications.length },
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
              href={`/rentals/${listing.id}`}
              className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View public listing →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {applications.length === 0 && (
            <p className="py-12 text-center text-gray-500">
              No applications yet. Share your listing to get applicants.
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
                    {app.status}
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
      )}
    </div>
  );
}
