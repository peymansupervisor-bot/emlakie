'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, formatBeds, formatBaths } from '@/lib/format';
import type { ListingRecommendation } from '@/types/assistant';

interface AssistantListingCardProps {
  listing: ListingRecommendation;
  rank: number;
}

/** Max amenity chips shown per card. */
const MAX_CHIPS = 2;

export default function AssistantListingCard({ listing, rank }: AssistantListingCardProps) {
  const href = listing.slug ? `/rentals/${listing.slug}` : null;
  const photo = listing.photos?.[0] ?? null;
  const chips = (listing.amenities ?? []).slice(0, MAX_CHIPS);

  const cardContent = (
    <div
      className={[
        'flex-shrink-0 w-[220px] rounded-xl border border-gray-100 bg-white',
        'shadow-sm overflow-hidden flex flex-col',
        href ? 'hover:border-brand-300 hover:shadow-md transition-all' : '',
      ].join(' ')}
      aria-label={`Listing ${rank}: ${listing.title}`}
    >
      {/* Photo */}
      <div className="relative h-[90px] w-full bg-gray-100 flex-shrink-0">
        {photo ? (
          <Image
            src={photo}
            alt={listing.address}
            fill
            sizes="220px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              viewBox="0 0 40 40"
              className="h-8 w-8 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <rect x="4" y="16" width="32" height="20" rx="2" />
              <path d="M4 22 L20 10 L36 22" />
              <rect x="15" y="26" width="10" height="10" rx="1" />
            </svg>
          </div>
        )}
        {/* Rank badge */}
        <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
          {rank}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        {/* Price */}
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {formatPrice(listing.price)}
        </p>

        {/* Beds / baths */}
        <p className="text-[11px] text-gray-500 leading-tight">
          {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)}
        </p>

        {/* Address */}
        <p className="text-[11px] text-gray-600 leading-tight truncate">
          {listing.address}
        </p>

        {/* Amenity chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {chips.map((a) => (
              <span
                key={a}
                className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700 font-medium"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl"
        aria-label={`View listing: ${listing.title}`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
