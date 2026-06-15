import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Furnished Rentals — Move-In Ready Apartments & Houses',
  description: 'Browse furnished apartments and houses for rent. Move in with just your suitcase — ideal for relocations, travel nurses, and short-term stays.',
  alternates: { canonical: 'https://emlakie.com/rentals/furnished' },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Furnished Rentals',
  description: 'Find move-in ready furnished apartments and houses for rent across the United States.',
  url: 'https://emlakie.com/rentals/furnished',
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
