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
