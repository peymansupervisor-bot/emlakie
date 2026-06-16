import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import { getAllCities, getListingsByCity } from '@/lib/api';
import { formatPrice } from '@/lib/format';

interface Props {
  params: Promise<{ city: string }>;
}

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const cities = await getAllCities();
  return cities.map(c => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const result = await getListingsByCity(slug);
  if (!result) return { title: 'City not found' };

  const label = result.state ? `${result.city}, ${result.state}` : result.city;
  return {
    title: `Homes for Rent in ${label}`,
    description: `Browse rental apartments, houses, and condos in ${label}. Find your next home on EMLAKIE — listed directly by landlords, no broker fees.`,
    alternates: { canonical: `https://emlakie.com/rentals/city/${slug}` },
    openGraph: {
      title: `Homes for Rent in ${label}`,
      description: `Find your next home in ${label}. Search rentals by price, bedrooms, and property type on EMLAKIE.`,
      type: 'website',
      images: [{ url: '/logo.png', width: 512, height: 512, alt: 'EMLAKIE' }],
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  const result = await getListingsByCity(slug);
  if (!result) notFound();

  const { listings, total, city, state, usingSampleData } = result;
  const label = state ? `${city}, ${state}` : city;
  const hasListings = listings.length > 0;

  const prices = listings.map(l => l.price);
  const avgPrice = hasListings ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
  const minPrice = hasListings ? Math.min(...prices) : null;
  const maxPrice = hasListings ? Math.max(...prices) : null;
  const avgBeds  = hasListings ? Math.round(listings.map(l => l.bedrooms).reduce((a, b) => a + b, 0) / listings.length) : null;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `Homes for Rent in ${label}`,
        description: `Browse rental listings in ${label} on EMLAKIE.`,
        url: `https://emlakie.com/rentals/city/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
          { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
          { '@type': 'ListItem', position: 3, name: label, item: `https://emlakie.com/rentals/city/${slug}` },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>›</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span>›</span>
        <span className="text-gray-900">{label}</span>
      </nav>

      {/* Heading */}
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
        Homes for Rent in {label}
      </h1>
      <p className="mt-1 text-gray-600">
        {hasListings
          ? `${total} rental ${total === 1 ? 'home' : 'homes'} available`
          : 'No listings yet in this city'}
        {usingSampleData && <span className="ml-2 text-xs text-amber-600">(sample data)</span>}
      </p>

      {/* Stats bar */}
      {hasListings && avgPrice && minPrice && maxPrice && (
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
          {[
            { label: 'Avg. Rent', value: `${formatPrice(avgPrice)}/mo` },
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
            <h2 className="text-xl font-bold text-gray-900">Available Rentals in {city}</h2>
            <Link
              href={`/rentals?city=${encodeURIComponent(city)}`}
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Filter & sort →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-gray-200 px-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <svg viewBox="0 0 32 32" className="h-8 w-8 fill-brand-600">
              <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">No listings yet in {label}</h2>
          <p className="mt-2 text-gray-600">
            Be the first landlord to list a home here and reach renters searching right now.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/landlord/login" className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
              List Your Home
            </Link>
            <Link href="/rentals" className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-600">
              Browse Other Cities
            </Link>
          </div>
        </div>
      )}

      {/* Market summary */}
      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">Rental Market in {label}</h2>
        <p className="mt-3 leading-relaxed text-gray-600">
          {hasListings && avgPrice
            ? `There ${total === 1 ? 'is' : 'are'} currently ${total} rental ${total === 1 ? 'home' : 'homes'} listed in ${label}. The average asking rent is ${formatPrice(avgPrice)}/month, with prices ranging from ${formatPrice(minPrice!)} to ${formatPrice(maxPrice!)}. Apply directly to any listing through EMLAKIE — no broker, no fees.`
            : `${label} is an active rental market. As landlords list homes here, live prices and availability will appear on this page automatically. List your property on EMLAKIE to reach renters searching in ${city} right now.`}
        </p>
        <div className="mt-4 flex gap-3">
          <Link href={`/rentals?city=${encodeURIComponent(city)}`} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Search {city} rentals
          </Link>
          <Link href="/blog" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand-400 hover:text-brand-600">
            Rental market guides
          </Link>
        </div>
      </section>

      {/* Niche links */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/rentals/pet-friendly', label: '🐶 Pet-friendly rentals' },
          { href: '/rentals/furnished', label: '🛋️ Furnished rentals' },
          { href: '/rentals/short-term', label: '📅 Short-term rentals' },
          { href: '/rentals/section-8', label: '🏠 Section 8 rentals' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-card transition hover:border-brand-400 hover:text-brand-700 text-center">
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
