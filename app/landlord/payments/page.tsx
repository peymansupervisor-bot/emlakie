'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMyListings, getToken } from '@/lib/landlord/client';
import { LandlordListing } from '@/lib/landlord/types';
import { formatPrice } from '@/lib/format';

const BOOST_OPTIONS = [
  {
    id: '7day',
    label: '7-Day Boost',
    price: 19,
    description: 'Featured on the homepage for 7 days. Great for a quick push.',
    highlight: false,
  },
  {
    id: '30day',
    label: '30-Day Boost',
    price: 49,
    description: 'Top placement on the homepage for a full month. Best value.',
    highlight: true,
  },
  {
    id: '90day',
    label: '90-Day Boost',
    price: 99,
    description: 'Maximum exposure for 3 months. Ideal for hard-to-fill properties.',
    highlight: false,
  },
];

const ADMIN_BYPASS_SECRET = process.env.NEXT_PUBLIC_ADMIN_BYPASS_SECRET ?? '';

export default function BoostPage() {
  const router = useRouter();
  const [listings, setListings] = useState<LandlordListing[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [plan, setPlan] = useState(BOOST_OPTIONS[1].id);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getMyListings().then((data) => {
      setListings(data);
      if (data.length > 0) setSelected(data[0].id);
    }).catch(() => {});
  }, []);

  async function handleAdminBoost() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/boost-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_BYPASS_SECRET },
        body: JSON.stringify({ listingId: selected, planId: plan }),
      });
      const { error } = await res.json();
      if (error) { alert(error); setLoading(false); return; }
      router.push('/landlord/payments/success');
    } catch {
      alert('Something went wrong.');
      setLoading(false);
    }
  }

  async function handleBoost() {
    if (!selected) return;
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) { alert('Please sign in first.'); setLoading(false); return; }
      const res = await fetch('/api/create-boost-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ listingId: selected, planId: plan }),
      });
      const { url, error } = await res.json();
      if (error) { alert(error); setLoading(false); return; }
      window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const activeListing = listings.find((l) => l.id === selected);
  const selectedPlan  = BOOST_OPTIONS.find((p) => p.id === plan)!;

  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">⚡</span>
        <h1 className="text-3xl font-extrabold text-gray-900">Boost a Listing</h1>
      </div>
      <p className="mb-8 text-gray-500">
        Listing on EMLAKIE is always free. Boost gives your property featured placement
        on the homepage — seen by every renter who visits.
      </p>

      {/* How it works */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">How it works</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: '1', title: 'Pick a listing', desc: 'Choose which property to promote' },
            { step: '2', title: 'Choose a plan',  desc: 'Select how long you want it featured' },
            { step: '3', title: 'Go live',        desc: 'Your listing moves to the top — instantly' },
          ].map((s) => (
            <div key={s.step}>
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ backgroundColor: '#16a34a' }}>
                {s.step}
              </div>
              <p className="text-sm font-semibold text-gray-800">{s.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pick a listing */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Select a listing to boost</h2>
        {listings.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="mb-3">No active listings yet.</p>
            <Link href="/landlord/properties/new" className="text-sm font-semibold text-green-600 underline">
              Add your first listing →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {listings.map((l) => (
              <label key={l.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                selected === l.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="listing"
                  value={l.id}
                  checked={selected === l.id}
                  onChange={() => setSelected(l.id)}
                  className="accent-green-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{l.address}</p>
                  <p className="text-xs text-gray-500">{l.city}, {l.state} · {formatPrice(l.price)}/mo</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {l.status === 'active' ? 'Active' : l.status}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Pick a plan */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Choose a boost plan</h2>
        <div className="flex flex-col gap-3">
          {BOOST_OPTIONS.map((option) => (
            <label key={option.id} className={`relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
              plan === option.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              {option.highlight && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <input
                type="radio"
                name="plan"
                value={option.id}
                checked={plan === option.id}
                onChange={() => setPlan(option.id)}
                className="accent-green-600"
              />
              <div className="flex-1">
                <p className="font-bold text-gray-900">{option.label}</p>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
              <p className="text-xl font-extrabold text-gray-900">${option.price}</p>
            </label>
          ))}
        </div>
      </div>

      {/* Summary & CTA */}
      {listings.length > 0 && activeListing && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700">Order summary</p>
              <p className="mt-1 text-sm text-gray-700 font-medium">{activeListing.address}</p>
              <p className="text-sm text-gray-500">{selectedPlan.label}</p>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">${selectedPlan.price}</p>
          </div>
          <button
            onClick={handleBoost}
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#16a34a' }}
          >
            {loading ? 'Redirecting to checkout…' : `Boost Now — $${selectedPlan.price}`}
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            Secure checkout · No subscription · Cancel anytime
          </p>
          {ADMIN_BYPASS_SECRET && (
            <button
              onClick={handleAdminBoost}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-gray-300 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Admin: Activate boost without payment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
