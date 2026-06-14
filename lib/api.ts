import { createClient } from '@supabase/supabase-js';
import { Listing, ListingFilters, ListingsResponse, ZipLocation } from './types';
import { sampleListings } from './sample-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.emlakie.com/api';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    price: Number(row.price),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    sqft: Number(row.sqft),
    property_type: row.property_type as Listing['property_type'],
    amenities: (row.amenities as string[]) ?? [],
    photos: (row.photos as string[]) ?? [],
    status: row.status as string,
    availableFrom: row.available_from as string | undefined,
    view_count: Number(row.view_count ?? 0),
  };
}

function filterSamples(filters: ListingFilters): Listing[] {
  return sampleListings.filter((l) => {
    if (filters.zip && l.zip !== filters.zip) return false;
    if (filters.city && !l.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.minPrice && l.price < +filters.minPrice) return false;
    if (filters.maxPrice && l.price > +filters.maxPrice) return false;
    if (filters.bedrooms && l.bedrooms !== +filters.bedrooms) return false;
    if (filters.propertyType && l.property_type !== filters.propertyType) return false;
    return true;
  });
}

export async function getListings(filters: ListingFilters = {}): Promise<ListingsResponse> {
  try {
    const sb = supabaseAdmin();
    let query = sb.from('listings').select('*', { count: 'exact' }).eq('status', 'active');
    if (filters.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters.zip) query = query.eq('zip', filters.zip);
    if (filters.minPrice) query = query.gte('price', Number(filters.minPrice));
    if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice));
    if (filters.bedrooms) query = query.eq('bedrooms', Number(filters.bedrooms));
    if (filters.propertyType) query = query.eq('property_type', filters.propertyType);

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

export async function getListing(id: string): Promise<Listing | null> {
  if (id.startsWith('sample-')) {
    return sampleListings.find((l) => l.id === id) ?? null;
  }

  try {
    const sb = supabaseAdmin();
    // Fetch all statuses except deactivated — rented/expired stay visible for SEO
    const { data, error } = await sb
      .from('listings')
      .select('*')
      .eq('id', id)
      .in('status', ['active', 'rented', 'expired'])
      .single();

    if (error || !data) return null;

    // Increment view count (fire and forget)
    sb.from('listings').update({ view_count: (data.view_count ?? 0) + 1 }).eq('id', id).then(() => {});

    return rowToListing(data);
  } catch {
    return null;
  }
}
