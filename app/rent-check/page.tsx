'use client';

import { useState } from 'react';
import Link from 'next/link';

type Result = {
  count: number;
  avg: number;
  median: number;
  low: number;
  high: number;
  broadened: boolean;
  samples: { address: string; city: string; state: string; price: number; href: string }[];
  insufficient?: never;
} | { insufficient: true; count: number };

function formatPrice(n: number) {
  return '$' + n.toLocaleString();
}

function verdict(userRent: number, avg: number): { label: string; color: string; detail: string } {
  const diff = ((userRent - avg) / avg) * 100;
  if (diff < -15) return { label: 'Well below market', color: 'text-green-700', detail: `You're paying ${Math.abs(Math.round(diff))}% less than the average — great deal.` };
  if (diff < -5)  return { label: 'Below market', color: 'text-green-600', detail: `Your rent is ${Math.abs(Math.round(diff))}% below the local average.` };
  if (diff <= 5)  return { label: 'At market rate', color: 'text-yellow-600', detail: `Your rent is right in line with the local average.` };
  if (diff <= 15) return { label: 'Slightly above market', color: 'text-orange-600', detail: `Your rent is ${Math.round(diff)}% above the local average.` };
  return { label: 'Above market', color: 'text-red-600', detail: `You may be overpaying — your rent is ${Math.round(diff)}% above the local average.` };
}

export default function RentCheckPage() {
  const [form, setForm] = useState({ city: '', bedrooms: '1', propertyType: '', rent: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const inputCls = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.city.trim()) { setError('Please enter a city.'); return; }
    if (!form.rent || isNaN(Number(form.rent))) { setError('Please enter your current rent.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const params = new URLSearchParams({ city: form.city.trim(), bedrooms: form.bedrooms });
      if (form.propertyType) params.set('propertyType', form.propertyType);
      const res = await fetch(`/api/rent-check?${params}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const userRent = Number(form.rent.replace(/\D/g, ''));
  const v = result && !('insufficient' in result) ? verdict(userRent, result.avg) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">

      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Free Tool</p>
        <h1 className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">Is my rent fair?</h1>
        <p className="mt-4 text-lg text-gray-500">
          Enter your city, bedroom count, and what you pay — we'll compare it against real listings from landlords in your area.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="rc-city" className={labelCls}>City</label>
            <input
              id="rc-city"
              type="text"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="e.g. Bakersfield"
              className={inputCls}
              required
            />
          </div>
          <div>
            <label htmlFor="rc-bedrooms" className={labelCls}>Bedrooms</label>
            <select
              id="rc-bedrooms"
              value={form.bedrooms}
              onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
              className={inputCls}
            >
              <option value="0">Studio</option>
              <option value="1">1 bed</option>
              <option value="2">2 beds</option>
              <option value="3">3 beds</option>
              <option value="4">4 beds</option>
              <option value="5">5+ beds</option>
            </select>
          </div>
          <div>
            <label htmlFor="rc-type" className={labelCls}>Property type <span className="font-normal text-gray-400">(optional)</span></label>
            <select
              id="rc-type"
              value={form.propertyType}
              onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
              className={inputCls}
            >
              <option value="">Any</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="studio">Studio</option>
              <option value="townhouse">Townhouse</option>
              <option value="room">Room</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="rc-rent" className={labelCls}>Your current monthly rent</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">$</span>
              <input
                id="rc-rent"
                type="text"
                inputMode="numeric"
                value={form.rent}
                onChange={e => setForm(f => ({ ...f, rent: e.target.value.replace(/[^0-9]/g, '') }))}
                placeholder="1500"
                className={`${inputCls} pl-8`}
                required
              />
            </div>
          </div>
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Check my rent →'}
        </button>

        <p className="text-center text-xs text-gray-400">Free · No account needed · Based on real landlord listings</p>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
          {'insufficient' in result ? (
            <div className="text-center">
              <p className="text-4xl">🔍</p>
              <h2 className="mt-3 text-xl font-bold text-gray-900">Not enough data yet</h2>
              <p className="mt-2 text-gray-500">
                We only found {result.count} listing{result.count !== 1 ? 's' : ''} matching your criteria in that city.
                Try a nearby city or broaden the property type.
              </p>
              <Link href="/rentals" className="mt-5 inline-block rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700">
                Browse all rentals
              </Link>
            </div>
          ) : (
            <>
              {/* Verdict */}
              <div className="text-center">
                <p className={`text-2xl font-extrabold ${v!.color}`}>{v!.label}</p>
                <p className="mt-1 text-gray-600">{v!.detail}</p>
              </div>

              {/* Bar visual */}
              <div className="mt-8">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Low {formatPrice(result.low)}</span>
                  <span>Market avg {formatPrice(result.avg)}</span>
                  <span>High {formatPrice(result.high)}</span>
                </div>
                <div className="relative h-4 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-brand-200"
                    style={{ width: '100%' }} />
                  {/* Avg marker */}
                  <div className="absolute inset-y-0 w-0.5 bg-brand-600"
                    style={{ left: `${Math.min(100, ((result.avg - result.low) / Math.max(1, result.high - result.low)) * 100)}%` }} />
                  {/* User marker */}
                  <div className="absolute inset-y-0 w-1 rounded-full bg-gray-900"
                    style={{ left: `${Math.min(98, Math.max(1, ((userRent - result.low) / Math.max(1, result.high - result.low)) * 100))}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span />
                  <span className="font-semibold text-gray-900">▲ You: {formatPrice(userRent)}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'Market average', value: formatPrice(result.avg) },
                  { label: 'Median', value: formatPrice(result.median) },
                  { label: 'Based on', value: `${result.count} listing${result.count !== 1 ? 's' : ''}` },
                ].map(s => (
                  <div key={s.label} className="rounded-xl bg-gray-50 px-3 py-4">
                    <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>

              {result.broadened && (
                <p className="mt-4 text-center text-xs text-gray-400">
                  Results include all property types in {form.city} for a broader sample.
                </p>
              )}

              {/* Sample listings */}
              {result.samples.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-bold text-gray-700 mb-3">Listings used in this comparison</h2>
                  <div className="space-y-2">
                    {result.samples.map(s => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm transition hover:border-brand-200 hover:bg-brand-50"
                      >
                        <span className="text-gray-700">{s.address}, {s.city}</span>
                        <span className="font-bold text-brand-700">{formatPrice(s.price)}/mo</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 text-center">
                <Link
                  href={`/rentals?city=${encodeURIComponent(form.city)}&bedrooms=${form.bedrooms}`}
                  className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-bold text-white transition hover:bg-brand-700"
                >
                  Browse rentals in {form.city} →
                </Link>
                <p className="mt-2 text-xs text-gray-400">Find a better deal — contact landlords directly, no broker fees</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Trust signals */}
      {!result && (
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🏠', label: 'Real listings', sub: 'Data from actual landlords, not estimates' },
            { icon: '🔒', label: 'No account needed', sub: 'Free and anonymous — no sign-up' },
            { icon: '💬', label: 'Talk to landlords', sub: 'Find a better deal and contact them directly' },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className="text-2xl">{item.icon}</span>
              <p className="mt-2 text-xs font-bold text-gray-900">{item.label}</p>
              <p className="mt-1 text-xs text-gray-500">{item.sub}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
