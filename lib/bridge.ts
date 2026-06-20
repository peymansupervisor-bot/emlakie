// Bridge Interactive RESO Web API client for CLAW MLS listings

const BRIDGE_BASE = 'https://api.bridgedataoutput.com/api/v2';

export interface BridgeListing {
  ListingKey: string;
  ListingId: string;
  UnparsedAddress: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  ListPrice: number;
  BedroomsTotal: number | null;
  BathroomsTotalInteger: number | null;
  LivingArea: number | null;
  PropertyType: string;
  PropertySubType: string | null;
  PublicRemarks: string | null;
  Latitude: number | null;
  Longitude: number | null;
  StandardStatus: string;
  Media: { MediaURL: string; Order: number }[];
  ModificationTimestamp: string;
  AvailabilityDate: string | null;
}

interface BridgeResponse {
  bundle: BridgeListing[];
  total: { value: number };
}

export async function fetchBridgeListings(
  dataset: string,
  apiKey: string,
  page = 0,
  pageSize = 200
): Promise<{ listings: BridgeListing[]; total: number }> {
  // RESO Web API: filter for residential lease (rental) listings
  const params = new URLSearchParams({
    access_token: apiKey,
    $filter: "StandardStatus eq 'Active' and PropertyType eq 'Residential Lease'",
    $select: [
      'ListingKey', 'ListingId', 'UnparsedAddress', 'City', 'StateOrProvince',
      'PostalCode', 'ListPrice', 'BedroomsTotal', 'BathroomsTotalInteger',
      'LivingArea', 'PropertyType', 'PropertySubType', 'PublicRemarks',
      'Latitude', 'Longitude', 'StandardStatus', 'Media',
      'ModificationTimestamp', 'AvailabilityDate',
    ].join(','),
    $orderby: 'ModificationTimestamp desc',
    $top: String(pageSize),
    $skip: String(page * pageSize),
    $count: 'true',
  });

  const res = await fetch(
    `${BRIDGE_BASE}/${dataset}/listings?${params}`,
    { cache: 'no-store', signal: AbortSignal.timeout(30000) }
  );

  if (!res.ok) throw new Error(`Bridge API error: ${res.status} ${await res.text()}`);
  const data: BridgeResponse = await res.json();
  return { listings: data.bundle ?? [], total: data.total?.value ?? 0 };
}

export function mapBridgePropertyType(type: string, subType: string | null): string {
  const t = ((subType ?? '') + ' ' + type).toLowerCase();
  if (t.includes('condo')) return 'condo';
  if (t.includes('townhouse') || t.includes('townhome')) return 'townhouse';
  if (t.includes('apartment')) return 'apartment';
  if (t.includes('studio')) return 'studio';
  if (t.includes('adu') || t.includes('accessory')) return 'adu';
  if (t.includes('single') || t.includes('house')) return 'house';
  return 'house';
}
