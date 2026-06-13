import Image from 'next/image';
import Link from 'next/link';

import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import AppBadges from '@/components/AppBadges';
import { getListings } from '@/lib/api';

export default async function HomePage() {
  const { listings } = await getListings();
  const featured = listings.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[480px] sm:h-[540px]">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80"
            alt="Beautiful home exterior"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="max-w-3xl text-4xl font-extrabold text-white drop-shadow-lg sm:text-5xl">
              Find your next home
            </h1>
            <p className="mt-3 max-w-xl text-lg font-medium text-white/90 drop-shadow">
              Houses, apartments, and condos for rent — direct from landlords.
            </p>
            <div className="mt-8 w-full max-w-2xl">
              <SearchBar large />
            </div>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Homes for rent</h2>
            <p className="mt-1 text-gray-600">Fresh listings, updated daily</p>
          </div>
          <Link href="/rentals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold text-gray-900">
            Renting, without the runaround
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: 'Talk directly to landlords',
                body: 'Message property owners in the app — no middlemen, no missed calls.',
                icon: (
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                ),
              },
              {
                title: 'Apply in minutes',
                body: 'One simple application. Landlords respond fast with a clear yes or no.',
                icon: (
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </>
                ),
              },
              {
                title: 'Verified listings',
                body: 'Every listing is posted by a real landlord — no bait-and-switch, no scams.',
                icon: (
                  <>
                    <path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3z" />
                    <path d="m9 12 2 2 4-4" />
                  </>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 text-center shadow-card">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6 stroke-brand-600"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App promo */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-10 rounded-3xl bg-brand-600 p-10 sm:p-14 lg:flex-row">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-white">
              Take EMLAKIE with you
            </h2>
            <p className="mt-3 text-lg text-white">
              Search on the go, chat with landlords, and get instant alerts when new
              homes hit the market. Coming soon to the App Store and Google Play.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <AppBadges />
            </div>
          </div>
          <div className="hidden h-64 w-64 overflow-hidden rounded-full lg:flex">
            <Image src="/logo.png" alt="Emlakie" width={256} height={256} className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
