'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminListingActions from './AdminListingActions';

interface Listing {
  id: string;
  title: string;
  address: string | null;
  city: string;
  state: string;
  status: string;
  monthly_rent: number | null;
  created_at: string;
  slug: string | null;
  listing_source: string | null;
  flags: number;
  property_group: string | null;
}

const statusColor: Record<string, string> = {
  active:    'bg-green-900 text-green-300',
  rented:    'bg-blue-900 text-blue-300',
  expired:   'bg-gray-700 text-gray-300',
  suspended: 'bg-red-900 text-red-300',
};

interface Props {
  address: string;
  listings: Listing[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export default function BuildingGroup({ address, listings, selectedIds, onToggle }: Props) {
  const [open, setOpen] = useState(false);

  const activeCount    = listings.filter((l) => l.status === 'active').length;
  const flaggedCount   = listings.reduce((n, l) => n + l.flags, 0);
  const suspendedCount = listings.filter((l) => l.status === 'suspended').length;
  const anySelected    = listings.some((l) => selectedIds.has(l.id));

  return (
    <div className={`rounded-xl border overflow-hidden transition ${anySelected ? 'border-green-700' : 'border-gray-800'}`}>
      {/* Building header row */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 transition text-left"
      >
        <span className="text-gray-400 text-sm">{open ? '▾' : '▸'}</span>
        <span className="text-lg">🏢</span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{address}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {listings.length} unit{listings.length !== 1 ? 's' : ''}
            {activeCount > 0 && <span className="ml-2 text-green-400">{activeCount} active</span>}
            {suspendedCount > 0 && <span className="ml-2 text-red-400">{suspendedCount} suspended</span>}
          </p>
        </div>
        {flaggedCount > 0 && (
          <span className="rounded-full bg-red-900 px-2 py-0.5 text-xs font-bold text-red-300">
            ⚑ {flaggedCount} flag{flaggedCount !== 1 ? 's' : ''}
          </span>
        )}
        <span className="text-xs text-gray-600 shrink-0">{open ? 'collapse' : 'expand'}</span>
      </button>

      {/* Units table */}
      {open && (
        <table className="w-full text-sm border-t border-gray-800">
          <thead className="bg-gray-950 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2 text-left w-8"></th>
              <th className="px-4 py-2 text-left">Unit / Title</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Rent</th>
              <th className="px-4 py-2 text-left">Listed</th>
              <th className="px-4 py-2 text-left">Flags</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {listings.map((l) => (
              <tr key={l.id} className={`transition ${selectedIds.has(l.id) ? 'bg-green-950/40' : 'hover:bg-gray-900/50'}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(l.id)}
                    onChange={() => onToggle(l.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-green-500 cursor-pointer"
                    aria-label={`Select ${l.address ?? l.title}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-white line-clamp-1 max-w-xs">{l.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l.address ?? '—'} · {l.listing_source ?? 'owner'}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColor[l.status] ?? 'bg-gray-700 text-gray-300'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">${l.monthly_rent?.toLocaleString() ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {l.flags > 0 ? (
                    <Link href="/135265826/flags" className="inline-flex items-center gap-1 rounded-full bg-red-900 px-2 py-0.5 text-xs font-bold text-red-300 hover:bg-red-800 transition">
                      ⚑ {l.flags}
                    </Link>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/rentals/${l.slug ?? l.id}`} target="_blank"
                      className="text-xs text-green-400 hover:text-green-300 font-semibold">
                      View ↗
                    </Link>
                    <AdminListingActions listingId={l.id} currentStatus={l.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
