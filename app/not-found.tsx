import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-5xl font-extrabold text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-600">
        We couldn&apos;t find that page — it may have been rented already.
      </p>
      <Link
        href="/rentals"
        className="mt-8 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
      >
        Browse rentals
      </Link>
    </div>
  );
}
