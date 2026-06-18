import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/lib/types';
import { formatBaths, formatBeds, formatPrice, formatPropertyType, formatSqft } from '@/lib/format';

export default function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos?.[0];

  return (
    <article className="group relative overflow-hidden rounded-xl bg-white shadow-card transition hover:shadow-card-hover">
      {/* Stretched link covers the whole card */}
      <Link href={`/rentals/${listing.slug ?? listing.id}`} className="absolute inset-0 z-10" aria-label={listing.title} />

      <div className="relative aspect-[4/3] bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg viewBox="0 0 32 32" className="h-12 w-12 fill-current opacity-40" aria-hidden="true">
              <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
            </svg>
          </div>
        )}
        {listing.isSample && (
          <span className="absolute left-3 top-3 rounded-md bg-gray-900/70 px-2 py-1 text-xs font-semibold text-white">
            Sample
          </span>
        )}
        {!listing.isSample && listing.listing_source === 'owner' && (
          <span className="absolute left-3 top-3 rounded-md bg-brand-600/90 px-2 py-1 text-xs font-semibold text-white">
            Owner Direct
          </span>
        )}
        {!listing.isSample && listing.listing_source === 'broker' && (
          <span className="absolute left-3 top-3 rounded-md bg-blue-600/90 px-2 py-1 text-xs font-semibold text-white">
            Broker Listed
          </span>
        )}
        {!listing.isSample && listing.listing_source === 'mls' && (
          <span className="absolute left-3 top-3 rounded-md bg-gray-600/90 px-2 py-1 text-xs font-semibold text-white">
            MLS
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-gray-700">
          {formatPropertyType(listing.property_type)}
        </span>
      </div>

      <div className="p-4">
        <p className="text-xl font-extrabold text-gray-900">{formatPrice(listing.price)}</p>
        <p className="mt-1 text-sm font-medium text-gray-700">
          {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)} · {formatSqft(listing.sqft)}
        </p>
        <p className="mt-1 truncate text-sm text-gray-500">
          {listing.address}, {listing.city}
          {listing.state ? `, ${listing.state}` : ''}
        </p>
        {listing.listing_source === 'broker' && listing.license_number && (
          <p className="mt-0.5 text-xs text-blue-600 font-medium">License # {listing.license_number}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {listing.zip && (
            <Link
              href={`/homes/${listing.zip}`}
              className="relative z-20 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-brand-50 hover:text-brand-700"
            >
              {listing.zip}
            </Link>
          )}
          {listing.dom != null && (
            <span className="text-xs text-gray-400">
              {listing.dom === 0 ? 'Listed today' : `${listing.dom} days on market`}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
