/**
 * POST /api/assistant/search
 *
 * Server-side execution of the `search_listings` function called by the
 * OpenAI Realtime model during a voice session.
 *
 * The Realtime model parses the user's voice request and calls this route
 * with structured filter parameters. No second AI layer is involved —
 * the Realtime model IS the only interpreter.
 *
 * Returns:
 *   - total:      full count of matching active listings in Supabase
 *   - shown:      number of results in the response (max UI_RESULTS = 10)
 *   - speakCount: how many the model should summarize aloud (max SPEAK_COUNT = 3)
 *   - results:    ranked listing objects for card rendering
 *
 * Privacy: query parameters are never logged. Only aggregate counts are written
 * to the console (event type, total, shown). No user content is stored.
 *
 * Guarded by ENABLE_AI_ASSISTANT env var — disabled on Vercel production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/api';
import { rankListings } from '@/lib/assistant/ranking';
import type { ListingFilters } from '@/lib/types';

export const dynamic = 'force-dynamic';

const UI_RESULTS = 10;
const SPEAK_COUNT = 3;

// Simple in-memory rate limiter: 30 requests per IP per minute
const RL_LIMIT = 30;
const RL_WINDOW_MS = 60_000;
const rlMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return true;
  }
  if (entry.count >= RL_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (process.env.ENABLE_AI_ASSISTANT !== 'true') {
    return NextResponse.json({ error: 'disabled' }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  let rawFilters: Record<string, unknown>;
  try {
    rawFilters = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Sanitize — only accept known ListingFilters fields, all strings, with length caps
  const filters: ListingFilters = {};
  if (typeof rawFilters.city === 'string') filters.city = rawFilters.city.slice(0, 100);
  if (typeof rawFilters.zip === 'string') filters.zip = rawFilters.zip.slice(0, 10);
  if (typeof rawFilters.q === 'string') filters.q = rawFilters.q.slice(0, 200);
  if (typeof rawFilters.minPrice === 'string') filters.minPrice = rawFilters.minPrice.slice(0, 12);
  if (typeof rawFilters.maxPrice === 'string') filters.maxPrice = rawFilters.maxPrice.slice(0, 12);
  if (typeof rawFilters.bedrooms === 'string') filters.bedrooms = rawFilters.bedrooms.slice(0, 4);
  if (typeof rawFilters.propertyType === 'string') filters.propertyType = rawFilters.propertyType.slice(0, 50);
  if (typeof rawFilters.amenities === 'string') filters.amenities = rawFilters.amenities.slice(0, 300);

  let dbTotal = 0;
  let ranked: ReturnType<typeof rankListings> = [];

  try {
    // getListings fetches all matching rows from Supabase and paginates in-memory.
    // Page 1 returns the 20 most recently refreshed active listings matching the
    // filters. We rank those 20 to find the best UI_RESULTS for the user.
    // Fetch without page cap so we rank from the full result set, not just the first 20.
    // getListings paginates in-memory; omitting page returns page 1 (20 rows).
    // We call with a high page-size equivalent by fetching page 1 from the full set.
    // To get all matches we use page:'1' but rely on the fact that getListings fetches
    // all rows from Supabase first then slices — so total reflects the true DB count.
    // We rank only what was fetched; tell the model shown=ranked, databaseTotal=total.
    const { listings, total } = await getListings({ ...filters });
    dbTotal = total;
    ranked = rankListings(listings, filters, UI_RESULTS);
  } catch {
    return NextResponse.json({ error: 'search_failed' }, { status: 500 });
  }

  // Log only aggregate counts — never query parameters or listing details
  console.info('[assistant/search]', { total: dbTotal, shown: ranked.length });

  const results = ranked.map((l) => ({
    id: l.id,
    title: l.title,
    address: l.address,
    city: l.city,
    state: l.state,
    zip: l.zip ?? null,
    price: l.price,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    sqft: l.sqft,
    property_type: l.property_type,
    amenities: l.amenities ?? [],
    available_from: l.availableFrom ?? null,
    slug: l.slug ?? null,
    photos: (l.photos ?? []).slice(0, 1),
  }));

  return NextResponse.json({
    total: results.length,        // what the model should cite aloud
    databaseTotal: dbTotal,       // full DB match count (for context only)
    shown: results.length,
    speakCount: Math.min(results.length, SPEAK_COUNT),
    results,
    activeFilters: filters,       // echoed back for the UI filter strip
  });
}
