import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Townhomes for Rent — Multi-Level Homes from Landlords',
  description: 'Find townhomes and townhouses for rent directly from landlords. Browse multi-level homes with private entrances, garages, and yards — no broker fees.',
  alternates: { canonical: 'https://emlakie.com/rentals/townhomes' },
  openGraph: {
    title: 'Townhomes for Rent | EMLAKIE',
    description: 'Browse townhomes for rent directly from landlords. No broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/townhomes',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Townhomes for Rent' }],
  },
  twitter: { card: 'summary_large_image', title: 'Townhomes for Rent | EMLAKIE', description: 'Browse townhomes for rent directly from landlords. No broker fees.', images: ['/og-image.png'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Townhomes for Rent',
      description: 'Browse townhomes and townhouses for rent across the United States, listed directly by landlords.',
      url: 'https://emlakie.com/rentals/townhomes',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Townhomes for Rent', item: 'https://emlakie.com/rentals/townhomes' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the difference between a townhome and a house?', acceptedAnswer: { '@type': 'Answer', text: 'A townhome is a multi-level attached home that shares one or two walls with neighboring units. It has its own private entrance, often a small patio or yard, and sometimes a garage. A single-family house stands completely detached on its own lot.' } },
        { '@type': 'Question', name: 'Are townhomes cheaper to rent than houses?', acceptedAnswer: { '@type': 'Answer', text: 'Generally yes. Townhomes typically rent for less than a comparable single-family house because they share walls and have smaller lots. However, they usually cost more than apartments because of the extra space and private entrance.' } },
        { '@type': 'Question', name: 'Do townhomes come with parking?', acceptedAnswer: { '@type': 'Answer', text: 'Many townhomes include an attached or detached garage, or assigned parking. Always confirm parking availability and any associated fees with the landlord before signing.' } },
      ],
    },
  ],
};

export default async function TownhomesPage() {
  const { listings } = await getListings({ propertyType: 'townhouse' });
  const featured = listings.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Townhomes for Rent</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Townhomes for Rent</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Multi-level townhomes and townhouses with private entrances, garages, and patios — listed directly by landlords with no broker fees.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '🏠', title: 'House-like space', body: 'Multiple floors, private entrance, and a patio or yard — more space than a typical apartment.' },
          { icon: '🚗', title: 'Garage parking', body: 'Many townhomes include an attached or detached garage — a major perk in dense cities.' },
          { icon: '🤐', title: 'Fewer shared walls', body: 'Usually only one or two shared walls versus an apartment, meaning less noise and more privacy.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">Renting a townhome: what to know</h2>
        <p>
          Townhomes are a popular middle ground between apartment and house rentals. You get the multi-level floor plan
          and private entrance of a house, but at a lower price point because of the shared walls. Most townhomes are
          2–3 bedrooms with at least 1.5 bathrooms, making them well-suited for families, roommates, or anyone who needs
          more space than a typical apartment offers.
        </p>
        <p>
          <strong>HOA or community rules:</strong> Many townhome communities are governed by an HOA that sets rules
          around exterior upkeep, parking, and common area use. Your landlord is required to provide you with the HOA
          rules as part of your lease agreement.
        </p>
        <p>
          <strong>Storage and outdoor space:</strong> Townhomes often include a private patio, backyard, or balcony
          plus a garage or storage room — amenities that apartment renters usually have to pay extra for or go without.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available townhomes for rent</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals?propertyType=townhouse" className="inline-block rounded-xl bg-brand-700 px-8 py-3 font-semibold text-white transition hover:bg-brand-800">
          Search all townhomes for rent
        </Link>
        <p className="mt-3 text-xs text-gray-500">Filter by city, price, and bedrooms to find your townhome.</p>
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="font-bold text-gray-900">Browse other rental types</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/rentals/apartments" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Apartments for rent</Link>
          <Link href="/rentals/houses" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Houses for rent</Link>
          <Link href="/rentals/condos" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Condos for rent</Link>
          <Link href="/rentals/studios" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Studios for rent</Link>
          <Link href="/rentals/furnished" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Furnished rentals</Link>
          <Link href="/rentals/pet-friendly" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Pet-friendly rentals</Link>
        </div>
      </div>
    </div>
  );
}
