const BASE_URL = 'https://api.rentcast.io/v1';

function headers(key: string) {
  return {
    'Accept': 'application/json',
    'X-Api-Key': key,
  };
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

async function fetchAvm(path: string, address: string): Promise<AvmResponse | null> {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `${BASE_URL}${path}?address=${encodeURIComponent(address)}`,
      { headers: headers(key), next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Sale price estimate (AVM) for a given address
export async function getValueEstimate(address: string): Promise<RentcastValueEstimate | null> {
  const data = await fetchAvm('/avm/value', address);
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

// Monthly rent estimate (AVM) for a given address
export async function getRentEstimate(address: string): Promise<RentcastRentEstimate | null> {
  const data = await fetchAvm('/avm/rent/long-term', address);
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
