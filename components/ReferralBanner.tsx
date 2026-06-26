'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'emlakie_refer_banner_dismissed';

// Dashboard nudge driving landlords to the referral program.
export default function ReferralBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { setShow(localStorage.getItem(DISMISS_KEY) !== '1'); } catch { setShow(true); }
  }, []);

  if (!show) return null;

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setShow(false);
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="flex flex-col items-start gap-3 pr-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">🎁</span>
          <div>
            <p className="font-bold text-gray-900">Refer a landlord — you both get a free 30-day Boost</p>
            <p className="mt-0.5 text-sm text-gray-600">
              Share your link. When they post their first listing, you each get premium placement worth $49 — free.
            </p>
          </div>
        </div>
        <Link
          href="/landlord/refer"
          className="shrink-0 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
        >
          Get your link
        </Link>
      </div>
    </div>
  );
}
