import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Short-Term Rentals — Monthly & Flexible Lease Apartments',
  description: 'Find short-term and month-to-month rentals. Flexible leases for relocations, travel nurses, and remote workers — no long commitment, no broker fees.',
  alternates: { canonical: 'https://emlakie.com/rentals/short-term' },
  openGraph: {
    title: 'Short-Term Rentals — Monthly & Flexible Lease Apartments',
    description: 'Find short-term and month-to-month rentals. Flexible leases for relocations, travel nurses, and remote workers — no long commitment, no broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/short-term',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Short-Term Rentals' }],
  },
  twitter: { card: 'summary_large_image', title: 'Short-Term Rentals — Monthly & Flexible Lease Apartments', description: 'Find short-term and month-to-month rentals. Flexible leases for relocations, travel nurses, and remote workers — no broker fees.', images: ['/og-image.png'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Short-Term Rentals',
      description: 'Browse short-term and month-to-month rental homes across the United States.',
      url: 'https://emlakie.com/rentals/short-term',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Short-Term Rentals', item: 'https://emlakie.com/rentals/short-term' },
      ],
    },
  ],
};

export default async function ShortTermPage() {
  const { listings } = await getListings();
  const shortTerm = listings.filter(l =>
    l.amenities?.some(a => /short.term|month.to.month|flexible/i.test(a)) ||
    /short.term|month.to.month|flexible lease|3.month|6.month/i.test(l.description ?? '') ||
    /short.term|month.to.month/i.test(l.title ?? '')
  ).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Short-Term Rentals</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Short-Term Rentals</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Flexible month-to-month and short-term leases. No year-long commitment required — ideal for travelers, remote workers, and those in transition.
        </p>
      </div>

      {/* Who it's for */}
      <div className="mt-10 grid gap-4 sm:grid-cols-4">
        {[
          { icon: '🏥', title: 'Travel nurses', body: '13-week assignments need flexible housing that matches your contract length.' },
          { icon: '🏠', title: 'In transition', body: 'Between homes? Short-term rentals bridge the gap without the long-term pressure.' },
          { icon: '💼', title: 'Work assignments', body: 'Temporary job relocation? Rent month-to-month and move when the project ends.' },
          { icon: '🌍', title: 'Try before you buy', body: 'Test a new neighborhood or city before committing to a long lease.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900 text-sm">{item.title}</h2>
            <p className="mt-1 text-xs text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      {/* What to know */}
      <div className="mt-10 rounded-2xl bg-brand-50 border border-brand-100 px-6 py-6">
        <h2 className="font-bold text-brand-800">What to know about short-term rentals</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>• Short-term leases typically cost 10–20% more per month than annual leases — you pay for flexibility.</li>
          <li>• Month-to-month leases usually require 30 days' notice to vacate from either party.</li>
          <li>• Always clarify the minimum lease term upfront — "short-term" can mean 1 month or 6 months depending on the landlord.</li>
          <li>• Some landlords offer furnished units on short-term leases — ask if furniture is included.</li>
          <li>• Corporate housing and extended-stay hotels are alternatives, but private landlords on EMLAKIE are typically far cheaper.</li>
        </ul>
      </div>

      {/* Listings */}
      {shortTerm.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available short-term rentals</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shortTerm.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals" className="inline-block rounded-xl bg-brand-700 px-8 py-3 font-semibold text-white transition hover:bg-brand-800">
          Browse all rentals
        </Link>
        <p className="mt-3 text-xs text-gray-500">Contact landlords directly to ask about flexible lease terms.</p>
      </div>
    </div>
  );
}
