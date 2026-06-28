import Link from 'next/link';
import type { Metadata } from 'next';

import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';
import TrendingCities from '@/components/TrendingCities';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import { getListings, getTopStates } from '@/lib/api';
import { ASSISTANT_ENABLED } from '@/lib/assistant/config';

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'EMLAKIE — Rentals Direct from Landlords' },
  description: 'Search houses, apartments, and condos for rent directly from landlords. No broker fees, no middlemen. List your rental free in under 5 minutes.',
  alternates: { canonical: 'https://emlakie.com/' },
  openGraph: {
    title: 'EMLAKIE — Rentals Direct from Landlords',
    description: 'Search rentals direct from landlords. No broker fees.',
    type: 'website',
    url: 'https://emlakie.com/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Rentals' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMLAKIE — Rentals Direct from Landlords',
    description: 'Search rentals direct from landlords. No broker fees.',
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
    target: { '@type': 'EntryPoint', urlTemplate: 'https://emlakie.com/rentals?q={search_term_string}' },
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


const PROPERTY_TYPES = [
  { href: '/rentals', label: 'All' },
  { href: '/rentals/apartments', label: 'Apartments' },
  { href: '/rentals/houses', label: 'Houses' },
  { href: '/rentals/condos', label: 'Condos' },
  { href: '/rentals/studios', label: 'Studios' },
  { href: '/rentals/townhomes', label: 'Townhomes' },
  { href: '/rentals/pet-friendly', label: 'Pet-friendly' },
];

// Top 32 states by renter population for the browse grid
const BROWSE_STATES = [
  { name: 'California', abbr: 'CA', slug: 'california' },
  { name: 'Texas', abbr: 'TX', slug: 'texas' },
  { name: 'Florida', abbr: 'FL', slug: 'florida' },
  { name: 'New York', abbr: 'NY', slug: 'new-york' },
  { name: 'Illinois', abbr: 'IL', slug: 'illinois' },
  { name: 'Pennsylvania', abbr: 'PA', slug: 'pennsylvania' },
  { name: 'Ohio', abbr: 'OH', slug: 'ohio' },
  { name: 'Georgia', abbr: 'GA', slug: 'georgia' },
  { name: 'North Carolina', abbr: 'NC', slug: 'north-carolina' },
  { name: 'Michigan', abbr: 'MI', slug: 'michigan' },
  { name: 'New Jersey', abbr: 'NJ', slug: 'new-jersey' },
  { name: 'Virginia', abbr: 'VA', slug: 'virginia' },
  { name: 'Washington', abbr: 'WA', slug: 'washington' },
  { name: 'Arizona', abbr: 'AZ', slug: 'arizona' },
  { name: 'Massachusetts', abbr: 'MA', slug: 'massachusetts' },
  { name: 'Tennessee', abbr: 'TN', slug: 'tennessee' },
  { name: 'Indiana', abbr: 'IN', slug: 'indiana' },
  { name: 'Colorado', abbr: 'CO', slug: 'colorado' },
  { name: 'Missouri', abbr: 'MO', slug: 'missouri' },
  { name: 'Maryland', abbr: 'MD', slug: 'maryland' },
  { name: 'Wisconsin', abbr: 'WI', slug: 'wisconsin' },
  { name: 'Minnesota', abbr: 'MN', slug: 'minnesota' },
  { name: 'South Carolina', abbr: 'SC', slug: 'south-carolina' },
  { name: 'Alabama', abbr: 'AL', slug: 'alabama' },
  { name: 'Louisiana', abbr: 'LA', slug: 'louisiana' },
  { name: 'Kentucky', abbr: 'KY', slug: 'kentucky' },
  { name: 'Oregon', abbr: 'OR', slug: 'oregon' },
  { name: 'Oklahoma', abbr: 'OK', slug: 'oklahoma' },
  { name: 'Connecticut', abbr: 'CT', slug: 'connecticut' },
  { name: 'Nevada', abbr: 'NV', slug: 'nevada' },
  { name: 'Utah', abbr: 'UT', slug: 'utah' },
  { name: 'Arkansas', abbr: 'AR', slug: 'arkansas' },
];

export default async function HomePage() {
  const [{ listings }] = await Promise.all([
    getListings(),
  ]);
  const featured = listings.slice(0, 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-white py-14 sm:pt-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">

          {/* Headline */}
          <h1 className="text-center font-serif text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            Find your next rental home.
          </h1>
          {ASSISTANT_ENABLED ? (
            <p className="mt-3 text-center text-sm text-gray-600 sm:text-base">
              Just tell Emlakie what you&apos;re looking for.
            </p>
          ) : (
            <p className="mt-3 text-center text-sm text-gray-600 sm:text-base">
              Rentals direct from landlords — no broker fees, no middlemen.
            </p>
          )}

          {/* Search bar */}
          <div className="mt-8 flex justify-center">
            <SearchBar large showVoice={ASSISTANT_ENABLED} />
          </div>

          {/* Property type chips */}
          <div className="mt-5 flex justify-center">
            <div className="-mx-4 sm:mx-0">
              <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
                {PROPERTY_TYPES.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="shrink-0 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-900 hover:text-white"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Featured Rentals ─────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title="Latest rentals" seeAllHref="/rentals" />

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
              <p className="text-sm">New listings arriving soon.</p>
              <Link href="/landlord/login" className="mt-3 inline-block text-sm font-semibold text-brand-600 transition hover:text-brand-700">
                List your property →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Trending Cities ──────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title="Trending cities" seeAllHref="/cities" seeAllLabel="All cities →" />
          <TrendingCities />
        </div>
      </section>

      {/* ── Browse by State ──────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title="Browse by state" />
          <div className="grid grid-cols-4 gap-x-4 gap-y-2.5 sm:grid-cols-6 lg:grid-cols-8">
            {BROWSE_STATES.map((s) => (
              <Link
                key={s.slug}
                href={`/rentals/state/${s.slug}`}
                className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-50"
              >
                <span className="w-6 shrink-0 text-center text-xs font-bold text-brand-600">{s.abbr}</span>
                <span className="truncate text-sm text-gray-600 transition group-hover:text-gray-900">{s.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 border-t border-gray-100 pt-5">
            <Link
              href="/rentals"
              className="text-sm font-semibold text-brand-600 transition hover:text-brand-700"
            >
              Browse all rentals nationwide →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Landlord section ─────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">

            {/* Left: text */}
            <div className="max-w-lg">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-600">For landlords</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900">
                List your rental.<br />Keep every dollar.
              </h2>
              <p className="mt-3 text-gray-500">
                Post for free in under 5 minutes. Direct inquiries from renters. No commissions, ever.
              </p>
              <div className="mt-6 flex flex-wrap gap-5">
                {[
                  'Free to list',
                  'AI descriptions',
                  'Direct messaging',
                  'No commissions',
                ].map((f) => (
                  <span key={f} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 fill-brand-500" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex shrink-0 flex-col gap-3">
              <Button href="/landlord/login" size="xl">List Property Free</Button>
              <Button href="/for-landlords" variant="ghost" className="text-center text-sm">
                Learn how it works →
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEO: property types ──────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-4">
            {[
              { href: '/rentals/apartments', label: 'Apartments for rent' },
              { href: '/rentals/houses', label: 'Houses for rent' },
              { href: '/rentals/condos', label: 'Condos for rent' },
              { href: '/rentals/townhomes', label: 'Townhomes for rent' },
              { href: '/rentals/studios', label: 'Studios for rent' },
              { href: '/rentals/pet-friendly', label: 'Pet-friendly rentals' },
              { href: '/rentals/furnished', label: 'Furnished rentals' },
              { href: '/rentals/short-term', label: 'Short-term rentals' },
              { href: '/rentals/section-8', label: 'Section 8 rentals' },
              { href: '/rentals?bedrooms=1', label: '1-bedroom rentals' },
              { href: '/rentals?bedrooms=2', label: '2-bedroom rentals' },
              { href: '/rentals?bedrooms=3', label: '3-bedroom rentals' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-1 text-sm text-gray-500 transition hover:text-brand-600"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
