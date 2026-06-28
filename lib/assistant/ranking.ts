/**
 * Deterministic listing ranker for the AI assistant's search_listings function.
 *
 * Scores each listing against the user's requested filters and returns the
 * top-N results sorted by score. Ties are broken by recency (refreshed_at).
 *
 * Score breakdown (100 points max):
 *   City exact match (case-insensitive):   30
 *   ZIP exact match:                       25
 *   Bedroom exact match:                   20
 *   Price within requested range:          15
 *   Property type exact match:             10
 *   Amenity match: 5 per amenity, cap 20
 *
 * Extension point: the `learnedBoost` parameter on scoreOne() is reserved for
 * future ML signal injection (e.g., CTR, conversion rate, user preference
 * vectors). Pass 0 today. The function signature is intentionally stable so
 * adding learned signals later requires no refactoring of call sites.
 */

import type { Listing, ListingFilters } from '../types';

export interface RankedListing extends Listing {
  /** Composite relevance score. Higher is better. */
  _score: number;
}

function scoreOne(listing: Listing, filters: ListingFilters, learnedBoost = 0): number {
  let score = 0;

  if (filters.city && listing.city.toLowerCase() === filters.city.toLowerCase()) {
    score += 30;
  }

  if (filters.zip && listing.zip === filters.zip) {
    score += 25;
  }

  if (filters.bedrooms !== undefined && filters.bedrooms !== '') {
    if (listing.bedrooms === Number(filters.bedrooms)) score += 20;
  }

  const min = filters.minPrice ? Number(filters.minPrice) : null;
  const max = filters.maxPrice ? Number(filters.maxPrice) : null;
  const priceFilterActive = min !== null || max !== null;
  if (priceFilterActive) {
    const withinMin = min === null || listing.price >= min;
    const withinMax = max === null || listing.price <= max;
    if (withinMin && withinMax) score += 15;
  }

  if (filters.propertyType && listing.property_type === filters.propertyType) {
    score += 10;
  }

  if (filters.amenities) {
    const requested = filters.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    const matched = requested.filter((a) => listing.amenities?.includes(a));
    score += Math.min(matched.length * 5, 20);
  }

  return score + learnedBoost;
}

/**
 * Rank listings deterministically against the search filters.
 * Returns up to `limit` listings, sorted by score descending then by recency.
 */
export function rankListings(
  listings: Listing[],
  filters: ListingFilters,
  limit: number,
): RankedListing[] {
  return listings
    .map((l) => ({ ...l, _score: scoreOne(l, filters) }))
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      const aTime = a.refreshed_at ? new Date(a.refreshed_at).getTime() : 0;
      const bTime = b.refreshed_at ? new Date(b.refreshed_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}
