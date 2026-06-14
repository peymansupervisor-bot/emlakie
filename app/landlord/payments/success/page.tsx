'use client';

import Link from 'next/link';

export default function BoostSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-5xl">
        ⚡
      </div>
      <h1 className="mb-3 text-3xl font-extrabold text-gray-900">Your listing is now boosted!</h1>
      <p className="mb-8 max-w-sm text-gray-500">
        It will appear in the featured section on the Emlakie homepage for the duration of your plan.
        Renters visiting the site will see it first.
      </p>
      <Link
        href="/landlord"
        className="rounded-xl px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
        style={{ backgroundColor: '#16a34a' }}
      >
        Back to My Listings
      </Link>
    </div>
  );
}
