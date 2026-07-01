const BASE_URL = 'https://api.rentcast.io/v1';

function headers(key: string) {
  return {
    'Accept': 'application/json',
    'X-Api-Key': key,
  };
}

// RentCast's AVM property type enum. Without one of these, RentCast can't
// tell a 2,500 sqft townhouse from a studio and will match comps for the
// wrong kind of unit entirely.
export type RentcastPropertyType = 'Single Family' | 'Condo' | 'Townhouse' | 'Apartment' | 'Manufactured';

export interface RentcastPropertyDetails {
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  propertyType?: RentcastPropertyType;
}

export interface RentcastValueEstimate {
  price: number | null;
  priceRangeLow: number | null;
  priceRangeHigh: number | null;
  latitude: number | null;
  longitude: number | null;
  comparablesCount: number;
}

export interface RentcastRentEstimate {
  rent: number | null;
  rentRangeLow: number | null;
  rentRangeHigh: number | null;
  latitude: number | null;
  longitude: number | null;
  comparablesCount: number;
}

interface AvmResponse {
  price?: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  rent?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  latitude?: number;
  longitude?: number;
  comparables?: unknown[];
}

async function fetchAvm(path: string, address: string, details?: RentcastPropertyDetails): Promise<AvmResponse | null> {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) return null;

  const params = new URLSearchParams({ address });
  if (details?.bedrooms != null) params.set('bedrooms', String(details.bedrooms));
  if (details?.bathrooms != null) params.set('bathrooms', String(details.bathrooms));
  if (details?.squareFootage) params.set('squareFootage', String(details.squareFootage));
  if (details?.propertyType) params.set('propertyType', details.propertyType);

  try {
    const res = await fetch(
      `${BASE_URL}${path}?${params.toString()}`,
      { headers: headers(key), next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Sale price estimate (AVM) for a given address. Always pass bedrooms/bathrooms/
// squareFootage/propertyType when known — without them RentCast falls back to
// whatever it can infer from the address alone, which produces wildly wrong
// estimates for units it can't size correctly (e.g. multi-unit street addresses).
export async function getValueEstimate(address: string, details?: RentcastPropertyDetails): Promise<RentcastValueEstimate | null> {
  const data = await fetchAvm('/avm/value', address, details);
  if (!data) return null;

  return {
    price: data.price ?? null,
    priceRangeLow: data.priceRangeLow ?? null,
    priceRangeHigh: data.priceRangeHigh ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    comparablesCount: data.comparables?.length ?? 0,
  };
}

// Monthly rent estimate (AVM) for a given address. See getValueEstimate for why
// `details` matters.
export async function getRentEstimate(address: string, details?: RentcastPropertyDetails): Promise<RentcastRentEstimate | null> {
  const data = await fetchAvm('/avm/rent/long-term', address, details);
  if (!data) return null;

  return {
    rent: data.rent ?? null,
    rentRangeLow: data.rentRangeLow ?? null,
    rentRangeHigh: data.rentRangeHigh ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    comparablesCount: data.comparables?.length ?? 0,
  };
}
