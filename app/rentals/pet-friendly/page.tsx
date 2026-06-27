import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Pet-Friendly Rentals — Apartments & Houses',
  description: 'Find pet-friendly apartments, houses, and condos for rent. Browse listings from landlords who welcome dogs, cats, and other pets — no broker fees.',
  alternates: { canonical: 'https://emlakie.com/rentals/pet-friendly' },
  openGraph: {
    title: 'Pet-Friendly Rentals — Apartments & Houses',
    description: 'Find pet-friendly apartments, houses, and condos for rent. Browse listings from landlords who welcome dogs, cats, and other pets — no broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/pet-friendly',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Pet-Friendly Rentals' }],
  },
  twitter: { card: 'summary_large_image', title: 'Pet-Friendly Rentals — Apartments & Houses', description: 'Find pet-friendly apartments, houses, and condos for rent. Browse listings from landlords who welcome dogs, cats, and other pets — no broker fees.', images: ['/og-image.png'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Pet-Friendly Rentals',
      description: 'Browse pet-friendly rental homes across the United States. Apartments, houses, and condos that allow dogs, cats, and other pets.',
      url: 'https://emlakie.com/rentals/pet-friendly',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Pet-Friendly Rentals', item: 'https://emlakie.com/rentals/pet-friendly' },
      ],
    },
  ],
};

export default async function PetFriendlyPage() {
  const { listings } = await getListings();
  const petFriendly = listings.filter(l =>
    l.amenities?.some(a => /pet|dog|cat/i.test(a)) ||
    /pet|dog|cat/i.test(l.description ?? '') ||
    /pet|dog|cat/i.test(l.title ?? '')
  ).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Pet-Friendly Rentals</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Pet-Friendly Rentals</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Find apartments, houses, and condos where your pets are welcome. All listings posted directly by landlords — no broker fees.
        </p>
      </div>

      {/* Why it matters */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '🐶', title: 'Dogs welcome', body: 'Filter for landlords who explicitly allow dogs — including large breeds.' },
          { icon: '🐱', title: 'Cat-friendly', body: 'Many landlords welcome cats. Browse units with no pet restrictions.' },
          { icon: '🚫', title: 'No hidden fees', body: 'No broker fees ever. Pet deposits and policies are set by the landlord.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-10 rounded-2xl bg-brand-50 border border-brand-100 px-6 py-6">
        <h2 className="font-bold text-brand-800">Tips for renting with pets</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>• Always disclose your pet upfront — hiding a pet can be grounds for eviction.</li>
          <li>• Offer a larger security deposit to reassure the landlord.</li>
          <li>• Ask whether pet rent (a monthly fee) applies on top of the base rent.</li>
          <li>• Check that the unit has outdoor space or is close to a park.</li>
          <li>• Request any pet policy in writing before signing the lease.</li>
        </ul>
      </div>

      {/* More about pet-friendly rentals */}
      <div className="mt-10 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">Finding pet-friendly rentals: what to expect</h2>
        <p>
          Finding a pet-friendly apartment or house for rent is one of the biggest challenges for renters with dogs,
          cats, or other animals. While many landlords advertise &quot;no pets,&quot; a growing number welcome well-behaved
          animals — especially in single-family homes and smaller multi-family buildings where pet damage is easier
          to manage. Private landlords tend to be significantly more flexible than large corporate apartment complexes.
        </p>
        <p>
          <strong>What landlords typically allow:</strong> Most pet-friendly rentals accept cats and small-to-medium
          dogs (under 25–40 lbs). Larger breeds are sometimes restricted by landlord insurance requirements, but the
          best way to find out is to contact the landlord directly. A listing that doesn&apos;t mention pets may still
          be open to a well-trained dog with references from a previous landlord.
        </p>
        <p>
          <strong>Pet fees vs. pet deposits:</strong> Some landlords charge a monthly pet rent ($25–$75/mo per pet),
          others require a one-time refundable pet deposit ($200–$500), and some require both. Always ask for the
          full pet policy — including allowed breeds, weight limits, and number of pets — in writing as a signed
          addendum to your lease before moving in.
        </p>
      </div>

      {/* Listings */}
      {petFriendly.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available pet-friendly rentals</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {petFriendly.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals" className="inline-block rounded-xl bg-brand-700 px-8 py-3 font-semibold text-white transition hover:bg-brand-800">
          Browse all rentals
        </Link>
        <p className="mt-3 text-xs text-gray-500">Use the search filters to find pet-friendly homes in your city.</p>
      </div>
    </div>
  );
}
