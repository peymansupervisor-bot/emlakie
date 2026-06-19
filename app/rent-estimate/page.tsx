'use client';

import { useState } from 'react';
import Link from 'next/link';

type Result = {
  confidence: 'exact' | 'broad' | 'city';
  count: number;
  city: string;
  avg: number;
  median: number;
  low: number;
  high: number;
  suggestLow: number;
  suggestHigh: number;
  comparables: {
    address: string;
    city: string;
    state: string;
    price: number;
    bedrooms: number;
    property_type: string;
    href: string;
  }[];
} | { insufficient: true; count: number };

const CONFIDENCE_LABEL: Record<string, string> = {
  exact:  'Based on matching property type and bedrooms in your city',
  broad:  'Based on matching bedrooms in your city (all property types)',
  city:   'Based on all active listings in your city',
};

function fmt(n: number) { return '$' + n.toLocaleString(); }

function formatType(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ');
}

export default function RentEstimatePage() {
  const [form, setForm] = useState({ city: '', bedrooms: '2', bathrooms: '1', propertyType: 'apartment' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const inputCls  = 'w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600';
  const labelCls  = 'block text-sm font-semibold text-gray-700 mb-1';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.city.trim()) { setError('Please enter a city.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const p = new URLSearchParams({
        city: form.city.trim(),
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        propertyType: form.propertyType,
      });
      const res = await fetch(`/api/rent-estimate?${p}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">

      {/* Hero */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Free Tool for Landlords</p>
        <h1 className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Your free E-rent Value™
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          EMLAKIE&apos;s automated rent estimate based on real active listings in your city.
          Price your property right — not too high to sit vacant, not too low to leave money on the table.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
        <div>
          <label htmlFor="re-city" className={labelCls}>City where the property is located</label>
          <input
            id="re-city"
            type="text"
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="e.g. Bakersfield"
            className={inputCls}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="re-type" className={labelCls}>Property type</label>
            <select id="re-type" value={form.propertyType}
              onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
              className={inputCls}>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="studio">Studio</option>
              <option value="room">Room</option>
              <option value="adu">ADU</option>
            </select>
          </div>
          <div>
            <label htmlFor="re-beds" className={labelCls}>Bedrooms</label>
            <select id="re-beds" value={form.bedrooms}
              onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))}
              className={inputCls}>
              <option value="0">Studio</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label htmlFor="re-baths" className={labelCls}>Bathrooms</label>
            <select id="re-baths" value={form.bathrooms}
              onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))}
              className={inputCls}>
              <option value="1">1</option>
              <option value="1.5">1.5</option>
              <option value="2">2</option>
              <option value="2.5">2.5</option>
              <option value="3">3+</option>
            </select>
          </div>
        </div>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-brand-600 py-3.5 font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
          {loading ? 'Calculating…' : 'Get my E-rent Value™ →'}
        </button>
        <p className="text-center text-xs text-gray-400">Free · No account needed · Based on real active listings</p>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 animate-fade-in">
          {'insufficient' in result ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card text-center">
              <p className="text-4xl">🔍</p>
              <h2 className="mt-3 text-xl font-bold text-gray-900">Not enough data yet</h2>
              <p className="mt-2 text-gray-500">
                We only found {result.count} active listing{result.count !== 1 ? 's' : ''} in that city right now.
                Try a nearby city, or be the first to list your property and help set the market.
              </p>
              <Link href="/landlord/login"
                className="mt-5 inline-block rounded-xl bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700">
                List your property for free →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-card space-y-8">

              {/* Suggested range — the headline number */}
              <div className="rounded-2xl bg-brand-50 border border-brand-100 px-6 py-7 text-center">
                <p className="text-sm font-semibold text-brand-700 uppercase tracking-widest">Suggested rent range</p>
                <p className="mt-2 text-5xl font-extrabold text-brand-700">
                  {fmt(result.suggestLow)} – {fmt(result.suggestHigh)}
                  <span className="text-xl font-semibold text-brand-500">/mo</span>
                </p>
                <p className="mt-2 text-sm text-brand-600">
                  Based on {result.count} active listing{result.count !== 1 ? 's' : ''} in {result.city}
                </p>
              </div>

              {/* Market stats */}
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-3">Market breakdown</h2>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    { label: 'Market low', value: fmt(result.low) },
                    { label: 'Average', value: fmt(result.avg) },
                    { label: 'Median', value: fmt(result.median) },
                    { label: 'Market high', value: fmt(result.high) },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl bg-gray-50 px-2 py-4">
                      <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Visual bar */}
                <div className="mt-4">
                  <div className="relative h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="absolute inset-y-0 rounded-full bg-brand-200"
                      style={{
                        left: `${((result.suggestLow - result.low) / Math.max(1, result.high - result.low)) * 100}%`,
                        right: `${100 - ((result.suggestHigh - result.low) / Math.max(1, result.high - result.low)) * 100}%`,
                      }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>{fmt(result.low)}</span>
                    <span className="text-brand-600 font-semibold">Suggested: {fmt(result.suggestLow)}–{fmt(result.suggestHigh)}</span>
                    <span>{fmt(result.high)}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-400">{CONFIDENCE_LABEL[result.confidence]}</p>
              </div>

              {/* Pricing tips */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-5">
                <h2 className="text-sm font-bold text-gray-800 mb-3">Tips for pricing your rental</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex gap-2"><span className="text-brand-600 font-bold shrink-0">→</span> Start near the median. Pricing 5–10% below median typically gets you a tenant 2–3× faster.</li>
                  <li className="flex gap-2"><span className="text-brand-600 font-bold shrink-0">→</span> A vacancy costs you more than a slightly lower rent — one empty month at {fmt(result.median)} is {fmt(result.median)} lost.</li>
                  <li className="flex gap-2"><span className="text-brand-600 font-bold shrink-0">→</span> Price higher if your unit has parking, washer/dryer, or updated kitchen — these justify 8–12% premiums.</li>
                  <li className="flex gap-2"><span className="text-brand-600 font-bold shrink-0">→</span> Check back monthly — rental markets shift fast. Re-estimate before each new lease.</li>
                </ul>
              </div>

              {/* Comparables */}
              {result.comparables.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-gray-700 mb-3">Comparable listings in {result.city}</h2>
                  <div className="space-y-2">
                    {result.comparables.map(c => (
                      <Link key={c.href} href={c.href}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm transition hover:border-brand-200 hover:bg-brand-50">
                        <div>
                          <span className="font-medium text-gray-800">{c.address}</span>
                          <span className="ml-2 text-xs text-gray-400">{c.bedrooms} bd · {formatType(c.property_type)}</span>
                        </div>
                        <span className="font-bold text-brand-700 shrink-0">{fmt(c.price)}/mo</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="rounded-2xl border border-brand-100 bg-brand-50 px-6 py-7 text-center">
                <p className="text-lg font-extrabold text-gray-900">Ready to list your property?</p>
                <p className="mt-1 text-sm text-gray-600">
                  Post for free on EMLAKIE — tenants contact you directly, no broker fees, no commissions.
                </p>
                <Link href="/landlord/login"
                  className="mt-5 inline-block rounded-xl bg-brand-600 px-8 py-3 font-bold text-white transition hover:bg-brand-700">
                  List my property for free →
                </Link>
                <p className="mt-2 text-xs text-gray-400">Takes under 5 minutes · No credit card</p>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Trust signals — shown before result */}
      {!result && (
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📊', label: 'Real market data', sub: 'Based on active listings from real landlords in your city' },
            { icon: '⚡', label: 'Instant estimate', sub: 'No waiting, no email required — results in seconds' },
            { icon: '🆓', label: 'Always free', sub: 'No sign-up, no hidden fees — share it with other landlords' },
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
