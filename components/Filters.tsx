'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const PRICE_OPTIONS = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/rentals?${params.toString()}`);
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
    </div>
  );
}
