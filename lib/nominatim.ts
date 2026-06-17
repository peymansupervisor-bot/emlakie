export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country_code?: string;
  };
}

export async function geocodeAddress(query: string): Promise<NominatimResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&countrycodes=us`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Emlakie/1.0 (emlakie.com)' },
      next: { revalidate: 86400 }, // cache 24h
    });
    const data = await res.json();
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

export function isAddressQuery(q: string): boolean {
  // Starts with a number followed by a street name — classic US address pattern
  return /^\d+\s+[a-zA-Z]/.test(q.trim());
}
