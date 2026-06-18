'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  label: string;
  filters: Record<string, string>;
  onClose: () => void;
}

export default function SaveSearchModal({ label, filters, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const res = await fetch('/api/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, filters }),
    });

    if (res.ok) {
      setStatus('done');
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMsg(body.error ?? 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-search-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {status === 'done' ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 id="save-search-title" className="text-lg font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-500">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your alert.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 id="save-search-title" className="text-lg font-bold text-gray-900">Save this search</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Get emailed when new homes match{' '}
                  <span className="font-medium text-gray-800">{label}</span>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-gray-500 hover:text-gray-600 transition"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="save-search-email" className="sr-only">Email address</label>
              <input
                ref={emailRef}
                id="save-search-email"
                type="email"
                required
                placeholder="your@email.com"
                aria-required="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              {status === 'error' && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition"
              >
                {status === 'loading' ? 'Saving…' : 'Save Search'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
