import { Listing, ListingFilters, ListingsResponse } from './types';
import { sampleListings } from './sample-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.emlakie.com/api';

function filterSamples(filters: ListingFilters): Listing[] {
  return sampleListings.filter((l) => {
    if (filters.city && !l.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.minPrice && l.price < +filters.minPrice) return false;
    if (filters.maxPrice && l.price > +filters.maxPrice) return false;
    if (filters.bedrooms && l.bedrooms !== +filters.bedrooms) return false;
    if (filters.propertyType && l.property_type !== filters.propertyType) return false;
    return true;
  });
}

export async function getListings(filters: ListingFilters = {}): Promise<ListingsResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  try {
    const res = await fetch(`${API_URL}/listings?${params.toString()}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();
    return { listings: data.listings ?? [], total: data.total ?? 0, usingSampleData: false };
  } catch {
    const listings = filterSamples(filters);
    return { listings, total: listings.length, usingSampleData: true };
  }
}

export async function getListing(id: string): Promise<Listing | null> {
  if (id.startsWith('sample-')) {
    return sampleListings.find((l) => l.id === id) ?? null;
  }

  try {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
