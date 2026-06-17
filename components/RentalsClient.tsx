'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ListingCard from './ListingCard';
import { Listing } from '@/lib/types';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

type View = 'list' | 'map' | 'split';

interface Props {
  listings: Listing[];
  total: number;
  usingSampleData: boolean;
  heading: string;
}

export default function RentalsClient({ listings, total, usingSampleData, heading }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map' | 'split'>('split');
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleMarkerClick = useCallback((id: string) => {
    setActiveId(id);
    const el = cardRefs.current.get(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const hasMappable = listings.some((l) => l.lat != null && l.lng != null);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{heading}</h1>
          <p className="text-sm text-gray-500">
            {total} {total === 1 ? 'home' : 'homes'} available
          </p>
        </div>

        {/* Desktop: split / list / map toggle */}
        {hasMappable && (
          <div className="hidden items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:flex">
            {(['list', 'split', 'map'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'split' ? '⊞ Split' : v === 'list' ? '☰ List' : '⊙ Map'}
              </button>
            ))}
          </div>
        )}

        {/* Mobile: list / map toggle */}
        {hasMappable && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:hidden">
            <button
              onClick={() => setView('list')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              ☰ List
            </button>
            <button
              onClick={() => setView('map')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                view === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              ⊙ Map
            </button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Listings panel */}
        <div
          className={`flex flex-col overflow-y-auto bg-gray-50 transition-all duration-300 ${
            view === 'map'
              ? 'hidden'
              : view === 'split'
              ? 'w-full sm:w-1/2'
              : 'w-full'
          }`}
        >
          {usingSampleData && (
            <div className="mx-4 mt-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              Viewing sample listings — real homes coming soon.
            </div>
          )}

          {listings.length === 0 ? (
            <div className="mt-20 text-center">
              <p className="text-lg font-semibold text-gray-900">No homes match those filters</p>
              <p className="mt-2 text-sm text-gray-500">Try widening your search.</p>
            </div>
          ) : (
            <div
              className={`grid gap-4 p-4 ${
                view === 'split'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(listing.id, el);
                  }}
                  onMouseEnter={() => setActiveId(listing.id)}
                  onMouseLeave={() => setActiveId(null)}
                  className={`rounded-xl transition-shadow duration-150 ${
                    activeId === listing.id ? 'ring-2 ring-brand-500 ring-offset-1' : ''
                  }`}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map panel */}
        {hasMappable && (
          <div
            className={`transition-all duration-300 ${
              view === 'list'
                ? 'hidden'
                : view === 'split'
                ? 'hidden sm:block sm:w-1/2'
                : 'w-full'
            }`}
          >
            <MapView
              listings={listings}
              activeId={activeId}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
