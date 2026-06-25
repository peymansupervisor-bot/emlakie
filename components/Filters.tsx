'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { isAddressQuery } from '@/lib/address-utils';

const PRICE_OPTIONS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];

const AMENITY_OPTIONS = [
  'Air conditioning', 'Heating', 'In-unit laundry', 'Laundry in building',
  'Dishwasher', 'Parking', 'Garage', 'Pet-friendly', 'Pool', 'Gym',
  'Balcony', 'Furnished', 'Hardwood floors', 'EV charging', 'Storage',
];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amenityOpen, setAmenityOpen] = useState(false);
  const amenityRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const selectedAmenities = searchParams.get('amenities')
    ? searchParams.get('amenities')!.split(',').filter(Boolean)
    : [];
  const ownerDirect = searchParams.get('ownerDirect') === '1';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (amenityRef.current && !amenityRef.current.contains(e.target as Node)) {
        setAmenityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/rentals?${params.toString()}`);
  }

  function toggleAmenity(a: string) {
    const next = selectedAmenities.includes(a)
      ? selectedAmenities.filter((x) => x !== a)
      : [...selectedAmenities, a];
    setFilter('amenities', next.join(','));
  }

  const selectClass =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600';

  const cityInputRef = useRef<HTMLInputElement>(null);

  function submitCity() {
    const val = cityInputRef.current?.value.trim() ?? '';
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('page');
    if (val) params.set('city', val); else params.delete('city');
    router.push(`/rentals?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-brand-600 focus-within:ring-1 focus-within:ring-brand-600">
        <input
          ref={cityInputRef}
          type="text"
          defaultValue={searchParams.get('city') ?? searchParams.get('q') ?? ''}
          onKeyDown={(e) => { if (e.key === 'Enter') submitCity(); }}
          placeholder="City or ZIP"
          aria-label="Filter by city or ZIP code"
          className="w-36 bg-transparent px-3 py-2 text-sm font-medium text-gray-700 placeholder-gray-400 outline-none"
        />
        <button
          type="button"
          onClick={submitCity}
          aria-label="Search by city or ZIP"
          className="flex items-center px-2.5 text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <select
        value={searchParams.get('minPrice') ?? ''}
        onChange={(e) => setFilter('minPrice', e.target.value)}
        aria-label="Minimum price"
        className={selectClass}
      >
        <option value="">No min price</option>
        {PRICE_OPTIONS.map((p) => (
          <option key={p} value={p}>${p.toLocaleString()}+</option>
        ))}
      </select>

      <select
        value={searchParams.get('maxPrice') ?? ''}
        onChange={(e) => setFilter('maxPrice', e.target.value)}
        aria-label="Maximum price"
        className={selectClass}
      >
        <option value="">No max price</option>
        {PRICE_OPTIONS.map((p) => (
          <option key={p} value={p}>Up to ${p.toLocaleString()}</option>
        ))}
      </select>

      <select
        value={searchParams.get('bedrooms') ?? ''}
        onChange={(e) => setFilter('bedrooms', e.target.value)}
        aria-label="Bedrooms"
        className={selectClass}
      >
        <option value="">Any beds</option>
        <option value="0">Studio</option>
        <option value="1">1 bed</option>
        <option value="2">2 beds</option>
        <option value="3">3 beds</option>
        <option value="4">4 beds</option>
        <option value="5">5+ beds</option>
      </select>

      <select
        value={searchParams.get('propertyType') ?? ''}
        onChange={(e) => setFilter('propertyType', e.target.value)}
        aria-label="Property type"
        className={selectClass}
      >
        <option value="">All types</option>
        <option value="house">House</option>
        <option value="apartment">Apartment</option>
        <option value="condo">Condo</option>
        <option value="townhouse">Townhouse</option>
        <option value="studio">Studio</option>
      </select>

      {/* Owner-direct toggle */}
      <button
        onClick={() => setFilter('ownerDirect', ownerDirect ? '' : '1')}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
          ownerDirect
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        }`}
      >
        <span aria-hidden="true">🏠</span> By Owner
      </button>

      {/* Amenities dropdown */}
      <div className="relative" ref={amenityRef}>
        <button
          aria-haspopup="true"
          aria-expanded={amenityOpen}
          aria-controls="amenity-listbox"
          onClick={(e) => {
            const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            setDropdownPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
            setAmenityOpen((o) => !o);
          }}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
            selectedAmenities.length > 0
              ? 'border-brand-600 bg-brand-50 text-brand-700'
              : 'border-gray-300 bg-white text-gray-700'
          }`}
        >
          Amenities
          {selectedAmenities.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {selectedAmenities.length}
            </span>
          )}
          <svg className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {amenityOpen && (
          <div
            id="amenity-listbox"
            role="group"
            aria-label="Select amenities"
            style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
            className="z-[9999] min-w-[340px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
          >
            <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
              {AMENITY_OPTIONS.map((a) => (
                <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                    className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                  />
                  {a}
                </label>
              ))}
            </div>
            {selectedAmenities.length > 0 && (
              <button
                onClick={() => setFilter('amenities', '')}
                className="mt-2 w-full rounded-lg py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
              >
                Clear amenities
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
