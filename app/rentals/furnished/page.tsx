import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Furnished Rentals — Move-In Ready Apartments & Houses',
  description: 'Browse furnished apartments and houses for rent. Move in with just your suitcase — ideal for relocations, travel nurses, and short-term stays.',
  alternates: { canonical: 'https://emlakie.com/rentals/furnished' },
  openGraph: {
    title: 'Furnished Rentals — Move-In Ready Apartments & Houses',
    description: 'Browse furnished apartments and houses for rent. Move in with just your suitcase — ideal for relocations, travel nurses, and short-term stays.',
    type: 'website',
    url: 'https://emlakie.com/rentals/furnished',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'EMLAKIE Furnished Rentals' }],
  },
  twitter: { card: 'summary_large_image', title: 'Furnished Rentals — Move-In Ready Apartments & Houses', description: 'Browse furnished apartments and houses for rent. Move in with just your suitcase — ideal for relocations, travel nurses, and short-term stays.', images: ['/opengraph-image'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Furnished Rentals',
      description: 'Find move-in ready furnished apartments and houses for rent across the United States.',
      url: 'https://emlakie.com/rentals/furnished',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Furnished Rentals', item: 'https://emlakie.com/rentals/furnished' },
      ],
    },
  ],
};

export default async function FurnishedPage() {
  const { listings } = await getListings();
  const furnished = listings.filter(l =>
    l.amenities?.some(a => /furnished/i.test(a)) ||
    /furnished/i.test(l.description ?? '') ||
    /furnished/i.test(l.title ?? '')
  ).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Furnished Rentals</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Furnished Rentals</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Move-in ready homes with furniture included. Perfect for relocations, travel nurses, remote workers, and anyone who wants a fresh start without the hassle.
        </p>
      </div>

      {/* Who it's for */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '✈️', title: 'Relocating?', body: 'Move across the country without shipping furniture. Everything you need is already there.' },
          { icon: '🏥', title: 'Travel nurses', body: 'Short assignments need turnkey housing. Furnished rentals let you focus on work, not setup.' },
          { icon: '💻', title: 'Remote workers', body: 'Explore a new city for a few months. Furnished units give you flexibility without commitment.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      {/* What's typically included */}
      <div className="mt-10 rounded-2xl bg-brand-50 border border-brand-100 px-6 py-6">
        <h2 className="font-bold text-brand-800">What "furnished" typically includes</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm text-gray-700">
          {['Bed frame & mattress', 'Sofa & living room furniture', 'Dining table & chairs', 'Kitchen appliances', 'Washer / dryer', 'Wi-Fi (in many units)'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 stroke-brand-600" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 13 4 4L19 7" />
              </svg>
              {item}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500">Always confirm exactly what's included with the landlord before signing.</p>
      </div>

      {/* More about furnished rentals */}
      <div className="mt-10 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">What to look for in a furnished rental</h2>
        <p>
          Furnished apartments and houses for rent vary widely — from bare-essentials setups (a mattress and a couch)
          to fully-equipped homes with linens, cookware, smart TVs, and high-speed internet. Before you sign a lease,
          get a complete inventory of what&apos;s included in writing so there are no surprises on move-in day.
        </p>
        <p>
          <strong>Typical lease terms:</strong> Furnished rentals most often come with flexible or shorter lease
          agreements — month-to-month, 3-month, or 6-month terms are common. This makes them ideal for travel nurses
          on 13-week assignments, professionals on corporate relocations, remote workers testing a new city, or
          anyone bridging a gap between a sold home and a new permanent residence.
        </p>
        <p>
          <strong>Cost vs. unfurnished:</strong> Furnished units typically cost 10–30% more per month than a
          comparable unfurnished rental. For stays of three months or longer, compare that premium against the cost
          of buying basic furniture, renting storage, or shipping your belongings — furnished often wins on total
          cost. Short-term furnished housing is almost always cheaper than an extended-stay hotel.
        </p>
      </div>

      {/* Listings */}
      {furnished.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Available furnished rentals</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {furnished.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals" className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
          Browse all rentals
        </Link>
      </div>
    </div>
  );
}
