import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import SeoLinkGrid from '@/components/SeoLinkGrid';
import { getListingsByState, getTrendingCities } from '@/lib/api';
import { US_STATES } from '@/lib/states';
import { formatPrice } from '@/lib/format';

interface Props {
  params: Promise<{ state: string }>;
}

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: slug } = await params;
  const result = await getListingsByState(slug);
  if (!result) return { title: 'State not found' };

  const { name, abbr } = result.state;
  const hasListings = result.total > 0;
  return {
    title: `Houses & Apartments for Rent in ${name}`,
    description: `Browse ${hasListings ? result.total + ' ' : ''}rental homes in ${name} — apartments, houses, condos, and townhomes listed directly by landlords. No broker fees.`,
    alternates: { canonical: `https://emlakie.com/rentals/state/${slug}` },
    robots: hasListings ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: `Homes for Rent in ${name} (${abbr}) | EMLAKIE`,
      description: `Find your next rental home in ${name}. Search directly from landlords — no middlemen, no fees.`,
      type: 'website',
      url: `https://emlakie.com/rentals/state/${slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `Homes for Rent in ${name}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Homes for Rent in ${name} (${abbr}) | EMLAKIE`,
      description: `Find your next rental home in ${name}. Search directly from landlords — no middlemen, no fees.`,
      images: ['/og-image.png'],
    },
  };
}

export default async function StatePage({ params }: Props) {
  const { state: slug } = await params;
  const [result, trendingCities] = await Promise.all([
    getListingsByState(slug),
    getTrendingCities(8),
  ]);

  if (!result) notFound();

  const { listings, total, state, cities, avgRent, minRent, maxRent, usingSampleData } = result!;
  const { name, abbr } = state;
  const hasListings = listings.length > 0;

  const stateFaqs = [
    { q: `How many rentals are available in ${name}?`, a: total > 0 ? `There are currently ${total} rental homes listed in ${name} on EMLAKIE, including apartments, houses, and condos.` : `EMLAKIE lists rental homes across ${name} posted directly by landlords. New listings are added daily.` },
    { q: `What is the average rent in ${name}?`, a: avgRent ? `The average rent in ${name} is ${formatPrice(avgRent)}, with listings ranging from ${formatPrice(minRent ?? 0)} to ${formatPrice(maxRent ?? 0)}.` : `Rental prices in ${name} vary by city and property type. Browse current listings on EMLAKIE to find up-to-date pricing.` },
    { q: `How do I find a rental in ${name} without broker fees?`, a: `All listings on EMLAKIE are posted directly by landlords — there are no broker fees or middlemen. Browse homes in ${name}, message the landlord directly, and apply in minutes.` },
    { q: `Can landlords in ${name} list for free on EMLAKIE?`, a: `Yes. Landlords in ${name} can post rental listings for free on EMLAKIE. Reach thousands of qualified renters without paying broker commissions.` },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `Houses & Apartments for Rent in ${name}`,
        description: `Browse rental homes in ${name} on EMLAKIE — listed directly by landlords.`,
        url: `https://emlakie.com/rentals/state/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
          { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
          { '@type': 'ListItem', position: 3, name: name, item: `https://emlakie.com/rentals/state/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: stateFaqs.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">›</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">›</span>
        <span className="text-gray-900">{name}</span>
      </nav>

      {/* Heading */}
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
        Houses &amp; Apartments for Rent in {name}
      </h1>
      <p className="mt-1 text-gray-600">
        {hasListings
          ? `${total} rental ${total === 1 ? 'home' : 'homes'} available in ${abbr}`
          : `Rental homes in ${name}`}
        {usingSampleData && <span className="ml-2 text-xs text-amber-600">(sample data)</span>}
      </p>

      {/* Stats bar */}
      {hasListings && avgRent && minRent && maxRent && (
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
          {[
            { label: 'Avg. Rent', value: formatPrice(avgRent) },
            { label: 'Price Range', value: `${formatPrice(minRent)}–${formatPrice(maxRent)}` },
            { label: 'Listings', value: String(total) },
            { label: 'Cities', value: String(cities.length) },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center bg-white py-4 px-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Cities in this state */}
      {cities.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">Popular Cities in {name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map((c) => (
              <Link
                key={c.city}
                href={`/rentals/city/${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-brand-400 hover:text-brand-700"
              >
                {c.city}
                {c.count > 0 && (
                  <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-xs font-semibold text-brand-700">
                    {c.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Listings grid */}
      {hasListings ? (
        <>
          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Available Rentals in {name}</h2>
            <Link
              href={`/rentals?q=${encodeURIComponent(abbr)}`}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Filter &amp; sort →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.slice(0, 9).map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} priority={i < 3} />
            ))}
          </div>
          {total > 9 && (
            <div className="mt-8 text-center">
              <Link
                href={`/rentals?q=${encodeURIComponent(abbr)}`}
                className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
              >
                View all {total} rentals in {abbr} →
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 px-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <svg viewBox="0 0 32 32" className="h-8 w-8 fill-brand-600" aria-hidden="true">
              <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">No listings yet in {name}</h2>
          <p className="mt-2 text-gray-600">
            Be the first landlord to list a home here and reach renters searching in {name} right now.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/landlord/login" className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
              List Your Home Free
            </Link>
            <Link href="/rentals" className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-600">
              Browse Other States
            </Link>
          </div>
        </div>
      )}

      {/* Market summary */}
      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">Rental Market in {name}</h2>
        <p className="mt-3 leading-relaxed text-gray-600">
          {hasListings && avgRent
            ? `${name} currently has ${total} active rental ${total === 1 ? 'listing' : 'listings'} on EMLAKIE across ${cities.length} ${cities.length === 1 ? 'city' : 'cities'}. The average asking rent is ${formatPrice(avgRent)}, with prices ranging from ${formatPrice(minRent!)} to ${formatPrice(maxRent!)}. Browse listings above and contact landlords directly — no broker, no fees.`
            : `${name} is an active rental market. EMLAKIE connects renters directly with landlords across the state — no broker fees, no middlemen. As landlords list homes here, live prices and availability will appear on this page. List your property on EMLAKIE to reach renters searching in ${name} today.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/rentals?q=${encodeURIComponent(abbr)}`} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Search {abbr} rentals
          </Link>
          <Link href="/landlord/login" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-600">
            List your home free
          </Link>
        </div>
      </section>

      {/* Niche links */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: `/rentals?q=${encodeURIComponent(abbr)}&propertyType=apartment`, label: 'Apartments in ' + abbr },
          { href: `/rentals?q=${encodeURIComponent(abbr)}&propertyType=house`, label: 'Houses in ' + abbr },
          { href: `/rentals/pet-friendly`, label: 'Pet-friendly rentals' },
          { href: `/rentals/furnished`, label: 'Furnished rentals' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-card transition hover:border-brand-400 hover:text-brand-700 text-center">
            {item.label}
          </Link>
        ))}
      </section>

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <div className="mt-4 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {stateFaqs.map((faq) => (
            <details key={faq.q} className="group px-6 py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-gray-900 marker:content-none">
                {faq.q}
                <svg className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* SEO link grid */}
      <SeoLinkGrid trendingCities={trendingCities} />
    </div>
  );
}
