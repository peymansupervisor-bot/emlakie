'use client';

import Link from 'next/link';

const iconMap: Record<string, JSX.Element> = {
  lead: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  ),
  view: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  ),
  tip: (
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  ),
};

export default function AlertsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Alerts</h1>
          <p className="mt-1 text-sm text-gray-500">Activity on your listings</p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-gray-400" fill="none" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </div>
        <p className="mt-4 text-base font-semibold text-gray-900">No alerts yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Once you have an active listing, you&apos;ll see applicants,<br />views, and tips here.
        </p>
        <Link href="/landlord/properties/new"
          className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          + Add your first listing
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Real-time push alerts are available in the Emlakie app.{' '}
        <Link href="/app" className="font-semibold text-brand-600 hover:text-brand-700">
          Download →
        </Link>
      </p>
    </div>
  );
}
