import Link from 'next/link';

export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900">Payments</h1>
      <p className="mt-1 text-sm text-gray-500">Track rent collection and payment history</p>

      <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 px-8 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          <svg viewBox="0 0 24 24" className="h-8 w-8 stroke-brand-600" fill="none" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">Rent payments — coming soon</h2>
        <p className="mt-2 max-w-md mx-auto text-gray-600">
          Collect rent online, track payment history, and send reminders — all in one place.
          This feature is in development and will be available soon.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/landlord"
            className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-600">
            Back to Properties
          </Link>
          <Link href="/app"
            className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
            Get the App
          </Link>
        </div>
      </div>
    </div>
  );
}
