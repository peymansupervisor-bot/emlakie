import Link from 'next/link';

export default function RentEstimatorCard() {
  return (
    <div className="mt-4 rounded-2xl p-6 bg-amber-700">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-100">Free tool</p>
      <h2 className="mt-2 text-lg font-extrabold leading-snug text-white">
        What&apos;s your rental worth?
      </h2>
      <p className="mt-1 text-sm text-amber-100">
        Get an instant rent estimate based on real local comps — no sign-up needed.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 px-3 py-2.5">
        <svg className="h-4 w-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm text-white/80">Enter your address</span>
      </div>
      <Link
        href="/rent-estimate"
        className="mt-4 block w-full rounded-xl bg-white py-2.5 text-center text-sm font-bold text-amber-700 transition hover:bg-amber-50"
      >
        Get my free estimate →
      </Link>
      <p className="mt-2 text-center text-xs text-amber-100">
        Trusted by 200+ landlords · Updated weekly
      </p>
    </div>
  );
}
