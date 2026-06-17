import { geocodeAddress } from '@/lib/nominatim';
import { getListings } from '@/lib/api';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

interface Props {
  searchParams: { address?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const address = searchParams.address ?? '';
  return {
    title: address ? `${address} — Property Info` : 'Property Lookup',
  };
}

export default async function PropertyPage({ searchParams }: Props) {
  const rawAddress = searchParams.address ?? '';

  if (!rawAddress) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-gray-500">No address provided.</p>
          <Link href="/rentals" className="mt-4 inline-block text-brand-600 font-semibold hover:underline">Browse all rentals →</Link>
        </main>
        <Footer />
      </>
    );
  }

  const [geo, { listings }] = await Promise.all([
    geocodeAddress(rawAddress),
    getListings({ q: rawAddress }),
  ]);

  const addr = geo?.address;
  const city = addr?.city ?? addr?.town ?? addr?.village ?? '';
  const state = addr?.state ?? '';
  const zip = addr?.postcode ?? '';
  const neighborhood = addr?.neighbourhood ?? addr?.suburb ?? '';
  const street = [addr?.house_number, addr?.road].filter(Boolean).join(' ');
  const fullAddress = geo?.display_name ?? rawAddress;
  const lat = geo ? parseFloat(geo.lat) : null;
  const lng = geo ? parseFloat(geo.lon) : null;

  // OSM static embed bbox (±0.003 degrees around the point)
  const mapSrc = lat && lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.004},${lat - 0.003},${lng + 0.004},${lat + 0.003}&layer=mapnik&marker=${lat},${lng}`
    : null;

  const matchingListings = listings.filter((l) =>
    l.address?.toLowerCase().includes((addr?.road ?? '').toLowerCase()) && addr?.road
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{street || rawAddress}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {street || rawAddress}
          </h1>
          <p className="mt-1 text-gray-500">
            {[neighborhood, city, state, zip].filter(Boolean).join(', ')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Map */}
          <div>
            {mapSrc ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <iframe
                  src={mapSrc}
                  title="Property location"
                  className="h-72 w-full border-0"
                  loading="lazy"
                />
                <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-400">
                  Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">OpenStreetMap</a> contributors
                </div>
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 text-sm">
                Map not available
              </div>
            )}
          </div>

          {/* Property details */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">Property Info</h2>
              <dl className="space-y-3 text-sm">
                {street && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900 text-right">{street}</dd>
                  </div>
                )}
                {neighborhood && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Neighborhood</dt>
                    <dd className="font-medium text-gray-900">{neighborhood}</dd>
                  </div>
                )}
                {city && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">City</dt>
                    <dd className="font-medium text-gray-900">{city}</dd>
                  </div>
                )}
                {state && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">State</dt>
                    <dd className="font-medium text-gray-900">{state}</dd>
                  </div>
                )}
                {zip && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ZIP Code</dt>
                    <dd className="font-medium text-gray-900">{zip}</dd>
                  </div>
                )}
                {lat && lng && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Coordinates</dt>
                    <dd className="font-medium text-gray-900 text-right text-xs">{lat.toFixed(5)}, {lng.toFixed(5)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* List this property CTA */}
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
              <h3 className="font-bold text-brand-800">Own this property?</h3>
              <p className="mt-1 text-sm text-brand-700">List it for free on EMLAKIE and reach thousands of renters directly — no commissions.</p>
              <Link
                href={`/landlord?address=${encodeURIComponent(rawAddress)}`}
                className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition"
              >
                List this property free →
              </Link>
            </div>
          </div>
        </div>

        {/* Matching listings */}
        {matchingListings.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Active rental {matchingListings.length === 1 ? 'listing' : 'listings'} at this address
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matchingListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </section>
        )}

        {/* Nearby rentals */}
        {city && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Rentals near {city}</h2>
              <Link href={`/rentals?q=${encodeURIComponent(city)}`} className="text-sm font-semibold text-brand-600 hover:underline">
                View all →
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Search available rentals in {city}{state ? `, ${state}` : ''} on EMLAKIE.
            </p>
            <Link
              href={`/rentals?q=${encodeURIComponent(city + (state ? `, ${state}` : ''))}`}
              className="mt-4 inline-block rounded-xl border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition"
            >
              Search rentals in {city} →
            </Link>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
