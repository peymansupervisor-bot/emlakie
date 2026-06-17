'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { isAddressQuery } from '@/lib/address-utils';

export default function SearchBar({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = q.trim();
    if (!val) { router.push('/rentals'); return; }
    if (isAddressQuery(val)) {
      router.push(`/property?address=${encodeURIComponent(val)}`);
    } else {
      router.push(`/rentals?q=${encodeURIComponent(val)}`);
    }
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
      <label htmlFor="search-q" className="sr-only">Search rentals</label>
      <input
        id="search-q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="City, ZIP, address, or neighborhood"
        aria-label="Search by city, ZIP, address, or neighborhood"
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
