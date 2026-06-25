'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandlordBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-40 bg-brand-600" role="banner" aria-label="Landlord promotion">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <p className="flex-1 text-center text-sm font-semibold text-white sm:text-left">
          <span className="hidden sm:inline">Own a rental? </span>
          List it FREE in under 5 minutes. No commissions.{' '}
          <Link
            href="/landlord/login"
            className="ml-1 inline-flex items-center gap-1 rounded-md bg-white px-3 py-1 text-xs font-bold text-brand-700 transition hover:bg-green-50"
          >
            Start Listing
            <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden="true">
              <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="shrink-0 rounded p-1 text-white/70 transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
