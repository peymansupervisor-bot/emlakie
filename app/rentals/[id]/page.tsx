import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { getListing, getListings } from '@/lib/api';
import { formatBaths, formatBeds, formatPrice, formatPropertyType, formatSqft } from '@/lib/format';
import ListingCard from '@/components/ListingCard';
import EValue from '@/components/EValue';
import { calculateEValue } from '@/lib/e-value';
import ApplyForm from '@/components/ApplyForm';
import NearbyPlaces from '@/components/NearbyPlaces';
import StreetView from '@/components/StreetView';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: 'Listing not found' };
  const statusLabel = listing.status === 'rented' ? ' [Rented]' : listing.status === 'expired' ? ' [Expired]' : '';
  const shortDesc = listing.description
    ? listing.description.length > 155
      ? listing.description.slice(0, 155).replace(/\s+\S*$/, '') + '…'
      : listing.description
    : undefined;
  return {
    title: `${listing.title}${statusLabel} — ${formatPrice(listing.price)}/mo`,
    description: shortDesc,
    alternates: { canonical: `https://emlakie.com/rentals/${id}` },
    openGraph: {
      title: `${listing.title} — ${formatPrice(listing.price)}/mo`,
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
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const isRented = listing.status === 'rented';
  const isExpired = listing.status === 'expired';
  const isUnavailable = isRented || isExpired;

  // E-Value + similar listings — only for inactive listings
  const [eValue, { listings: similar }] = await Promise.all([
    isUnavailable
      ? calculateEValue({
          id: listing.id,
          city: listing.city,
          state: listing.state,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          sqft: listing.sqft,
          property_type: listing.property_type,
          ownership_type: listing.ownership_type,
          price: listing.price,
        })
      : Promise.resolve(null),
    getListings({ city: listing.city }),
  ]);
  const similarActive = similar.filter((l) => l.id !== listing.id && l.status === 'active').slice(0, 3);

  const listingSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description ?? '',
    url: `https://emlakie.com/rentals/${listing.id}`,
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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900">{formatPrice(listing.price)}<span className="text-base font-medium text-gray-500">/mo</span></h1>
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

          <h2 className="mt-8 text-xl font-bold text-gray-900">{listing.title}</h2>
          {listing.description && (
            <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">
              {listing.description}
            </p>
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

          {/* Street View — only when we have coordinates */}
          {listing.lat && listing.lng && (
            <StreetView
              lat={listing.lat}
              lng={listing.lng}
              address={listing.address}
              city={listing.city}
              state={listing.state}
            />
          )}

          {/* Nearby places */}
          {listing.lat && listing.lng && (
            <NearbyPlaces lat={listing.lat} lng={listing.lng} />
          )}

          {/* E-Value — only shown on inactive listings */}
          {isUnavailable && eValue && <EValue ev={eValue} />}
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
