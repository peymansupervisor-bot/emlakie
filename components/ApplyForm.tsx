'use client';

import { useState } from 'react';

interface Props {
  listingId: string;
  listingPrice: number;
}

type Step = 'form' | 'success';

export default function ApplyForm({ listingId, listingPrice }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [income, setIncome] = useState('');
  const [moveIn, setMoveIn] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name || !phone || !income || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.emlakie.com/api'}/listings/${listingId}/apply-web`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantName: name,
            tenantPhone: phone,
            income: parseFloat(income),
            moveIn: moveIn || undefined,
            creditScore: creditScore ? parseInt(creditScore) : undefined,
            message,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 409) {
          setError('You have already submitted an application for this listing.');
        } else {
          setError(body.error ?? 'Something went wrong. Please try again.');
        }
        return;
      }

      setStep('success');
    } catch {
      setError('Could not submit. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-brand-600" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 13 4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">Application Sent!</h3>
        <p className="mt-1 text-sm text-gray-500">The landlord will review your info and reach out directly.</p>
      </div>
    );
  }

  const incomeRatio = income && listingPrice ? (parseFloat(income) / listingPrice).toFixed(1) : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-lg font-bold text-gray-900">Apply for this home</h2>
      <p className="mt-1 text-sm text-gray-500">Goes directly to the landlord — no middlemen.</p>

      <div className="mt-4 space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Income */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Monthly Income (USD) *</label>
          <input
            type="number"
            value={income}
            onChange={e => setIncome(e.target.value)}
            placeholder="e.g. 5000"
            min="0"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {incomeRatio && (
            <p className="mt-1 text-xs text-gray-400">
              Income-to-rent ratio: <span className={`font-semibold ${parseFloat(incomeRatio) >= 3 ? 'text-green-600' : 'text-amber-600'}`}>{incomeRatio}×</span>
              {parseFloat(incomeRatio) < 3 && ' (most landlords require 3×)'}
            </p>
          )}
        </div>

        {/* Credit Score + Move-in — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Credit Score</label>
            <input
              type="number"
              value={creditScore}
              onChange={e => setCreditScore(e.target.value)}
              placeholder="e.g. 720"
              min="300"
              max="850"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Move-in Date</label>
            <input
              type="date"
              value={moveIn}
              onChange={e => setMoveIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Message to Landlord *</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Introduce yourself and why you're interested..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Send Application'}
      </button>
      <p className="mt-2 text-center text-xs text-gray-400">Free for renters · No account needed</p>
    </form>
  );
}
