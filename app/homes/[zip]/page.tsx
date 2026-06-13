import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import { getListings, getAllZips } from '@/lib/api';
import { formatPrice } from '@/lib/format';

interface Props {
  params: { zip: string };
}

export const revalidate = 300;

export async function generateStaticParams() {
  const zips = await getAllZips();
  return zips.map(({ zip }) => ({ zip }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listings } = await getListings({ zip: params.zip });
  if (!listings.length) return { title: `Homes in ${params.zip}` };
  const { city, state } = listings[0];
  const label = `${city}${state ? `, ${state}` : ''} ${params.zip}`;
  return {
    title: `Homes for Rent in ${label} | Emlakie`,
    description: `Browse ${listings.length} rental${listings.length === 1 ? '' : 's'} in ${label}. Find apartments, houses, condos, and more on Emlakie.`,
    alternates: { canonical: `/homes/${params.zip}` },
  };
}

export default async function ZipPage({ params }: Props) {
  const { listings, total, usingSampleData } = await getListings({ zip: params.zip });

  if (!listings.length) notFound();

  const { city, state } = listings[0];
  const label = `${city}${state ? `, ${state}` : ''}`;

  const prices = listings.map((l) => l.price);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const bedCounts = listings.map((l) => l.bedrooms);
  const avgBeds = Math.round(bedCounts.reduce((a, b) => a + b, 0) / bedCounts.length);

  const nearby = await getAllZips().then((zips) =>
    zips.filter((z) => z.city === city && z.zip !== params.zip).slice(0, 4)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>›</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        {state && (
          <>
            <span>›</span>
            <Link
              href={`/rentals?city=${encodeURIComponent(city)}`}
              className="hover:text-brand-600"
            >
              {state}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-gray-900">{label} {params.zip}</span>
      </nav>

      {/* Heading */}
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
        Homes for Rent in {label} {params.zip}
      </h1>
      <p className="mt-1 text-gray-600">
        {total} {total === 1 ? 'home' : 'homes'} available
      </p>

      {/* Stats bar */}
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

      {usingSampleData && (
        <div className="mt-5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Showing sample listings. Real listings will appear here automatically when landlords post
          in {params.zip}.
        </div>
      )}

      {/* Filters link */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Available Rentals</h2>
        <Link
          href={`/rentals?city=${encodeURIComponent(city)}`}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View all {city} rentals →
        </Link>
      </div>

      {/* Listings grid */}
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* About section */}
      <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-900">
          Rental Market in {label} {params.zip}
        </h2>
        <p className="mt-3 leading-relaxed text-gray-600">
          There {total === 1 ? 'is' : 'are'} currently{' '}
          <strong>{total} rental {total === 1 ? 'home' : 'homes'}</strong> listed in{' '}
          {label}, zip code {params.zip}. The average asking rent is{' '}
          <strong>{formatPrice(avgPrice)}/month</strong>, with prices ranging from{' '}
          {formatPrice(minPrice)} to {formatPrice(maxPrice)}. Listings include a mix of
          apartments, houses, condos, and townhomes. Browse the listings above and apply
          directly through the Emlakie app — it takes under two minutes.
        </p>
        <Link
          href="/app"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Download Emlakie to Apply
        </Link>
      </section>

      {/* Nearby zip codes */}
      {nearby.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">Other zip codes in {city}</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {nearby.map(({ zip, city: c, state: s }) => (
              <Link
                key={zip}
                href={`/homes/${zip}`}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:border-brand-500 hover:text-brand-600"
              >
                {c}{s ? `, ${s}` : ''} {zip}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
