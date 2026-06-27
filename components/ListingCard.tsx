'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Listing } from '@/lib/types';
import { formatBaths, formatBeds, formatPrice, formatPropertyType, formatSqft } from '@/lib/format';
import ListingInsight from '@/components/ui/ListingInsight';

// ── Insight: the single most compelling reason to click this listing ──────────
//
// Rules:
//   1. Never repeat what is already visible elsewhere on the card (badges, DOM
//      badge, property type label). Add context or explain significance instead.
//   2. Combination signals outrank individual amenities — the story of two things
//      together is harder to communicate with badges alone.
//   3. dom === 0 is already shown as "New today" badge — do not repeat it here.
//   4. listing_source === 'owner' is already shown as "By Owner" badge. Only use
//      it as the insight when nothing more compelling exists, and suppress the
//      badge in that case (suppressOwnerBadge: true) to avoid saying it twice.
//   5. Return null rather than show a weak or generic insight. Users should learn
//      to trust that whenever this section appears, it contains something useful.
//
// Future: return listing.ai_summary when the field is populated server-side.

type InsightResult = { text: string } | null;

function deriveInsight(listing: Listing): InsightResult {
  const a = listing.amenities ?? [];
  const has = (x: string) => a.includes(x);
  const sqft = listing.sqft ?? 0;
  const beds = listing.bedrooms;

  // ── 1. Lifestyle combinations ─────────────────────────────────────────────
  // These tell a story the individual badges cannot — the rarity of the
  // combination is the point, not the features in isolation.

  if (has('Pet-friendly') && has('Pool'))
    return { text: 'Pets allowed with a pool on site — that combination eliminates most of the search.' };

  if (has('Furnished') && has('In-unit laundry'))
    return { text: 'Fully furnished with in-unit laundry — nothing to buy or arrange before move-in.' };

  if (has('Pool') && has('Gym'))
    return { text: 'Pool and gym both included — saves the cost and hassle of a separate membership.' };

  if (has('Balcony') && beds >= 2)
    return { text: `${beds}-bedroom layout with private outdoor space — room to spread out inside and outside.` };

  // ── 2. Rare amenities worth explaining ───────────────────────────────────
  // Badge shows the label. Insight explains why it matters.

  if (has('EV charging'))
    return { text: 'EV charging included — still uncommon enough in rentals that it meaningfully narrows your options.' };

  if (has('Furnished'))
    return { text: 'Fully furnished — move in without buying or moving a single piece of furniture.' };

  // ── 3. Size context (only when genuinely notable) ─────────────────────────
  // Only fire when sqft is significantly above average for the bedroom count.
  // Without market data, use conservative thresholds.

  if (sqft >= 1400 && beds >= 2)
    return { text: `${sqft.toLocaleString()} sq ft across ${beds} bedrooms — more space than most listings at this price.` };

  if (listing.property_type === 'studio' && sqft >= 650)
    return { text: `${sqft.toLocaleString()} sq ft — unusually spacious for a studio.` };

  // ── 4. In-unit laundry (explains significance, not just the feature) ──────

  if (has('In-unit laundry'))
    return { text: 'In-unit washer and dryer — no shared laundry room, no scheduling around neighbors.' };

  // ── 5. Private garage ────────────────────────────────────────────────────

  if (has('Garage'))
    return { text: 'Private garage included — covered parking is harder to find than most people expect.' };

  // ── 6. Virtual tour ──────────────────────────────────────────────────────

  if (listing.virtual_tour_url)
    return { text: 'Virtual tour available — do a full walkthrough before scheduling an in-person visit.' };

  // ── 7. Pet-friendly alone ─────────────────────────────────────────────────
  // Badge shows the label. Insight adds market context.

  if (has('Pet-friendly'))
    return { text: 'Pet-friendly — a genuinely useful filter since most rentals in any city don\'t allow them.' };

  // ── 8. Owner-listed (only if nothing more compelling exists) ──────────────
  // Suppress the photo badge so the same idea isn't said twice on the card.

  if (listing.listing_source === 'owner')
    return { text: 'Owner-listed — no agent in the middle, so questions get answered directly and faster.' };

  // Return null — better to omit than to show something generic.
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
  const insightResult = deriveInsight(listing);
  const insight = insightResult?.text ?? null;
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
      <Link
        href={href}
        className="absolute inset-0 z-10"
        aria-label={`${isNew ? 'New today — ' : ''}View ${listing.title} — ${formatPrice(listing.price)}/mo in ${listing.city}${listing.state ? `, ${listing.state}` : ''}`}
      />

      {/* ── Photo ──────────────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={`${listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}BR`} ${formatPropertyType(listing.property_type)} in ${listing.city}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-50">
            <svg viewBox="0 0 32 32" className="h-10 w-10 fill-gray-200" aria-hidden="true">
              <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
            </svg>
          </div>
        )}

        {/* Top-left: source badge */}
        {(listing.isSample || (!listing.isSample && listing.listing_source === 'broker')) && (
          <div className="absolute left-3 top-3 z-20">
            {listing.isSample ? (
              <span className="rounded-full bg-gray-800/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                Sample
              </span>
            ) : (
              <span className="rounded-full bg-blue-600/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                Listed by a Broker
              </span>
            )}
          </div>
        )}

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
            <span className="ml-0.5 text-sm font-medium text-gray-500">/mo</span>
          </p>
          <span className="shrink-0 text-[11px] font-medium text-gray-500">
            {formatPropertyType(listing.property_type)}
          </span>
        </div>

        {/* Why you'll like it */}
        {insight && <ListingInsight text={insight} className="mt-3" />}

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
        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-gray-500">
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
