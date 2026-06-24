import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Houses for Rent — Single-Family Homes from Landlords',
  description: 'Find houses for rent directly from homeowners. Browse single-family homes, bungalows, and ranch houses nationwide — no broker fees, no middlemen.',
  alternates: { canonical: 'https://emlakie.com/rentals/houses' },
  openGraph: {
    title: 'Houses for Rent | EMLAKIE',
    description: 'Browse houses for rent directly from homeowners. No broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/houses',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Houses for Rent' }],
  },
  twitter: { card: 'summary_large_image', title: 'Houses for Rent | EMLAKIE', description: 'Browse houses for rent directly from homeowners. No broker fees.', images: ['/og-image.png'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Houses for Rent',
      description: 'Browse single-family houses for rent across the United States, listed directly by homeowners.',
      url: 'https://emlakie.com/rentals/houses',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Houses for Rent', item: 'https://emlakie.com/rentals/houses' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What are the advantages of renting a house over an apartment?', acceptedAnswer: { '@type': 'Answer', text: 'Houses typically offer more space, a private yard, a garage, and fewer shared walls. They also tend to have more flexible pet policies and give families more room to spread out.' } },
        { '@type': 'Question', name: 'Are utilities usually included when renting a house?', acceptedAnswer: { '@type': 'Answer', text: 'Usually not. Most single-family house rentals require the tenant to pay for electricity, gas, water, trash, and internet separately. Always confirm what is included before signing a lease.' } },
        { '@type': 'Question', name: 'Can I rent a house without going through a real estate agent?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. On EMLAKIE, all houses are listed directly by the homeowner or landlord. You message them directly and apply with no broker or agent involved.' } },
      ],
    },
  ],
};

export default async function HousesPage() {
  const { listings } = await getListings({ propertyType: 'house' });
  const featured = listings.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Houses for Rent</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Houses for Rent</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Single-family homes, bungalows, and ranch houses listed directly by homeowners — more space, private yards, and no broker fees.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '🏡', title: 'More space', body: 'Houses offer more square footage, private outdoor areas, and garage parking.' },
          { icon: '🐾', title: 'Pet-friendly', body: 'Private landlords on houses tend to be more flexible with dogs and cats than apartment complexes.' },
          { icon: '🤝', title: 'Owner direct', body: 'Message the homeowner directly. No property management company, no broker markup.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">What to expect when renting a house</h2>
        <p>
          Renting a single-family house gives you space, privacy, and amenities that apartments rarely offer — a
          garage, a yard, more storage, and no shared walls. Most houses for rent are owned by individual landlords
          rather than large corporations, which often means more flexibility on pets, lease terms, and minor
          modifications (painting a room, hanging artwork).
        </p>
        <p>
          <strong>Responsibilities to know:</strong> House rentals often shift more maintenance responsibility to the
          tenant. You may be expected to maintain the lawn, shovel snow, or handle minor repairs. Make sure the lease
          clearly spells out who is responsible for what before you sign.
        </p>
        <p>
          <strong>Utilities:</strong> Unlike apartment buildings where some utilities are bundled, house rentals almost
          always require the tenant to set up and pay for electricity, gas, water, and internet separately. Budget an
          extra $150–$350/mo depending on the region and home size.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available houses for rent</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals?propertyType=house" className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
          Search all houses for rent
        </Link>
        <p className="mt-3 text-xs text-gray-500">Filter by city, price, and bedrooms to find the right house.</p>
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="font-bold text-gray-900">Browse other rental types</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/rentals/apartments" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Apartments for rent</Link>
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
