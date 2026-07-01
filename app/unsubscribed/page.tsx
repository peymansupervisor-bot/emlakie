import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unsubscribed',
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">You're unsubscribed</h1>
      <p className="text-gray-600 mb-8">You won't receive any more EMLAKIE Update emails. You'll still get transactional emails about your listings and applicants.</p>
      <Link href="/" className="inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-700 transition">
        Back to EMLAKIE
      </Link>
    </div>
  );
}
