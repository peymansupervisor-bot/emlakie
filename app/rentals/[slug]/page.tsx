export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
import Gallery from '@/components/Gallery';
import MapEmbed from '@/components/MapEmbed';
import { getListing, getListings } from '@/lib/api';
import { formatBaths, formatBeds, formatPrice, formatPropertyType, formatSqft } from '@/lib/format';
import ListingCard from '@/components/ListingCard';
import EValue from '@/components/EValue';
import { calculateEValue } from '@/lib/e-value';
import ApplyForm from '@/components/ApplyForm';
import NearbyPlaces from '@/components/NearbyPlaces';
import NeighborhoodScores from '@/components/NeighborhoodScores';
import NearbySchools from '@/components/NearbySchools';
import { getPropertyData } from '@/lib/zllw';
import StreetViewExplorer from '@/components/StreetViewExplorer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: 'Listing not found' };
  const canonicalSlug = listing.slug ?? listing.id;
  const statusLabel = listing.status === 'rented' ? ' [Rented]' : listing.status === 'expired' ? ' [Expired]' : '';
  const shortDesc = listing.description
    ? listing.description.length > 155
      ? listing.description.slice(0, 155).replace(/\s+\S*$/, '') + '…'
      : listing.description
    : undefined;
  return {
    title: `${listing.title}${statusLabel} — ${formatPrice(listing.price)}`,
    description: shortDesc,
    alternates: { canonical: `https://emlakie.com/rentals/${canonicalSlug}` },
    openGraph: {
      title: `${listing.title} — ${formatPrice(listing.price)}`,
      description: shortDesc ?? '',
      type: 'website',
      images: listing.photos?.[0]
        ? [{ url: listing.photos[0], width: 1200, height: 630, alt: listing.title }]
        : [{ url: '/logo.png', width: 512, height: 512, alt: 'EMLAKIE' }],
    },
    twitter: {
      card: 'summary_large_image',
      images: listing.photos?.[0] ? [listing.photos[0]] : ['/logo.png'],
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  // If accessed via UUID and listing has a slug, redirect permanently
  if (UUID_RE.test(slug) && listing.slug) {
    redirect(`/rentals/${listing.slug}`);
  }

  const isRented = listing.status === 'rented';
  const isExpired = listing.status === 'expired';
  const isUnavailable = isRented || isExpired;

  const fullAddress = [listing.address, listing.city, listing.state, listing.zip].filter(Boolean).join(', ');
  const [eValue, { listings: similar }, propData] = await Promise.all([
    calculateEValue({
      id: listing.id,
      city: listing.city,
      state: listing.state,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      sqft: listing.sqft,
      property_type: listing.property_type,
      ownership_type: listing.ownership_type,
      price: listing.price,
    }),
    getListings({ city: listing.city }),
    getPropertyData(fullAddress),
  ]);
  const similarActive = similar.filter((l) => l.id !== listing.id && l.status === 'active').slice(0, 3);

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description ?? '',
    url: `https://emlakie.com/rentals/${listing.slug ?? listing.id}`,
    image: listing.photos?.[0] ?? 'https://emlakie.com/logo.png',
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'USD',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: listing.price, priceCurrency: 'USD', unitCode: 'MON' },
      availability: listing.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address ?? '',
      addressLocality: listing.city ?? '',
      addressRegion: listing.state ?? '',
      postalCode: listing.zip ?? '',
      addressCountry: 'US',
    },
    numberOfRooms: listing.bedrooms,
    floorSize: listing.sqft ? { '@type': 'QuantitativeValue', value: listing.sqft, unitCode: 'FTK' } : undefined,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }} />
      <Link href="/rentals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to search
      </Link>

      {/* Status banner for unavailable listings */}
      {isUnavailable && (
        <div className={`mt-4 rounded-xl px-5 py-4 ${isRented ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
          <p className={`font-bold text-lg ${isRented ? 'text-blue-800' : 'text-amber-800'}`}>
            {isRented ? '🔑 This property has been rented' : '⏰ This listing has expired'}
          </p>
          <p className={`mt-1 text-sm ${isRented ? 'text-blue-700' : 'text-amber-700'}`}>
            {isRented
              ? 'This rental is no longer available. Browse active listings below or search for similar homes in the area.'
              : 'This listing is no longer active. The landlord may relist it — browse similar active listings below.'}
          </p>
        </div>
      )}

      <div className="mt-4">
        <Gallery photos={listing.photos ?? []} title={listing.title} />
      </div>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        {/* Main column */}
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900 leading-snug">{listing.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-3xl font-extrabold text-brand-700">{formatPrice(listing.price)}</span>
            {isRented && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">Rented</span>
            )}
            {isExpired && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">No Longer Available</span>
            )}
            {listing.isSample && (
              <span className="rounded-md bg-gray-900/80 px-2 py-1 text-xs font-semibold text-white">Sample listing</span>
            )}
          </div>

          <p className="mt-2 text-lg font-semibold text-gray-800">
            {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)} ·{' '}
            {formatSqft(listing.sqft)} · {formatPropertyType(listing.property_type)}
          </p>
          <p className="mt-1 text-gray-600">
            {listing.address}, {listing.city}
            {listing.state ? `, ${listing.state}` : ''} {listing.zip ?? ''}
          </p>

          {listing.description && (
            <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-900">Home highlights</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-gray-600">
                {listing.description.replace(/\s*Copyright\s+The\s+MLS\.?.*$/i, '').trim()}
              </p>
            </div>
          )}

          {listing.amenities?.length > 0 && (
            <>
              <h2 className="mt-8 text-xl font-bold text-gray-900">Amenities</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {listing.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-gray-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-brand-600" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    {amenity}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Virtual tour embed */}
          {listing.virtual_tour_url && (() => {
            const url = listing.virtual_tour_url!;
            const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/);
            const mpMatch = url.includes('matterport.com');
            if (ytMatch) {
              return (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Virtual Tour</h2>
                  <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingBottom: '56.25%' }}>
                    <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                      title="Virtual tour video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                </div>
              );
            }
            if (mpMatch) {
              return (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">3D Virtual Tour</h2>
                  <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingBottom: '56.25%' }}>
                    <iframe className="absolute inset-0 h-full w-full" src={url} title="3D virtual tour" allowFullScreen />
                  </div>
                </div>
              );
            }
            return (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Virtual Tour</h2>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-brand-600 px-5 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition">
                  🎥 View Virtual Tour
                </a>
              </div>
            );
          })()}


          {/* Map — use address query so the pin is always accurate */}
          {listing.address && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Location</h2>
              <MapEmbed
                src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
              />
            </div>
          )}

{/* Street View Explorer */}
          {listing.address && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <StreetViewExplorer
              address={fullAddress}
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              lat={listing.lat}
              lng={listing.lng}
            />
          )}

{/* Nearby places */}
          {listing.lat && listing.lng && (
            <NearbyPlaces lat={listing.lat} lng={listing.lng} />
          )}

          {/* Neighborhood mobility scores */}
          {listing.lat && listing.lng && (
            <NeighborhoodScores lat={listing.lat} lng={listing.lng} />
          )}

          {/* Nearby schools */}
          {listing.lat && listing.lng && (
            <NearbySchools lat={listing.lat} lng={listing.lng} />
          )}

          {/* E-Value */}
          {eValue && <EValue ev={eValue} />}
        </div>

        {/* Contact / status card */}
        <aside className="lg:w-80">
          <div className="sticky top-24 rounded-2xl border border-gray-200 p-6 shadow-card">
            {isUnavailable ? (
              <>
                <h2 className="text-lg font-bold text-gray-900">Looking for something similar?</h2>
                <p className="mt-2 text-sm text-gray-600">
                  This home is no longer available, but we have other rentals in {listing.city} you might love.
                </p>
                <Link
                  href={`/rentals?city=${encodeURIComponent(listing.city)}`}
                  className="mt-5 block rounded-xl bg-brand-600 py-3 text-center font-semibold text-white transition hover:bg-brand-700"
                >
                  Search in {listing.city}
                </Link>
                <Link
                  href="/rentals"
                  className="mt-3 block text-center text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Browse all rentals
                </Link>
              </>
            ) : (
              <ApplyForm listingId={listing.id} listingPrice={listing.price} />
            )}
          </div>
        </aside>
      </div>

      {/* Sales & Price History */}
      {propData && propData.priceHistory.length > 0 && (
        <section className="mt-12">
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
                    <td className="hidden sm:table-cell px-4 py-3 text-gray-500 text-xs">{evt.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Similar active listings — shown on rented/expired pages for SEO + conversion */}
      {isUnavailable && similarActive.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Similar homes available in {listing.city}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarActive.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={`/rentals?city=${encodeURIComponent(listing.city)}`}
              className="rounded-xl border-2 border-brand-600 px-6 py-3 font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              See all rentals in {listing.city}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
