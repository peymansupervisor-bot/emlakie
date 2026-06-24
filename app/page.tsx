import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import SearchBar from '@/components/SearchBar';
import ListingCard from '@/components/ListingCard';
import AppBadges from '@/components/AppBadges';
import NewsTicker from '@/components/NewsTicker';
import StatsStrip from '@/components/StatsStrip';
import TrendingCities from '@/components/TrendingCities';
import RecentListings from '@/components/RecentListings';
import LandlordCTACard from '@/components/LandlordCTACard';
import RentEstimatorCard from '@/components/RentEstimatorCard';
import MarketPulse from '@/components/MarketPulse';
import BlogTeaser from '@/components/BlogTeaser';
import { getListings } from '@/lib/api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'EMLAKIE — Find Your Next Rental Home',
  description: 'Browse houses, apartments, and condos for rent directly from landlords. No broker fees, no middlemen. Search rentals by city, ZIP, price, and more.',
  alternates: { canonical: 'https://emlakie.com/' },
  openGraph: {
    title: 'EMLAKIE — Find Your Next Rental Home',
    description: 'Browse houses, apartments, and condos for rent directly from landlords. No broker fees, no middlemen.',
    type: 'website',
    url: 'https://emlakie.com/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE — Find Your Next Rental Home' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMLAKIE — Find Your Next Rental Home',
    description: 'Browse houses, apartments, and condos for rent directly from landlords. No broker fees, no middlemen.',
    images: ['/og-image.png'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EMLAKIE',
  url: 'https://emlakie.com/',
  description: 'Browse houses, apartments, and condos for rent. EMLAKIE connects renters directly with landlords.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://emlakie.com/rentals?city={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EMLAKIE',
  url: 'https://emlakie.com/',
  logo: 'https://emlakie.com/logo.png',
  contactPoint: { '@type': 'ContactPoint', email: 'support@emlakie.com', contactType: 'customer service' },
};

export default async function HomePage() {
  const { listings } = await getListings();
  const featured = listings.slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* News ticker */}
      <NewsTicker />

      {/* Hero */}
      <section className="bg-white py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr_260px]">

            {/* Center — main hero (first in DOM = first on mobile) */}
            <div className="text-center lg:order-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
                Rental Properties Nationwide
              </p>
              <h1 className="mt-3 font-serif text-4xl font-bold text-gray-900 sm:text-5xl">
                List free. Rent fast.<br className="hidden sm:block" /> Keep every dollar.
              </h1>
              <p className="mt-3 text-lg font-medium text-gray-600">
                Landlords post for free · Renters find you directly · No broker fees ever
              </p>
              <div className="mt-6 w-full">
                <SearchBar large />
              </div>
              <StatsStrip />
              <TrendingCities />
              <div className="mt-10 flex items-center justify-center gap-3">
                <Link href="/landlord/login"
                  className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
                  List my property free →
                </Link>
                <span className="text-xs text-gray-400">or browse as a renter below</span>
              </div>
            </div>

            {/* Left — recent listings (second in DOM, lg repositions to col 1) */}
            <div className="lg:order-1">
              <RecentListings />
            </div>

            {/* Right — landlord CTA + rent estimator (third in DOM, lg repositions to col 3) */}
            <div className="lg:order-3">
              <LandlordCTACard />
              <RentEstimatorCard />
            </div>

          </div>
        </div>
      </section>

      {/* Landlord CTA bar */}
      <div className="border-b border-brand-100 bg-brand-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-gray-900">Are you a landlord? <span className="text-brand-600">List your property free.</span></p>
            <p className="mt-0.5 text-xs text-gray-500">Reach thousands of renters · No broker fees · Takes under 5 minutes</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/rent-estimate"
              className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50">
              Get your free E-rent Value™
            </Link>
            <Link href="/landlord/login"
              className="rounded-lg bg-brand-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-700">
              List for free →
            </Link>
          </div>
        </div>
      </div>

      {/* Market pulse */}
      <MarketPulse />

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900">Homes for rent</h2>
            <p className="mt-1 text-gray-600">Fresh listings, updated daily</p>
          </div>
          <Link href="/rentals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} priority={i < 3} />
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="py-20" style={{ backgroundColor: '#faf8f5' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center font-serif text-2xl font-bold text-gray-900">
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

      {/* Blog teaser */}
      <BlogTeaser />

      {/* App promo */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-8 rounded-2xl bg-brand-600 px-6 py-10 sm:rounded-3xl sm:px-14 sm:py-14 lg:flex-row">
          <div className="max-w-xl text-center lg:text-left">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              Take EMLAKIE with you
            </h2>
            <p className="mt-3 text-base text-green-100 sm:text-lg">
              Search on the go, chat with landlords, and get instant alerts when new
              homes hit the market.
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <AppBadges />
            </div>
          </div>
          <div className="hidden h-64 w-64 overflow-hidden rounded-full lg:flex">
            <Image src="/logo.png" alt="EMLAKIE" width={256} height={256} sizes="256px" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
