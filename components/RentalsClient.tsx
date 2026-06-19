'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import ListingCard from './ListingCard';
import SaveSearchModal from './SaveSearchModal';
import { Listing } from '@/lib/types';
import { pointInPolygon } from '@/lib/geo';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

type View = 'list' | 'map' | 'split';

interface Props {
  listings: Listing[];
  allMapListings?: Pick<Listing, 'id' | 'lat' | 'lng' | 'price' | 'address' | 'slug'>[];
  total: number;
  usingSampleData: boolean;
  heading: string;
  filters?: Record<string, string>;
  searchLabel?: string;
}

export default function RentalsClient({ listings, allMapListings, total, usingSampleData, heading, filters = {}, searchLabel = 'All rentals' }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map' | 'split'>('split');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [polygon, setPolygon] = useState<[number, number][] | null>(null);

  const filteredListings = polygon
    ? listings.filter((l) => l.lat != null && l.lng != null && pointInPolygon([l.lat!, l.lng!], polygon))
    : listings;

  const handlePolygonChange = (pts: [number, number][] | null) => {
    setPolygon(pts);
    if (pts) setDrawMode(false);
  };

  const [clearSignal, setClearSignal] = useState(0);
  const [satellite, setSatellite] = useState(false);

  const clearPolygon = () => {
    setPolygon(null);
    setDrawMode(false);
    setClearSignal((n) => n + 1);
  };
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const searchParams = useSearchParams();

  useEffect(() => {
    const alert = searchParams.get('alert');
    if (alert === 'verified') setAlertBanner('Your alert is active! You\'ll get emailed when new homes match your search.');
    else if (alert === 'unsubscribed') setAlertBanner('You\'ve been unsubscribed from this alert.');
  }, [searchParams]);

  const handleMarkerClick = useCallback((id: string) => {
    setActiveId(id);
    const el = cardRefs.current.get(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const hasMappable = listings.some((l) => l.lat != null && l.lng != null);

  return (
    <div className="flex flex-col sm:h-[calc(100vh-64px)] sm:overflow-hidden">
      {/* ── Alert banner ── */}
      {alertBanner && (
        <div className="flex items-center justify-between bg-green-600 px-4 py-2.5 text-sm font-medium text-white">
          <span>{alertBanner}</span>
          <button onClick={() => setAlertBanner(null)} aria-label="Dismiss alert" className="ml-4 text-white/80 hover:text-white" aria-hidden="false"><span aria-hidden="true">✕</span></button>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{heading}</h1>
          <p className="text-sm text-gray-500">
            {polygon ? `${filteredListings.length} of ${total}` : total} {total === 1 ? 'home' : 'homes'} {polygon ? 'in selected area' : 'available'}
          </p>
        </div>

        {/* Desktop: split / list / map toggle */}
        {hasMappable && (
          <div className="hidden items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:flex">
            {(['list', 'split', 'map'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={`${v === 'split' ? 'Split' : v === 'list' ? 'List' : 'Map'} view`}
                aria-pressed={view === v}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span aria-hidden="true">{v === 'split' ? '⊞ Split' : v === 'list' ? '☰ List' : '⊙ Map'}</span>
              </button>
            ))}
          </div>
        )}

        {/* Draw area button — only in map/split view */}
        {hasMappable && (view === 'map' || view === 'split') && (
          polygon ? (
            <button
              onClick={clearPolygon}
              className="hidden items-center gap-1.5 rounded-xl border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition sm:flex"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear area ({filteredListings.length} homes)
            </button>
          ) : (
            <button
              onClick={() => setDrawMode((d) => !d)}
              className={`hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition sm:flex ${
                drawMode
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.536-6.536a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
              </svg>
              {drawMode ? 'Drawing…' : 'Draw area'}
            </button>
          )
        )}

        {/* Satellite toggle */}
        {hasMappable && (view === 'map' || view === 'split') && (
          <button
            onClick={() => setSatellite((s) => !s)}
            className={`hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition sm:flex ${
              satellite
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
            {satellite ? 'Street map' : 'Satellite'}
          </button>
        )}

        {/* Save Search button */}
        <button
          onClick={() => setShowSaveModal(true)}
          className="hidden items-center gap-1.5 rounded-xl border border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition sm:flex"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Save Search
        </button>

        {/* Mobile: list / map toggle */}
        {hasMappable && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 sm:hidden">
            <button
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <span aria-hidden="true">☰ List</span>
            </button>
            <button
              onClick={() => setView('map')}
              aria-label="Map view"
              aria-pressed={view === 'map'}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                view === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <span aria-hidden="true">⊙ Map</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex sm:flex-1 sm:overflow-hidden sm:min-h-0">

        {/* Listings panel */}
        <div
          className={`flex flex-col bg-gray-50 transition-all duration-300 sm:overflow-y-auto ${
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
              {filteredListings.map((listing) => (
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
            style={{ isolation: 'isolate' }}
            className={`transition-all duration-300 ${
              view === 'list'
                ? 'hidden'
                : view === 'split'
                ? 'hidden sm:block sm:w-1/2'
                : 'w-full'
            }`}
          >
            <MapView
              listings={(allMapListings ?? listings) as Listing[]}
              activeId={activeId}
              onMarkerClick={handleMarkerClick}
              drawMode={drawMode}
              onPolygonChange={handlePolygonChange}
              clearSignal={clearSignal}
              satellite={satellite}
            />
          </div>
        )}
      </div>

      {showSaveModal && (
        <SaveSearchModal
          label={searchLabel}
          filters={filters}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
