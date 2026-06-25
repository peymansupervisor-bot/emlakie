import Link from 'next/link';
import { Listing } from '@/lib/types';
import { formatBaths, formatBeds, formatPrice, formatPropertyType, formatSqft } from '@/lib/format';

export default function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  const photo = listing.photos?.[0];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-gray-200 hover:shadow-card-hover">
      {/* Stretched link covers the whole card */}
      <Link href={`/rentals/${listing.slug ?? listing.id}`} className="absolute inset-0 z-10" aria-label={listing.title} />

      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {photo ? (
          <img
            src={photo}
            alt={`${formatPrice(listing.price)} — ${formatBeds(listing.bedrooms)}, ${formatBaths(listing.bathrooms)} ${formatPropertyType(listing.property_type)} at ${listing.address}, ${listing.city}`}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50">
            <svg viewBox="0 0 32 32" className="h-10 w-10 fill-gray-300" aria-hidden="true">
              <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
            </svg>
          </div>
        )}

        {/* Badges — top-left */}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {listing.isSample && (
            <span className="rounded-full bg-gray-900/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Sample
            </span>
          )}
          {!listing.isSample && listing.listing_source === 'owner' && (
            <span className="rounded-full bg-brand-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              By Owner
            </span>
          )}
          {!listing.isSample && listing.listing_source === 'broker' && (
            <span className="rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Broker
            </span>
          )}
          {!listing.isSample && listing.dom != null && listing.dom <= 6 && (
            <span className="rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-bold text-white">
              New
            </span>
          )}
        </div>

        {/* Property type — top-right */}
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {formatPropertyType(listing.property_type)}
        </span>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xl font-extrabold leading-tight text-gray-900">{formatPrice(listing.price)}<span className="ml-0.5 text-sm font-medium text-gray-400">/mo</span></p>
          {listing.dom === 0 && (
            <span className="mt-0.5 shrink-0 text-[11px] font-semibold text-brand-600">Listed today</span>
          )}
        </div>

        <p className="mt-1 text-sm font-medium text-gray-700">
          {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)}{listing.sqft ? ` · ${formatSqft(listing.sqft)}` : ''}
        </p>

        <p className="mt-1 truncate text-sm text-gray-500">
          {listing.address}, {listing.city}{listing.state ? `, ${listing.state}` : ''}
        </p>

        {listing.listing_source === 'broker' && listing.license_number && (
          <p className="mt-1 text-xs text-blue-600">Lic. #{listing.license_number}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {listing.zip && (
            <Link
              href={`/homes/${listing.zip}`}
              className="relative z-20 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:bg-brand-50 hover:text-brand-700"
            >
              {listing.zip}
            </Link>
          )}
          {listing.dom != null && listing.dom > 0 && (
            <span className="text-xs text-gray-400">{listing.dom}d on market</span>
          )}
        </div>
      </div>
    </article>
  );
}
