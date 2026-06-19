import Link from 'next/link';

const perks = [
  'List for free — no fees ever',
  'Chat directly with renters',
  'Post in under 5 minutes',
  'Get matched applicants fast',
];

export default function LandlordCTACard() {
  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">For landlords</p>
      <h2 className="mt-2 text-lg font-extrabold text-gray-900 leading-snug">
        Own a rental property?
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Reach thousands of renters — no broker, no commission.
      </p>
      <ul className="mt-4 space-y-2">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {p}
          </li>
        ))}
      </ul>
      <Link
        href="/landlord/login"
        className="mt-5 block w-full rounded-xl bg-brand-600 py-2.5 text-center text-sm font-bold text-white transition hover:bg-brand-700"
      >
        List my property free →
      </Link>
      <Link
        href="/rent-estimate"
        className="mt-2 block text-center text-xs font-semibold text-brand-600 hover:text-brand-700"
      >
        Get a market rent estimate →
      </Link>
    </div>
  );
}
