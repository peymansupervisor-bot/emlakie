'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { isAddressQuery } from '@/lib/address-utils';

interface Suggestion {
  type: 'city' | 'address' | 'listing';
  label: string;
  value: string;
  slug?: string | null;
}

export default function SearchBar({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [mode, setMode] = useState<'location' | 'describe'>('location');
  const [interpreting, setInterpreting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'describe') { setSuggestions([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q.trim())}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      }
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, mode]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function navigate(s?: Suggestion, rawVal?: string) {
    setOpen(false);
    const val = (s?.value ?? rawVal ?? '').trim();
    setQ(val);
    if (s?.type === 'listing' && s.slug) {
      router.push(`/rentals/${s.slug}`);
    } else {
      router.push(`/rentals?q=${encodeURIComponent(val)}`);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === 'describe') {
      const query = q.trim();
      if (!query) return;
      setInterpreting(true);
      try {
        const res = await fetch('/api/search/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          const params = new URLSearchParams();
          if (data.city) params.set('city', data.city);
          if (data.state && !data.city) params.set('q', data.state);
          if (data.minPrice) params.set('minPrice', String(data.minPrice));
          if (data.maxPrice) params.set('maxPrice', String(data.maxPrice));
          if (data.bedrooms) params.set('bedrooms', data.bedrooms);
          if (data.propertyType) params.set('propertyType', data.propertyType);
          if (data.amenities?.length) params.set('amenities', data.amenities.join(','));
          if (!data.city && !data.state) params.set('q', query);
          router.push(`/rentals?${params.toString()}`);
        } else {
          router.push(`/rentals?q=${encodeURIComponent(query)}`);
        }
      } catch {
        router.push(`/rentals?q=${encodeURIComponent(query)}`);
      } finally {
        setInterpreting(false);
      }
      return;
    }

    const active = activeIdx >= 0 ? suggestions[activeIdx] : undefined;
    const val = (active?.value ?? q).trim();
    if (!val) { router.push('/rentals'); return; }
    navigate(active, val);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  const placeholder = mode === 'describe'
    ? 'e.g. "Pet-friendly 2BR near downtown Austin under $2,000"'
    : 'City, ZIP, address, or neighborhood';

  return (
    <div ref={containerRef} className={`relative w-full ${large ? 'max-w-2xl' : 'max-w-md'}`}>
      <form
        role="search"
        aria-label="Search rental listings"
        onSubmit={onSubmit}
        className={`flex w-full overflow-hidden rounded-xl bg-white transition-shadow ${
          mode === 'describe'
            ? 'shadow-[0_4px_24px_rgba(139,92,246,0.18)] hover:shadow-[0_6px_32px_rgba(139,92,246,0.28)] ring-1 ring-violet-200'
            : 'shadow-[0_4px_24px_rgba(0,0,0,0.10)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.14)]'
        }`}
      >
        <label htmlFor="search-q" className="sr-only">Search rentals</label>
        <input
          id="search-q"
          role="combobox"
          type="text"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => mode === 'location' && suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIdx >= 0 ? `suggestion-${activeIdx}` : undefined}
          className={`min-w-0 flex-1 px-5 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-inset ${
            mode === 'describe' ? 'focus:ring-violet-400' : 'focus:ring-brand-500'
          } ${large ? 'py-4 text-lg' : 'py-3 text-base'}`}
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(''); setSuggestions([]); setOpen(false); }}
            className="px-3 text-gray-500 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          aria-label={mode === 'describe' ? 'Search with AI' : 'Search'}
          disabled={interpreting}
          className={`flex items-center gap-2 font-semibold text-white transition disabled:opacity-70 ${
            mode === 'describe' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-brand-600 hover:bg-brand-700'
          } ${large ? 'px-7 text-lg' : 'px-5'}`}
        >
          {interpreting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="hidden sm:inline">Searching…</span>
            </>
          ) : (
            <>
              {mode === 'describe' ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" strokeLinecap="round" />
                </svg>
              )}
              <span className="hidden sm:inline">Search</span>
            </>
          )}
        </button>
      </form>

      {/* Mode toggle — only on large (homepage) variant */}
      {large && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-gray-400">or</span>
          <button
            type="button"
            onClick={() => { setMode((m) => m === 'location' ? 'describe' : 'location'); setQ(''); setSuggestions([]); setOpen(false); }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
              mode === 'describe'
                ? 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            {mode === 'describe' ? 'Switch to location search' : 'Describe your ideal rental'}
          </button>
        </div>
      )}

      {open && suggestions.length > 0 && mode === 'location' && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => navigate(s)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors ${
                i === activeIdx ? 'bg-brand-50' : 'hover:bg-gray-50'
              }`}
            >
              {s.type === 'city' ? (
                <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
              <span className="truncate text-gray-800">{s.label}</span>
              <span className={`ml-auto shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
                s.type === 'listing' ? 'bg-brand-50 text-brand-700' : 'text-gray-500'
              }`}>
                {s.type === 'city' ? 'City' : s.type === 'listing' ? 'Rental' : 'Address'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
