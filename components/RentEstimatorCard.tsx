import Link from 'next/link';

export default function RentEstimatorCard() {
  return (
    <div className="mt-4 rounded-2xl p-6" style={{ backgroundColor: '#0f766e' }}>
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">Free tool</p>
      <h2 className="mt-2 text-lg font-extrabold leading-snug text-white">
        What&apos;s your rental worth?
      </h2>
      <p className="mt-1 text-sm text-teal-100">
        Get an instant rent estimate based on real local comps — no sign-up needed.
      </p>
      <Link
        href="/rent-estimate"
        className="mt-5 block w-full rounded-xl bg-white py-2.5 text-center text-sm font-bold transition hover:bg-teal-50"
        style={{ color: '#0f766e' }}
      >
        Get my free estimate →
      </Link>
      <p className="mt-2 text-center text-xs text-teal-200">
        Trusted by 200+ landlords · Updated weekly
      </p>
    </div>
  );
}
