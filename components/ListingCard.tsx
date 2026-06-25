'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Listing } from '@/lib/types';
import { formatBaths, formatBeds, formatPrice, formatPropertyType, formatSqft } from '@/lib/format';

// ── Decision-quality insight derived from listing data ───────────────────────
// Priority order: highest decision value first.
// When a stored ai_summary exists on the listing, use that instead (future).
function deriveInsight(listing: Listing): string | null {
  const a = listing.amenities ?? [];
  const has = (x: string) => a.includes(x);
  const sqft = listing.sqft ?? 0;

  if (listing.dom === 0) return 'Just listed — be among the first to reach out.';
  if (has('Pet-friendly') && has('Pool')) return 'Resort-style living with no pet restrictions.';
  if (has('EV charging')) return 'EV charging included — still rare at this price.';
  if (has('Furnished')) return 'Fully furnished — move in with just your bags.';
  if (has('In-unit laundry') && sqft >= 1000) return 'Spacious layout with in-unit washer/dryer.';
  if (listing.listing_source === 'owner') return 'No agent — contact the owner directly.';
  if (has('Pet-friendly')) return 'Pets welcome — no extra pet fees listed.';
  if (has('Pool') && has('Gym')) return 'Full resort amenities included in rent.';
  if (has('Garage')) return 'Private garage — uncommon at this price point.';
  if (has('Balcony') && listing.bedrooms >= 2) return 'Private outdoor space with a multi-bedroom layout.';
  if (listing.virtual_tour_url) return 'Virtual tour available — explore before you visit.';
  if (sqft >= 1500) return 'Above-average square footage for this price.';
  const t = listing.property_type;
  if (t === 'house') return 'Private home — no shared walls, full outdoor space.';
  if (t === 'townhouse') return 'Multi-level living with more privacy than an apartment.';
  if (t === 'studio') return 'Efficient layout — ideal for solo living or remote work.';
  if (t === 'condo') return 'Condo-quality finishes at rental flexibility.';
  return null;
}

// ── Surface the 2–3 most decision-relevant amenities ─────────────────────────
const AMENITY_PRIORITY = [
  'Pet-friendly', 'In-unit laundry', 'EV charging', 'Furnished',
  'Pool', 'Gym', 'Garage', 'Parking', 'Balcony', 'Storage',
];
function smartBadges(amenities: string[], max = 3): string[] {
  return AMENITY_PRIORITY.filter((a) => amenities.includes(a)).slice(0, max);
}

// ── Friendly availability label ───────────────────────────────────────────────
function availLabel(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (d <= now) return 'Available now';
  const diff = Math.round((d.getTime() - now.getTime()) / 86_400_000);
  if (diff <= 7) return `Available in ${diff}d`;
  return `Avail. ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

// ── Save button (localStorage, no backend needed) ─────────────────────────────
function SaveButton({ id, href }: { id: string; href: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const list: string[] = JSON.parse(localStorage.getItem('emlakie_saved') ?? '[]');
      setSaved(list.includes(id));
    } catch {}
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => {
      const next = !s;
      try {
        const list: string[] = JSON.parse(localStorage.getItem('emlakie_saved') ?? '[]');
        const updated = next ? [...list, id] : list.filter((x) => x !== id);
        localStorage.setItem('emlakie_saved', JSON.stringify(updated));
      } catch {}
      return next;
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove from saved' : 'Save listing'}
      aria-pressed={saved}
      className="relative z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:scale-110 hover:bg-white"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 transition-colors ${saved ? 'fill-red-500 stroke-red-500' : 'fill-transparent stroke-gray-700'}`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

// ── Smart Card ────────────────────────────────────────────────────────────────
export default function ListingCard({
  listing,
  priority = false,
}: {
  listing: Listing;
  priority?: boolean;
}) {
  const photo = listing.photos?.[0];
  const href = `/rentals/${listing.slug ?? listing.id}`;
  const insight = deriveInsight(listing);
  const badges = smartBadges(listing.amenities ?? []);
  const avail = availLabel(listing.availableFrom);
  const isNew = listing.dom != null && listing.dom <= 1;
  const domText =
    listing.dom != null && listing.dom > 1 && listing.dom <= 30
      ? `${listing.dom}d ago`
      : null;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.09),0_12px_32px_rgba(0,0,0,0.09)] hover:-translate-y-0.5">
      {/* Stretched link — covers card, z-10 */}
      <Link href={href} className="absolute inset-0 z-10" aria-label={listing.title} />

      {/* ── Photo ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {photo ? (
          <img
            src={photo}
            alt={`${listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}BR`} ${formatPropertyType(listing.property_type)} in ${listing.city}`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50">
            <svg viewBox="0 0 32 32" className="h-10 w-10 fill-gray-200" aria-hidden="true">
              <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
            </svg>
          </div>
        )}

        {/* Top-left: source badge */}
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5">
          {listing.isSample && (
            <span className="rounded-full bg-gray-800/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Sample
            </span>
          )}
          {!listing.isSample && listing.listing_source === 'owner' && (
            <span className="rounded-full bg-brand-600/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              By Owner
            </span>
          )}
          {!listing.isSample && listing.listing_source === 'broker' && (
            <span className="rounded-full bg-blue-600/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Broker
            </span>
          )}
        </div>

        {/* Top-right: Save button */}
        <div className="absolute right-3 top-3 z-20">
          <SaveButton id={listing.id} href={href} />
        </div>

        {/* Bottom-left: New badge + DOM */}
        {(isNew || domText) && (
          <div className="absolute bottom-3 left-3 z-20">
            {isNew ? (
              <span className="rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                New today
              </span>
            ) : (
              <span className="rounded-full bg-gray-800/60 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                {domText}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-0 p-4">

        {/* Price row */}
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-extrabold leading-tight tracking-tight text-gray-900">
            {formatPrice(listing.price).replace('/mo', '')}
            <span className="ml-0.5 text-sm font-medium text-gray-400">/mo</span>
          </p>
          <span className="shrink-0 text-[11px] font-medium text-gray-400">
            {formatPropertyType(listing.property_type)}
          </span>
        </div>

        {/* AI insight */}
        {insight && (
          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-gray-500">
            <span className="mt-px shrink-0 text-violet-500" aria-hidden="true">✦</span>
            <span>{insight}</span>
          </p>
        )}

        {/* Highlights: beds · baths · sqft */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-sm font-semibold text-gray-800">
            {formatBeds(listing.bedrooms)}
          </span>
          <span className="text-gray-200" aria-hidden="true">·</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatBaths(listing.bathrooms)}
          </span>
          {listing.sqft > 0 && (
            <>
              <span className="text-gray-200" aria-hidden="true">·</span>
              <span className="text-sm text-gray-500">{formatSqft(listing.sqft)}</span>
            </>
          )}
          {avail && (
            <>
              <span className="text-gray-200" aria-hidden="true">·</span>
              <span className="text-[12px] font-semibold text-brand-600">{avail}</span>
            </>
          )}
        </div>

        {/* Location */}
        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-gray-400">
          <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0 fill-gray-300" aria-hidden="true">
            <path fillRule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2 6a6 6 0 1 1 10.174 4.31l3.258 3.259a.75.75 0 0 1-1.06 1.06L10.96 11.37A6 6 0 0 1 2 6Z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{listing.city}{listing.state ? `, ${listing.state}` : ''}</span>
        </p>

        {/* Smart amenity badges */}
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-500"
              >
                {badge}
              </span>
            ))}
            {listing.virtual_tour_url && (
              <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-600">
                Virtual tour
              </span>
            )}
          </div>
        )}

      </div>
    </article>
  );
}
