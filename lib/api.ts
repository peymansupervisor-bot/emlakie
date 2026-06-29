import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore } from 'next/cache';
import { Listing, ListingFilters, ListingsResponse, ZipLocation } from './types';
import { sampleListings } from './sample-data';
import { US_STATES, stateByAbbr } from './states';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.emlakie.com/api';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) } }
  );
}


function rowToListing(row: Record<string, unknown>): Listing {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    address: row.address as string,
    city: row.city as string,
    state: row.state as string,
    zip: row.zip as string | undefined,
    lat: row.lat != null ? Number(row.lat) : undefined,
    lng: row.lng != null ? Number(row.lng) : undefined,
    price: Number(row.monthly_rent ?? row.price),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    sqft: Number(row.living_area_sqft ?? row.sqft),
    property_type: row.property_type as Listing['property_type'],
    amenities: (row.amenities as string[]) ?? [],
    photos: (row.photos as string[]) ?? [],
    status: row.status as string,
    availableFrom: row.available_date as string | undefined,
    view_count: Number(row.view_count ?? 0),
    listing_source: (row.listing_source as Listing['listing_source']) ?? 'owner',
    license_number: row.license_number as string | null | undefined,
    agent_name: row.agent_name as string | null | undefined,
    office_name: row.office_name as string | null | undefined,
    virtual_tour_url: row.virtual_tour_url as string | null | undefined,
    slug: row.slug as string | null | undefined,
    user_id: (row.landlord_id ?? row.user_id) as string | null | undefined,
    landlord_id: row.landlord_id as string | null | undefined,
    virtual_phone: (row.profiles as { virtual_phone?: string; phone?: string } | null)?.virtual_phone
      || (row.profiles as { virtual_phone?: string; phone?: string } | null)?.phone
      || null,
    refreshed_at: (row.refreshed_at ?? row.updated_at ?? row.created_at) as string | null | undefined,
    boosted_until: row.boosted_until as string | null | undefined,
  };
}

const isZip = (v: string) => /^\d{5}$/.test(v.trim());

function matchesQ(l: Listing, q: string): boolean {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  if (isZip(term)) return l.zip === term;
  const haystack = [l.address, l.city, l.state, l.zip ?? ''].join(' ').toLowerCase();
  return haystack.includes(term);
}

function filterSamples(filters: ListingFilters): Listing[] {
  return sampleListings.filter((l) => {
    if (filters.q && !matchesQ(l, filters.q)) return false;
    if (filters.zip && l.zip !== filters.zip) return false;
    if (filters.city) {
      if (isZip(filters.city)) { if (l.zip !== filters.city.trim()) return false; }
      else if (!l.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    }
    if (filters.minPrice && l.price < +filters.minPrice) return false;
    if (filters.maxPrice && l.price > +filters.maxPrice) return false;
    if (filters.bedrooms && l.bedrooms !== +filters.bedrooms) return false;
    if (filters.propertyType && l.property_type !== filters.propertyType) return false;
    if (filters.amenities) {
      const needed = filters.amenities.split(',').map((a) => a.trim());
      if (!needed.every((a) => l.amenities?.includes(a))) return false;
    }
    return true;
  });
}

export async function getListings(filters: ListingFilters = {}): Promise<ListingsResponse> {
  noStore();
  try {
    const sb = supabaseAdmin();
    let query = sb.from('listings').select('*', { count: 'exact' })
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString());

    if (filters.q) {
      const q = filters.q.trim();
      if (isZip(q)) {
        query = query.eq('zip', q);
      } else {
        query = query.or(`city.ilike.%${q}%,address.ilike.%${q}%,state.ilike.%${q}%`);
      }
    }
    if (filters.city) {
      if (isZip(filters.city)) query = query.eq('zip', filters.city.trim());
      else query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.zip) query = query.eq('zip', filters.zip);
    if (filters.minPrice) query = query.gte('monthly_rent', Number(filters.minPrice));
    if (filters.maxPrice) query = query.lte('monthly_rent', Number(filters.maxPrice));
    if (filters.bedrooms) query = query.eq('bedrooms', Number(filters.bedrooms));
    if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
    if (filters.amenities) {
      filters.amenities.split(',').forEach((a) => { query = query.contains('amenities', [a.trim()]); });
    }
    if (filters.ownerDirect === '1') query = query.eq('listing_source', 'owner');

    const { data, error } = await query.order('refreshed_at', { ascending: false });
    if (error) throw error;

    const page = Number(filters.page ?? 1);
    const pageSize = 20;
    const total = data?.length ?? 0;
    const listings = (data ?? []).slice((page - 1) * pageSize, page * pageSize).map(rowToListing);
    return { listings, total, usingSampleData: false };
  } catch {
    return { listings: [], total: 0, usingSampleData: false };
  }
}

export async function getAllMappableListings(): Promise<Pick<Listing, 'id' | 'lat' | 'lng' | 'price' | 'address' | 'slug'>[]> {
  noStore();
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('id, lat, lng, monthly_rent, address, slug')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .limit(1000);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      lat: Number(row.lat),
      lng: Number(row.lng),
      price: Number(row.monthly_rent),
      address: row.address as string,
      slug: row.slug as string | undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Lightweight, UNPAGINATED list of every active listing for the sitemap.
 * getListings() caps at 20 per page, which would silently drop listings from
 * the sitemap as inventory grows — this returns all of them with just the
 * fields sitemap entries need (slug/id for the URL, refreshed_at for lastmod).
 */
export async function getListingsForSitemap(): Promise<Pick<Listing, 'id' | 'slug' | 'refreshed_at'>[]> {
  noStore();
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('id, slug, refreshed_at')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('refreshed_at', { ascending: false })
      .limit(5000);
    return (data ?? []).map((row) => ({
      id: row.id as string,
      slug: row.slug as string | null | undefined,
      refreshed_at: row.refreshed_at as string | null | undefined,
    }));
  } catch {
    return [];
  }
}

export async function getAllZips(): Promise<ZipLocation[]> {
  try {
    const res = await fetch(`${API_URL}/listings/locations`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return await res.json();
  } catch {
    const seen = new Set<string>();
    return sampleListings
      .filter((l) => l.zip)
      .reduce<ZipLocation[]>((acc, l) => {
        if (!seen.has(l.zip!)) {
          seen.add(l.zip!);
          acc.push({ zip: l.zip!, city: l.city, state: l.state ?? '' });
        }
        return acc;
      }, []);
  }
}

export interface CityLocation {
  city: string;
  state: string;
  slug: string; // lowercase, hyphenated e.g. "los-angeles"
}

export async function getAllCities(): Promise<CityLocation[]> {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('city, state')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .not('city', 'is', null);

    const seen = new Set<string>();
    return (data ?? []).reduce<CityLocation[]>((acc, row) => {
      const city = (row.city as string).trim();
      const state = (row.state as string | null)?.trim() ?? '';
      const key = `${city}|${state}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        acc.push({ city, state, slug: city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') });
      }
      return acc;
    }, []);
  } catch {
    return [];
  }
}

export interface TrendingCity {
  city: string;
  state: string;
  slug: string;
  count: number;
  avgRent: number;
}

export async function getTrendingCities(limit = 8): Promise<TrendingCity[]> {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('city, state, monthly_rent')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .not('city', 'is', null)
      .limit(500);

    const map = new Map<string, { city: string; state: string; total: number; count: number }>();
    for (const row of (data ?? [])) {
      const city = (row.city as string).trim();
      const state = ((row.state as string | null) ?? '').trim();
      const key = `${city}|${state}`.toLowerCase();
      const entry = map.get(key) ?? { city, state, total: 0, count: 0 };
      entry.total += Number(row.monthly_rent ?? 0);
      entry.count += 1;
      map.set(key, entry);
    }

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ city, state, total, count }) => ({
        city,
        state,
        slug: city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        count,
        avgRent: Math.round(total / count),
      }));
  } catch {
    return [];
  }
}

export async function getStats(): Promise<{ listings: number; cities: number; landlords: number }> {
  try {
    const sb = supabaseAdmin();
    const [listingsRes, citiesRes, landlordsRes] = await Promise.all([
      sb.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active').gt('expires_at', new Date().toISOString()),
      sb.from('listings').select('city', { count: 'exact' }).eq('status', 'active').gt('expires_at', new Date().toISOString()).not('city', 'is', null),
      sb.from('profiles').select('*', { count: 'exact', head: true }),
    ]);
    const cities = new Set((citiesRes.data ?? []).map((r: { city: string }) => (r.city as string).toLowerCase())).size;
    return {
      listings: listingsRes.count ?? 0,
      cities,
      landlords: landlordsRes.count ?? 0,
    };
  } catch {
    return { listings: 0, cities: 0, landlords: 0 };
  }
}

export interface MarketPulse {
  label: string;
  bedrooms: number;
  avgRent: number;
  count: number;
}

const PULSE_BEDS = [
  { label: 'Studio', bedrooms: 0 },
  { label: '1 BR', bedrooms: 1 },
  { label: '2 BR', bedrooms: 2 },
  { label: '3 BR', bedrooms: 3 },
];

export async function getMarketPulse(): Promise<MarketPulse[]> {
  const build = (map: Map<number, { total: number; count: number }>) =>
    PULSE_BEDS.map(({ label, bedrooms }) => {
      const e = map.get(bedrooms);
      return { label, bedrooms, avgRent: e ? Math.round(e.total / e.count) : 0, count: e?.count ?? 0 };
    }).filter(p => p.count > 0);

  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('bedrooms, monthly_rent')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .not('monthly_rent', 'is', null)
      .limit(500);

    const map = new Map<number, { total: number; count: number }>();
    for (const row of (data ?? [])) {
      const bed = Number(row.bedrooms);
      const rent = Number(row.monthly_rent);
      if (!isFinite(bed) || !isFinite(rent) || rent <= 0) continue;
      const key = bed <= 0 ? 0 : bed >= 3 ? 3 : bed;
      const e = map.get(key) ?? { total: 0, count: 0 };
      e.total += rent;
      e.count += 1;
      map.set(key, e);
    }
    return build(map);
  } catch {
    return [];
  }
}

export async function getListingsByCity(citySlug: string): Promise<{ listings: Listing[]; total: number; city: string; state: string; usingSampleData: boolean } | null> {
  const cities = await getAllCities();
  const match = cities.find(c => c.slug === citySlug);

  if (match) {
    const result = await getListings({ city: match.city });
    return { ...result, city: match.city, state: match.state };
  }

  // No active listings — look up in static US cities list for proper name/state
  const { US_CITIES_UNIQUE } = await import('./us-cities');
  const known = US_CITIES_UNIQUE.find(c => c.slug === citySlug);
  if (known) {
    return { listings: [], total: 0, city: known.city, state: known.state, usingSampleData: false };
  }

  // Unknown slug — derive city name from slug and return empty
  const cityName = citySlug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { listings: [], total: 0, city: cityName, state: '', usingSampleData: false };
}

export interface StateListingsResult {
  listings: Listing[];
  total: number;
  state: { name: string; abbr: string; slug: string };
  cities: { city: string; slug: string; count: number; avgRent: number }[];
  avgRent: number | null;
  minRent: number | null;
  maxRent: number | null;
  usingSampleData: boolean;
}

export async function getTopStates(limit = 51): Promise<Array<{ name: string; abbr: string; slug: string; count: number }>> {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('state')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .not('state', 'is', null)
      .limit(2000);

    const map = new Map<string, number>();
    for (const row of (data ?? [])) {
      const abbr = ((row.state as string) ?? '').trim().toUpperCase();
      if (!abbr) continue;
      map.set(abbr, (map.get(abbr) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([abbr, count]) => {
        const s = stateByAbbr.get(abbr);
        return s ? { name: s.name, abbr: s.abbr, slug: s.slug, count } : null;
      })
      .filter(Boolean) as Array<{ name: string; abbr: string; slug: string; count: number }>;
  } catch {
    return [];
  }
}

export async function getListingsByState(stateSlug: string): Promise<StateListingsResult | null> {
  const { stateBySlug } = await import('./states');
  const stateInfo = stateBySlug.get(stateSlug);
  if (!stateInfo) return null;

  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .ilike('state', stateInfo.abbr)
      .order('refreshed_at', { ascending: false })
      .limit(100);

    const listings = (data ?? []).map(rowToListing);

    // City breakdown
    const cityMap = new Map<string, { count: number; total: number }>();
    for (const l of listings) {
      const key = l.city.trim();
      const entry = cityMap.get(key) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += l.price;
      cityMap.set(key, entry);
    }
    const cities = Array.from(cityMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([city, { count, total }]) => ({
        city,
        slug: city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        count,
        avgRent: Math.round(total / count),
      }));

    const prices = listings.map((l) => l.price).filter((p) => p > 0);
    const avgRent = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : null;
    const minRent = prices.length ? Math.min(...prices) : null;
    const maxRent = prices.length ? Math.max(...prices) : null;

    return { listings, total: listings.length, state: stateInfo, cities, avgRent, minRent, maxRent, usingSampleData: false };
  } catch {
    return { listings: [], total: 0, state: stateInfo, cities: [], avgRent: null, minRent: null, maxRent: null, usingSampleData: false };
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getListing(idOrSlug: string): Promise<Listing | null> {
  if (idOrSlug.startsWith('sample-')) {
    return sampleListings.find((l) => l.id === idOrSlug) ?? null;
  }

  try {
    const sb = supabaseAdmin();
    const isUUID = UUID_RE.test(idOrSlug);
    const query = sb
      .from('listings')
      .select('*, profiles!landlord_id(virtual_phone, phone)')
      .in('status', ['active', 'rented', 'expired']);

    const { data, error } = await (isUUID
      ? query.eq('id', idOrSlug)
      : query.eq('slug', idOrSlug)
    ).single();

    const id = isUUID ? idOrSlug : data?.id;

    if (error || !data) return null;

    // Increment view count (fire and forget)
    sb.from('listings').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id).then(() => {});

    return rowToListing(data);
  } catch {
    return null;
  }
}
