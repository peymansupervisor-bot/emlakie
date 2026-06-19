'use client';

import { useEffect, useRef, useState } from 'react';

type Suggestion = { display: string; address: string; city: string; state: string; zip: string };

const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-0';

export default function AddressField({
  id,
  initialValue = '',
  onSelect,
  onType,
}: {
  id?: string;
  initialValue?: string;
  onSelect: (address: string, city: string, state: string, zip: string) => void;
  onType: (address: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seededRef = useRef(false);

  // Pre-fill once when the parent loads the saved value (empty → real address)
  useEffect(() => {
    if (!seededRef.current && initialValue) {
      setValue(initialValue);
      seededRef.current = true;
    }
  }, [initialValue]);

  function lookup(val: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.length < 4) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      try {
        const q = encodeURIComponent(`${val}, USA`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&addressdetails=1&limit=5&countrycodes=us`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const results: Suggestion[] = (data as any[])
          .map((r) => {
            const a = r.address ?? {};
            const street = [a.house_number ?? '', a.road ?? ''].filter(Boolean).join(' ');
            const city = a.city ?? a.town ?? a.village ?? '';
            const stateCode = a['ISO3166-2-lvl4']?.split('-')[1] ?? a.state ?? '';
            const zip = a.postcode ?? '';
            return { display: r.display_name, address: street, city, state: stateCode, zip };
          })
          .filter((r) => r.address);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch { setSuggestions([]); setOpen(false); }
    }, 350);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    onType(v);
    lookup(v);
  }

  function handleSelect(s: Suggestion) {
    setValue(s.address);
    setSuggestions([]);
    setOpen(false);
    onSelect(s.address, s.city, s.state, s.zip);
  }

  return (
    <div className="relative">
      <input
        id={id}
        className={inputCls}
        placeholder="123 Main St"
        value={value}
        autoComplete="off"
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="font-medium">{s.address}</span>
              <span className="ml-2 text-xs text-gray-500">
                {s.city}{s.state ? `, ${s.state}` : ''}{s.zip ? ` ${s.zip}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
