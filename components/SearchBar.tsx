'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const [city, setCity] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    router.push(`/rentals${params.size ? `?${params}` : ''}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search rental listings"
      className={`flex w-full overflow-hidden rounded-xl bg-white shadow-card ${
        large ? 'max-w-2xl' : 'max-w-md'
      }`}
    >
      <label htmlFor="search-city" className="sr-only">Search by city</label>
      <input
        id="search-city"
        type="search"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter a city — e.g. Austin, Chicago"
        aria-label="Search by city"
        className={`min-w-0 flex-1 px-5 text-gray-900 placeholder-gray-400 outline-none ${
          large ? 'py-4 text-lg' : 'py-3 text-base'
        }`}
      />
      <button
        type="submit"
        aria-label="Search"
        className={`flex items-center gap-2 bg-brand-600 font-semibold text-white transition hover:bg-brand-700 ${
          large ? 'px-7 text-lg' : 'px-5'
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
}
