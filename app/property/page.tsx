import { geocodeAddress } from '@/lib/nominatim';
import { getListings } from '@/lib/api';
import { getAreaEValue } from '@/lib/e-value';
import { getPropertyData } from '@/lib/zllw';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
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
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-gray-500">No address provided.</p>
        <Link href="/rentals" className="mt-4 inline-block text-brand-600 font-semibold hover:underline">Browse all rentals →</Link>
      </main>
    );
  }

  const [geo, { listings }, propData] = await Promise.all([
    geocodeAddress(rawAddress),
    getListings({ q: rawAddress }),
    getPropertyData(rawAddress),
  ]);

  const addr = geo?.address;
  const city = addr?.city ?? addr?.town ?? addr?.village ?? '';
  const state = addr?.state ?? '';
  const areaEValue = city ? await getAreaEValue(city, state) : null;

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
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {street || rawAddress}
          </h1>
          <p className="mt-1 text-gray-500">
            {[neighborhood, city, state, zip].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Rent Zestimate — hero banner (full width) */}
        {propData?.rentZestimate && (
          <div className="mb-6 rounded-2xl bg-brand-600 px-8 py-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-brand-100 uppercase tracking-widest">Est. Monthly Rent</p>
              <p className="mt-1 text-5xl font-extrabold tracking-tight">
                ${propData.rentZestimate.toLocaleString()}
                <span className="ml-2 text-xl font-normal text-brand-200">/mo</span>
              </p>
            </div>
            <p className="text-xs text-brand-200 sm:text-right sm:max-w-[180px]">Rental estimate powered by Zillow Rent Zestimate®</p>
          </div>
        )}

        {/* Map + info grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Map */}
          <div>
            {mapSrc ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm h-full">
                <iframe
                  src={mapSrc}
                  title="Property location"
                  className="h-72 w-full border-0 lg:h-full lg:min-h-[280px]"
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

          {/* Info cards */}
          <div className="flex flex-col gap-4">
            {/* Property Info */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-bold text-gray-900 uppercase tracking-wide">Property Info</h2>
              <dl className="space-y-2 text-sm">
                {street && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900 text-right">{street}</dd>
                  </div>
                )}
                {neighborhood && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Neighborhood</dt>
                    <dd className="font-medium text-gray-900 text-right">{neighborhood}</dd>
                  </div>
                )}
                {city && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">City</dt>
                    <dd className="font-medium text-gray-900">{city}</dd>
                  </div>
                )}
                {zip && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ZIP</dt>
                    <dd className="font-medium text-gray-900">{zip}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Property Details from ZLLW */}
            {propData && (propData.yearBuilt || propData.livingArea || propData.homeType || propData.zestimate) && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-bold text-gray-900 uppercase tracking-wide">Property Details</h2>
                <dl className="space-y-2 text-sm">
                  {propData.homeType && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Type</dt>
                      <dd className="font-medium text-gray-900 capitalize">{propData.homeType.replace(/_/g, ' ').toLowerCase()}</dd>
                    </div>
                  )}
                  {propData.yearBuilt && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Year built</dt>
                      <dd className="font-medium text-gray-900">{propData.yearBuilt}</dd>
                    </div>
                  )}
                  {propData.livingArea && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Living area</dt>
                      <dd className="font-medium text-gray-900">{propData.livingArea.toLocaleString()} sqft</dd>
                    </div>
                  )}
                  {propData.lotSize && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Lot size</dt>
                      <dd className="font-medium text-gray-900">{propData.lotSize.toLocaleString()} sqft</dd>
                    </div>
                  )}
                  {propData.zestimate && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Est. market value</dt>
                      <dd className="font-bold text-brand-700">${propData.zestimate.toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* E-Value + CTA row */}
        <div className="grid gap-6 sm:grid-cols-2 mb-6">
          {areaEValue && (areaEValue.medianRent || areaEValue.byBedrooms.length > 0) && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">E-Value™</h2>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{city}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Based on {areaEValue.comparablesCount} active {city} listings on EMLAKIE</p>
              {areaEValue.byBedrooms.length > 0 ? (
                <div className="space-y-2">
                  {areaEValue.byBedrooms.map((row) => (
                    <div key={row.bedrooms} className="flex items-center gap-3">
                      <span className="w-14 text-xs text-gray-500 shrink-0">{row.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, (row.median / (areaEValue.medianRent! * 1.5)) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-20 text-right">${row.median.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                    </div>
                  ))}
                </div>
              ) : areaEValue.medianRent ? (
                <p className="text-3xl font-extrabold text-brand-600">${areaEValue.medianRent.toLocaleString()}<span className="text-sm font-normal text-gray-400">/mo</span></p>
              ) : null}
            </div>
          )}

          {/* Own this property CTA */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-brand-800">Own this property?</h3>
              <p className="mt-1 text-sm text-brand-700">List it for free on EMLAKIE and reach thousands of renters directly — no commissions.</p>
            </div>
            <Link
              href={`/landlord?address=${encodeURIComponent(rawAddress)}`}
              className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition text-center"
            >
              List this property free →
            </Link>
          </div>
        </div>

        {/* Price history */}
        {propData && propData.priceHistory.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Sales &amp; Price History</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Event</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-right font-semibold">$/sqft</th>
                    <th className="hidden sm:table-cell px-4 py-3 text-left font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {propData.priceHistory.map((evt, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">{evt.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          evt.event === 'Sold' ? 'bg-green-100 text-green-700' :
                          evt.event === 'Listed for sale' ? 'bg-blue-100 text-blue-700' :
                          evt.event === 'Price change' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {evt.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {evt.price ? `$${evt.price.toLocaleString()}` : '—'}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-right text-gray-500">
                        {evt.pricePerSquareFoot ? `$${evt.pricePerSquareFoot}` : '—'}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-gray-400 text-xs">{evt.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

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
  );
}
