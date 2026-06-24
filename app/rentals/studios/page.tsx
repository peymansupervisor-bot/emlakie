import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Studio Apartments for Rent — Affordable Studios from Landlords',
  description: 'Find studio apartments for rent directly from landlords. Browse affordable studios nationwide — compact, move-in ready, and no broker fees.',
  alternates: { canonical: 'https://emlakie.com/rentals/studios' },
  openGraph: {
    title: 'Studio Apartments for Rent | EMLAKIE',
    description: 'Browse studio apartments for rent directly from landlords. No broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/studios',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Studios for Rent' }],
  },
  twitter: { card: 'summary_large_image', title: 'Studio Apartments for Rent | EMLAKIE', description: 'Browse studio apartments for rent directly from landlords. No broker fees.', images: ['/og-image.png'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Studio Apartments for Rent',
      description: 'Browse studio apartments for rent across the United States, listed directly by landlords.',
      url: 'https://emlakie.com/rentals/studios',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Studios for Rent', item: 'https://emlakie.com/rentals/studios' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is a studio apartment?', acceptedAnswer: { '@type': 'Answer', text: 'A studio apartment is a self-contained unit where the bedroom, living area, and kitchen are all in one open space. It has a separate bathroom but no defined bedroom wall. Studios are the most affordable rental type and are well-suited for solo renters.' } },
        { '@type': 'Question', name: 'How much does a studio apartment cost to rent?', acceptedAnswer: { '@type': 'Answer', text: 'Studio rent varies widely by city. In major metros like Los Angeles or New York, studios average $1,500–$2,500/mo. In smaller cities and suburbs, you can often find studios for $700–$1,200/mo. Browse current listings on EMLAKIE for real-time pricing in your area.' } },
        { '@type': 'Question', name: 'Is a studio apartment worth it for one person?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — for a single renter, a studio offers private living at the lowest possible cost. The trade-off is less space and no bedroom separation. If you work from home or need a dedicated office, a 1-bedroom may be worth the extra cost.' } },
      ],
    },
  ],
};

export default async function StudiosPage() {
  const { listings } = await getListings({ propertyType: 'studio' });
  const featured = listings.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Studios for Rent</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Studio Apartments for Rent</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Compact, affordable studios listed directly by landlords. The most cost-efficient way to rent your own place — no broker fees.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '💰', title: 'Most affordable', body: 'Studios are the lowest-cost rental type for a private, self-contained unit.' },
          { icon: '⚡', title: 'Fast to move in', body: 'Smaller space means less to furnish, less to clean, and lower utility bills.' },
          { icon: '📍', title: 'Prime locations', body: 'Studios are common in city centers — often closer to transit, restaurants, and work.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-brand-50 border border-brand-100 px-6 py-6">
        <h2 className="font-bold text-brand-800">Tips for maximizing a studio apartment</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>• Use a room divider, bookshelf, or curtain to create a visual separation between sleeping and living areas.</li>
          <li>• Choose multi-function furniture: a sofa bed, a dining table that doubles as a desk, or ottomans with storage.</li>
          <li>• Vertical storage (tall shelves, wall hooks, lofted beds) frees up floor space in a small unit.</li>
          <li>• Light colors and mirrors make a studio feel larger and brighter.</li>
          <li>• Keep clutter minimal — in a studio, everything is visible from everywhere.</li>
        </ul>
      </div>

      <div className="mt-10 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">Who rents studio apartments?</h2>
        <p>
          Studios are popular with students, young professionals, and anyone relocating to a new city who wants to
          keep costs low while getting established. They are also the default option for solo travelers, travel nurses
          on short assignments, and remote workers who want to live in a walkable urban neighborhood without paying
          for more space than they need.
        </p>
        <p>
          <strong>Studio vs. 1-bedroom:</strong> The main difference is separation — a 1-bedroom has a dedicated
          bedroom with a door, while a studio is open-plan. If you frequently video-call for work, host overnight
          guests, or simply need mental separation between sleeping and working, a 1-bedroom will serve you better
          even if it costs $200–$400/mo more.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available studio apartments</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals?propertyType=studio" className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
          Search all studios for rent
        </Link>
        <p className="mt-3 text-xs text-gray-500">Filter by city and price to find a studio in your budget.</p>
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="font-bold text-gray-900">Browse other rental types</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/rentals/apartments" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Apartments for rent</Link>
          <Link href="/rentals/houses" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Houses for rent</Link>
          <Link href="/rentals/condos" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Condos for rent</Link>
          <Link href="/rentals/townhomes" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Townhomes for rent</Link>
          <Link href="/rentals/furnished" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Furnished rentals</Link>
          <Link href="/rentals/pet-friendly" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Pet-friendly rentals</Link>
        </div>
      </div>
    </div>
  );
}
