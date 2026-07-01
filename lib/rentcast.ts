const BASE_URL = 'https://api.rentcast.io/v1';

export interface RentcastPropertyRecord {
  bedrooms: number | null;
  bathrooms: number | null;
  squareFootage: number | null;
  yearBuilt: number | null;
  propertyType: string | null;   // raw RentCast enum, e.g. "Single Family", "Condo"
}

// Property records lookup, used only to pre-fill the "List a Property" form —
// this is editable scaffolding a landlord can correct, never a number shown
// publicly. (RentCast's AVM was tried for E-Rent/E-Sale Value and rolled back
// after producing unrealistic estimates on unusual properties — do not reuse
// this module for value/rent estimates without re-validating that decision.)
export async function getPropertyRecord(address: string): Promise<RentcastPropertyRecord | null> {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/properties?address=${encodeURIComponent(address)}`,
      { headers: { 'Accept': 'application/json', 'X-Api-Key': key }, next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const record = Array.isArray(data) ? data[0] : null;
    if (!record) return null;

    return {
      bedrooms: record.bedrooms ?? null,
      bathrooms: record.bathrooms ?? null,
      squareFootage: record.squareFootage ?? null,
      yearBuilt: record.yearBuilt ?? null,
      propertyType: record.propertyType ?? null,
    };
  } catch {
    return null;
  }
}

export interface RentcastRentalListing {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number | null;
}

// Active rental listings for a city/state, used as a Rent Check fallback when
// EMLAKIE's own inventory in that city is too thin to compare against. These
// are real, currently-active listings (not a synthesized estimate), so this
// doesn't carry the "confidently wrong single number" risk that got RentCast's
// AVM rolled back from E-Rent/E-Sale Value.
export async function getActiveRentalListings(city: string, state: string, bedrooms?: number): Promise<RentcastRentalListing[]> {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) return [];

  try {
    const params = new URLSearchParams({ city, state, status: 'Active', limit: '50' });
    if (bedrooms != null) params.set('bedrooms', String(bedrooms));

    const res = await fetch(
      `${BASE_URL}/listings/rental/long-term?${params.toString()}`,
      { headers: { 'Accept': 'application/json', 'X-Api-Key': key }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((l) => typeof l.price === 'number' && l.price > 0)
      .map((l) => ({
        address: l.addressLine1 ?? l.formattedAddress ?? '',
        city: l.city ?? city,
        state: l.state ?? state,
        price: l.price,
        bedrooms: l.bedrooms ?? null,
      }));
  } catch {
    return [];
  }
}
