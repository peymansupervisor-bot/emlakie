'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const selectedAmenities = searchParams.get('amenities')
    ? searchParams.get('amenities')!.split(',').filter(Boolean)
    : [];

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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        defaultValue={searchParams.get('city') ?? ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setFilter('city', (e.target as HTMLInputElement).value.trim());
        }}
        onBlur={(e) => {
          if (e.target.value.trim() !== (searchParams.get('city') ?? ''))
            setFilter('city', e.target.value.trim());
        }}
        placeholder="City or ZIP"
        aria-label="Filter by city or ZIP code"
        className={`${selectClass} w-44 placeholder-gray-400`}
      />

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

      {/* Amenities dropdown */}
      <div className="relative" ref={amenityRef}>
        <button
          ref={buttonRef}
          onClick={() => {
            if (buttonRef.current) {
              const r = buttonRef.current.getBoundingClientRect();
              setDropdownPos({ top: r.bottom + 6, left: r.left });
            }
            setAmenityOpen((o) => !o);
          }}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium outline-none transition ${
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
          <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {amenityOpen && (
          <div
            style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left }}
            className="z-[9999] min-w-max rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            <div className="grid grid-cols-1 gap-1">
              {AMENITY_OPTIONS.map((a) => (
                <label key={a} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
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
