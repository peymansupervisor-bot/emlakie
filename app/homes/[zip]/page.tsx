import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import { getListings } from '@/lib/api';
import { lookupZip } from '@/lib/zips';
import { formatPrice } from '@/lib/format';

interface Props {
  params: { zip: string };
}

// All pages are ISR — generated on first request, cached and refreshed every 5 min.
// This mirrors how Zillow works: every valid US zip code has a URL; the page
// always exists even with zero listings.
export const revalidate = 300;
export const dynamicParams = true;

// Pre-build the 50 largest US metro zip codes at deploy time.
// All other zips are generated on first visit (demand-driven ISR).
export async function generateStaticParams() {
  return [
    '10001','10002','10003','10004','10007', // New York
    '90001','90012','90028','90210','90291', // Los Angeles
    '60601','60607','60614','60616','60618', // Chicago
    '77001','77002','77019','77024','77056', // Houston
    '85001','85003','85016','85251','85254', // Phoenix
    '19103','19107','19123','19130','19146', // Philadelphia
    '78201','78209','78212','78216','78230', // San Antonio
    '92101','92103','92108','92115','92127', // San Diego
    '75201','75204','75205','75219','75225', // Dallas
    '95101','95112','95126','95128','95134', // San Jose
  ].map((zip) => ({ zip }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const info = lookupZip(params.zip);
  if (!info) return { title: 'Page not found' };

  const { city, state } = info;
  const label = `${city}, ${state} ${params.zip}`;
  return {
    title: `Homes for Rent in ${label} | Emlakie`,
    description: `Browse rentals in ${label}. Find apartments, houses, condos, and townhomes for rent on Emlakie — America's rental marketplace.`,
    alternates: { canonical: `https://emlakie.com/homes/${params.zip}` },
    openGraph: {
      title: `Homes for Rent in ${label}`,
      description: `Find your next home in ${city}, ${state}. Search rentals by price, bedrooms, and property type.`,
      type: 'website',
      url: `https://emlakie.com/homes/${params.zip}`,
      images: [{ url: '/logo.png', width: 512, height: 512, alt: 'EMLAKIE' }],
    },
    twitter: { card: 'summary_large_image', images: ['/logo.png'] },
  };
}

export default async function ZipPage({ params }: Props) {
  const info = lookupZip(params.zip);

  // Only 404 for invalid zip formats — valid US zips always get a page
  if (!info) notFound();

  const { city, state } = info;
  const label = `${city}, ${state}`;

  const { listings, total } = await getListings({ zip: params.zip });

  const hasListings = listings.length > 0;
  const prices = listings.map((l) => l.price);
  const avgPrice = hasListings
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  const minPrice = hasListings ? Math.min(...prices) : null;
  const maxPrice = hasListings ? Math.max(...prices) : null;

  const avgBeds = hasListings
    ? Math.round(listings.map((l) => l.bedrooms).reduce((a, b) => a + b, 0) / listings.length)
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
      { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
      { '@type': 'ListItem', position: 3, name: state, item: `https://emlakie.com/rentals?city=${encodeURIComponent(city)}` },
      { '@type': 'ListItem', position: 4, name: `${label} ${params.zip}`, item: `https://emlakie.com/homes/${params.zip}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>›</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span>›</span>
        <Link
          href={`/rentals?city=${encodeURIComponent(city)}`}
          className="hover:text-brand-600"
        >
          {state}
        </Link>
        <span>›</span>
        <span className="text-gray-900">{label} {params.zip}</span>
      </nav>

      {/* Heading */}
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
        Homes for Rent in {label} {params.zip}
      </h1>
      <p className="mt-1 text-gray-600">
        {hasListings
          ? `${total} ${total === 1 ? 'home' : 'homes'} available`
          : 'No listings yet in this area'}
      </p>

      {/* Stats bar — only when listings exist */}
      {hasListings && avgPrice && minPrice && maxPrice && (
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
          {[
            { label: 'Avg. Rent', value: formatPrice(avgPrice) + '/mo' },
            { label: 'Price Range', value: `${formatPrice(minPrice)}–${formatPrice(maxPrice)}` },
            { label: 'Listings', value: String(total) },
            { label: 'Avg. Bedrooms', value: avgBeds === 0 ? 'Studio' : `${avgBeds} bed` },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center bg-white py-4 px-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Listings grid */}
      {hasListings ? (
        <>
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Available Rentals</h2>
            <Link
              href={`/rentals?city=${encodeURIComponent(city)}`}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              All {city} rentals →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      ) : (
        /* Empty state — page still exists, great for SEO + landlord acquisition */
        <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 px-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <svg viewBox="0 0 32 32" className="h-8 w-8 fill-brand-600">
              <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            No listings yet in {label} {params.zip}
          </h2>
          <p className="mt-2 text-gray-600">
            Be the first landlord to list a home in this area and reach renters
            searching right here.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/app"
              className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
            >
              List Your Home
            </Link>
            <Link
              href="/rentals"
              className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-600"
            >
              Browse Other Cities
            </Link>
          </div>
        </div>
      )}

      {/* About section */}
      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Rental Market in {label} {params.zip}
        </h2>
        <p className="mt-3 leading-relaxed text-gray-600">
          {hasListings && avgPrice
            ? `There ${total === 1 ? 'is' : 'are'} currently ${total} rental ${total === 1 ? 'home' : 'homes'} listed in ${label}, zip code ${params.zip}. The average asking rent is ${formatPrice(avgPrice)}/month, with prices ranging from ${formatPrice(minPrice!)} to ${formatPrice(maxPrice!)}. Browse listings above and apply directly through the Emlakie app.`
            : `${label} ${params.zip} is a growing rental market. As landlords list homes here, prices and availability will appear on this page automatically. Download the Emlakie app to get notified when new rentals are posted in this area.`}
        </p>
        <Link
          href="/app"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {hasListings ? 'Apply in the App' : 'Get Notified'}
        </Link>
      </section>
    </div>
  );
}
