import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Condos for Rent — Rent a Condo Direct from the Owner',
  description: 'Find condos for rent listed directly by individual condo owners. Browse condo rentals nationwide — updated kitchens, amenities, and no broker fees.',
  alternates: { canonical: 'https://emlakie.com/rentals/condos' },
  openGraph: {
    title: 'Condos for Rent | EMLAKIE',
    description: 'Browse condos for rent directly from individual owners. No broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/condos',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Condos for Rent' }],
  },
  twitter: { card: 'summary_large_image', title: 'Condos for Rent | EMLAKIE', description: 'Browse condos for rent directly from individual owners. No broker fees.', images: ['/og-image.png'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Condos for Rent',
      description: 'Browse condos for rent across the United States, listed directly by individual condo owners.',
      url: 'https://emlakie.com/rentals/condos',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Condos for Rent', item: 'https://emlakie.com/rentals/condos' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the difference between renting a condo and an apartment?', acceptedAnswer: { '@type': 'Answer', text: 'A condo is individually owned — you rent directly from the owner, who often lives in the same building. Apartment buildings are typically owned by a single entity and managed by a company. Condo rentals often feature upgraded finishes and direct-owner communication.' } },
        { '@type': 'Question', name: 'Do condo rentals include HOA amenities?', acceptedAnswer: { '@type': 'Answer', text: 'Usually yes. Most condo buildings have a homeowners association (HOA) that provides amenities like a gym, pool, or concierge. Confirm with the owner whether HOA access is included in your rent.' } },
        { '@type': 'Question', name: 'Who pays HOA fees when renting a condo?', acceptedAnswer: { '@type': 'Answer', text: 'The owner typically pays HOA dues — it is their responsibility as the unit owner. However, some landlords factor these costs into the rent or require the tenant to pay certain condo fees. Always clarify this before signing.' } },
      ],
    },
  ],
};

export default async function CondosPage() {
  const { listings } = await getListings({ propertyType: 'condo' });
  const now = Date.now();
  const sorted = [...listings].sort((a, b) => {
    const aB = a.boosted_until && new Date(a.boosted_until).getTime() > now ? 1 : 0;
    const bB = b.boosted_until && new Date(b.boosted_until).getTime() > now ? 1 : 0;
    return bB - aB;
  });
  const featured = sorted.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Condos for Rent</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Condos for Rent</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Rent a condo directly from the owner. Updated finishes, building amenities, and a direct relationship with the person who owns your unit — no broker fees.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '✨', title: 'Upgraded finishes', body: 'Condo owners often invest in their units. Expect granite counters, stainless appliances, and hardwood floors.' },
          { icon: '🏊', title: 'Building amenities', body: 'Many condo buildings include a gym, pool, rooftop deck, or concierge — often included in your rent.' },
          { icon: '🗝️', title: 'Owner direct', body: 'You deal with the individual owner, not a property management company. Issues get resolved faster.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">What to expect when renting a condo</h2>
        <p>
          Condo rentals sit between apartment and house rentals in terms of space and cost. You rent from an individual
          owner rather than a corporation, which usually means better communication and more personalized service. Condos
          also typically have nicer finishes than comparable apartments because owners invest in their own property.
        </p>
        <p>
          <strong>HOA rules apply to tenants:</strong> When you rent a condo, you must follow the building&apos;s HOA
          rules — noise restrictions, move-in/out hours, parking policies, and pet rules set by the HOA. Your landlord
          is responsible for sharing these rules with you before you sign a lease.
        </p>
        <p>
          <strong>Insurance:</strong> The building&apos;s HOA master policy covers the structure, but not your belongings
          or personal liability. Get renter&apos;s insurance — it typically costs $10–$25/mo and covers theft, fire, and
          water damage to your personal property.
        </p>
      </div>

      {featured.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available condos for rent</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals?propertyType=condo" className="inline-block rounded-xl bg-brand-700 px-8 py-3 font-semibold text-white transition hover:bg-brand-800">
          Search all condos for rent
        </Link>
        <p className="mt-3 text-xs text-gray-500">Filter by city, price, and bedrooms to find your condo.</p>
      </div>

      <div className="mt-12 border-t border-gray-100 pt-8">
        <h2 className="font-bold text-gray-900">Browse other rental types</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/rentals/apartments" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Apartments for rent</Link>
          <Link href="/rentals/houses" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Houses for rent</Link>
          <Link href="/rentals/townhomes" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Townhomes for rent</Link>
          <Link href="/rentals/studios" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Studios for rent</Link>
          <Link href="/rentals/furnished" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Furnished rentals</Link>
          <Link href="/rentals/pet-friendly" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-brand-300 hover:text-brand-600">Pet-friendly rentals</Link>
        </div>
      </div>
    </div>
  );
}
