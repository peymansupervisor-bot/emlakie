'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MlsListing {
  ListingKey: string;
  ListingId: string;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  ListPrice: number;
  BedroomsTotal: number;
  BathroomsTotalInteger: number;
  LivingArea: number | null;
  PropertySubType: string;
  PublicRemarks: string;
  Media: { MediaURL: string; Order: number }[];
  ModificationTimestamp: string;
}

type ImportStatus = 'idle' | 'importing' | 'done' | 'error';

export default function ImportFromMlsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<MlsListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMap, setStatusMap] = useState<Record<string, ImportStatus>>({});
  const [resultMap, setResultMap] = useState<Record<string, { id: string; photoCount: number }>>({});

  useEffect(() => {
    fetch('/api/listhub')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setListings(d.listings);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function importListing(listing: MlsListing) {
    setStatusMap(p => ({ ...p, [listing.ListingKey]: 'importing' }));
    try {
      const res = await fetch('/api/listhub/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer internal' },
        body: JSON.stringify({ listing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatusMap(p => ({ ...p, [listing.ListingKey]: 'done' }));
      setResultMap(p => ({ ...p, [listing.ListingKey]: data }));
    } catch (e) {
      setStatusMap(p => ({ ...p, [listing.ListingKey]: 'error' }));
    }
  }

  async function importAll() {
    for (const l of listings) {
      if (statusMap[l.ListingKey] === 'done') continue;
      await importListing(l);
    }
  }

  const coverPhoto = (l: MlsListing) =>
    [...(l.Media ?? [])].sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0))[0]?.MediaURL;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import from MLS</h1>
          <p className="text-sm text-gray-500 mt-1">Your active MLS listings — import them to EMLAKIE with one click</p>
        </div>
        {listings.length > 0 && (
          <button
            onClick={importAll}
            className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition"
          >
            Import All ({listings.length})
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
          <span className="ml-3 text-gray-500">Fetching your MLS listings…</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">Couldn&apos;t connect to ListHub</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
          <p className="text-xs text-gray-500 mt-3">Make sure LISTHUB_CLIENT_ID and LISTHUB_CLIENT_SECRET are set in Vercel.</p>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-500">
          No active MLS listings found in your ListHub account.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {listings.map(l => {
          const status = statusMap[l.ListingKey] ?? 'idle';
          const result = resultMap[l.ListingKey];
          const thumb = coverPhoto(l);

          return (
            <div key={l.ListingKey} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col">
              {thumb && (
                <div className="relative h-44 w-full bg-gray-100">
                  <Image src={thumb} alt={l.UnparsedAddress} fill className="object-cover" />
                  <span className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                    {l.Media?.length ?? 0} photos
                  </span>
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="font-semibold text-gray-900 truncate">{l.UnparsedAddress}</p>
                <p className="text-sm text-gray-500">{l.City}, {l.StateOrProvince} {l.PostalCode}</p>
                <div className="mt-2 flex gap-3 text-sm text-gray-600">
                  <span>${l.ListPrice?.toLocaleString()}/mo</span>
                  <span>·</span>
                  <span>{l.BedroomsTotal} bd</span>
                  <span>·</span>
                  <span>{l.BathroomsTotalInteger} ba</span>
                  {l.LivingArea && <><span>·</span><span>{l.LivingArea.toLocaleString()} sqft</span></>}
                </div>
                <p className="text-xs text-gray-500 mt-1">MLS# {l.ListingId}</p>

                <div className="mt-auto pt-4">
                  {status === 'idle' && (
                    <button
                      onClick={() => importListing(l)}
                      className="w-full rounded-xl bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-800 transition"
                    >
                      Import to EMLAKIE
                    </button>
                  )}
                  {status === 'importing' && (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600" />
                      Importing {l.Media?.length} photos…
                    </div>
                  )}
                  {status === 'done' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-green-600">✓ Imported ({result?.photoCount} photos)</span>
                      <button
                        onClick={() => router.push(`/landlord/properties/${result?.id}`)}
                        className="text-sm text-brand-600 hover:underline"
                      >
                        View listing →
                      </button>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-500">Import failed</span>
                      <button onClick={() => importListing(l)} className="text-sm text-brand-600 hover:underline">Retry</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
