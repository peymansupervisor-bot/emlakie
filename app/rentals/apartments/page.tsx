import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Apartments for Rent — Find Your Next Apartment',
  description: 'Browse apartments for rent directly from landlords. Search studio, 1-bed, 2-bed, and 3-bed apartments nationwide — no broker fees, no middlemen.',
  alternates: { canonical: 'https://emlakie.com/rentals/apartments' },
  openGraph: {
    title: 'Apartments for Rent | EMLAKIE',
    description: 'Browse apartments for rent directly from landlords. No broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/apartments',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Apartments for Rent' }],
  },
  twitter: { card: 'summary_large_image', title: 'Apartments for Rent | EMLAKIE', description: 'Browse apartments for rent directly from landlords. No broker fees.', images: ['/og-image.png'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Apartments for Rent',
      description: 'Browse apartments for rent across the United States, listed directly by landlords.',
      url: 'https://emlakie.com/rentals/apartments',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Apartments for Rent', item: 'https://emlakie.com/rentals/apartments' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'How do I find an apartment without paying broker fees?', acceptedAnswer: { '@type': 'Answer', text: 'Browse apartments on EMLAKIE. Every listing is posted directly by the landlord, so there are no broker fees or commissions — just contact the landlord and apply in minutes.' } },
        { '@type': 'Question', name: 'What is the difference between an apartment and a condo rental?', acceptedAnswer: { '@type': 'Answer', text: 'Apartments are units in a building owned by a single entity (usually a property management company or individual landlord). Condos are individually owned units within a shared building — you rent from the individual owner. Both are available on EMLAKIE.' } },
        { '@type': 'Question', name: 'What should I look for when renting an apartment?', acceptedAnswer: { '@type': 'Answer', text: 'Check the lease term, included utilities, pet policy, parking, laundry availability, and move-in costs (first month, last month, security deposit). Always tour before signing and get the lease in writing.' } },
      ],
    },
  ],
};

export default async function ApartmentsPage() {
  const { listings } = await getListings({ propertyType: 'apartment' });
  const featured = listings.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Apartments for Rent</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Apartments for Rent</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Browse studio, 1-bedroom, 2-bedroom, and larger apartments listed directly by landlords — no broker fees, no commissions.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '🏢', title: 'All sizes', body: 'Studios, 1-bed, 2-bed, 3-bed — filter by bedrooms to find your ideal apartment.' },
          { icon: '🤝', title: 'Direct from landlords', body: 'Every listing is posted by the property owner. Message them directly, no middleman.' },
          { icon: '💸', title: 'No broker fees', body: 'Save hundreds — EMLAKIE never charges tenants a finder fee or commission.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">Renting an apartment: what you need to know</h2>
        <p>
          Apartments are the most common rental type in the United States, ranging from compact studios in urban
          high-rises to spacious 3-bedroom units in suburban complexes. When renting directly from a landlord on
          EMLAKIE, you skip the broker markup and deal with the person who actually owns the property.
        </p>
        <p>
          <strong>What to budget for:</strong> Most apartments require first month&apos;s rent plus a security deposit
          equal to one month&apos;s rent at move-in. Some landlords also require last month&apos;s rent upfront. Factor
          in utilities — water and trash are often included, while electricity, gas, and internet typically are not.
        </p>
        <p>
          <strong>Lease terms:</strong> Standard leases run 12 months. Month-to-month leases are available but usually
          cost 10–20% more per month. If you need flexibility, look for short-term or furnished rentals instead.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available apartments</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals?propertyType=apartment" className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
          Search all apartments
        </Link>
        <p className="mt-3 text-xs text-gray-500">Filter by city, price, and bedrooms to narrow your search.</p>
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="font-bold text-gray-900">Browse other rental types</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/rentals/houses" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Houses for rent</Link>
          <Link href="/rentals/condos" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Condos for rent</Link>
          <Link href="/rentals/townhomes" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Townhomes for rent</Link>
          <Link href="/rentals/studios" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Studios for rent</Link>
          <Link href="/rentals/furnished" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Furnished rentals</Link>
          <Link href="/rentals/pet-friendly" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Pet-friendly rentals</Link>
        </div>
      </div>
    </div>
  );
}
