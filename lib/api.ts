import { createClient } from '@supabase/supabase-js';
import { Listing, ListingFilters, ListingsResponse, ZipLocation } from './types';
import { sampleListings } from './sample-data';

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
    virtual_tour_url: row.virtual_tour_url as string | null | undefined,
    slug: row.slug as string | null | undefined,
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
  try {
    const sb = supabaseAdmin();
    let query = sb.from('listings').select('*', { count: 'exact' }).eq('status', 'active');
    if (filters.q) {
      const q = filters.q.trim();
      if (isZip(q)) {
        query = query.eq('zip', q);
      } else {
        // Search city, address, and state — OR them with Supabase's or()
        query = query.or(
          `city.ilike.%${q}%,address.ilike.%${q}%,state.ilike.%${q}%`
        );
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

    const page = Number(filters.page ?? 1);
    const pageSize = 20;
    query = query.order('created_at', { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const listings = (data ?? []).map(rowToListing);
    const MIN_LISTINGS = 6;
    if (listings.length >= MIN_LISTINGS) return { listings, total: count ?? listings.length, usingSampleData: false };
    // Pad with samples when fewer than MIN_LISTINGS real listings exist
    const realIds = new Set(listings.map((l) => l.id));
    const samples = filterSamples(filters).filter((s) => !realIds.has(s.id));
    const padded = [...listings, ...samples].slice(0, Math.max(listings.length, MIN_LISTINGS));
    return { listings: padded, total: padded.length, usingSampleData: listings.length === 0 };
  } catch {
    const listings = filterSamples(filters);
    return { listings, total: listings.length, usingSampleData: true };
  }
}

export async function getAllMappableListings(): Promise<Pick<Listing, 'id' | 'lat' | 'lng' | 'price' | 'address' | 'slug'>[]> {
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('listings')
      .select('id, lat, lng, monthly_rent, address, slug')
      .eq('status', 'active')
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
      .not('city', 'is', null);

    if (!data || data.length === 0) throw new Error('no data');

    const seen = new Set<string>();
    return data.reduce<CityLocation[]>((acc, row) => {
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
    // Fall back to sample data cities
    const seen = new Set<string>();
    return sampleListings.reduce<CityLocation[]>((acc, l) => {
      const key = `${l.city}|${l.state ?? ''}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        acc.push({ city: l.city, state: l.state ?? '', slug: l.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') });
      }
      return acc;
    }, []);
  }
}

export async function getListingsByCity(citySlug: string): Promise<{ listings: Listing[]; total: number; city: string; state: string; usingSampleData: boolean } | null> {
  const cities = await getAllCities();
  const match = cities.find(c => c.slug === citySlug);
  if (!match) return null;

  const result = await getListings({ city: match.city });
  return { ...result, city: match.city, state: match.state };
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
      .select('*')
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
