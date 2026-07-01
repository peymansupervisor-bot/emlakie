import { createClient } from '@supabase/supabase-js'

// Property types that always have an individual deed — can be sold as standalone units
export const ALWAYS_SALEABLE   = ['house', 'condo', 'townhouse'] as const

// Property types that are NEVER individually saleable
// ADU/JADU are attached to the main parcel; apartments are multi-unit buildings
export const NEVER_SALEABLE    = ['apartment', 'adu', 'jadu'] as const

// Studio is ambiguous — need ownership_type to decide
// If ownership_type === 'condo' → saleable; otherwise → not saleable

export function canSellIndividually(
  propertyType: string,
  ownershipType?: string | null
): boolean {
  if ((ALWAYS_SALEABLE as readonly string[]).includes(propertyType)) return true
  if ((NEVER_SALEABLE  as readonly string[]).includes(propertyType)) return false
  // Studio: rely on landlord's declared ownership_type
  if (propertyType === 'studio') return ownershipType === 'condo'
  return false
}

export function saleNotApplicableReason(
  propertyType: string,
  ownershipType?: string | null
): string {
  if (propertyType === 'adu')  return 'ADUs (Accessory Dwelling Units) are legally attached to the main parcel and cannot be sold separately from the primary property.'
  if (propertyType === 'jadu') return 'JADUs (Junior ADUs) are part of the primary residence structure and share the same deed. They cannot be sold as a standalone unit.'
  if (propertyType === 'apartment') return 'This is an individual unit within a multi-unit apartment building. Apartment units do not have a separate deed and cannot be sold independently — only the entire building can be sold.'
  if (propertyType === 'studio' && ownershipType !== 'condo') return 'This studio is part of an apartment building and does not have an individual deed. Only condominium-titled studios can be sold as standalone units.'
  return ''
}

export interface EValueResult {
  eRent: number
  eSale: number | null
  showSale: boolean
  saleNotApplicableReason: string   // explanation when showSale is false
  confidence: 'high' | 'medium' | 'low'
  comparablesCount: number
  priceRange: { min: number; max: number }
  capRate: number
  lastRent: number
  propertyType: string
  ownershipType?: string | null
}

const DEFAULT_CAP_RATE = 0.055   // 5.5% — coastal/high-demand markets

// City-specific cap rates reflecting local price-to-rent ratios
const CITY_CAP_RATES: Record<string, number> = {
  // Inland California — higher cap rates (lower price-to-rent)
  'bakersfield':    0.077,
  'fresno':         0.075,
  'stockton':       0.074,
  'modesto':        0.073,
  'visalia':        0.074,
  'riverside':      0.065,
  'san bernardino': 0.068,
  'fontana':        0.064,
  // Coastal California — lower cap rates (high price-to-rent)
  'los angeles':    0.045,
  'san francisco':  0.038,
  'san jose':       0.040,
  'san diego':      0.045,
  'santa barbara':  0.042,
  'oakland':        0.048,
  // Other major markets
  'phoenix':        0.060,
  'las vegas':      0.062,
  'seattle':        0.048,
  'portland':       0.052,
}

function getCapRate(city: string): number {
  return CITY_CAP_RATES[city.toLowerCase().trim()] ?? DEFAULT_CAP_RATE
}

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest
}

export interface AreaEValue {
  city: string;
  state: string;
  medianRent: number | null;
  byBedrooms: { bedrooms: number; label: string; median: number; count: number }[];
  comparablesCount: number;
}

export async function getAreaEValue(city: string, state: string): Promise<AreaEValue> {
  const sb = supabase();
  const { data } = await sb
    .from('listings')
    .select('price, bedrooms')
    .ilike('city', `%${city}%`)
    .eq('status', 'active')
    .limit(200);

  const comps = (data ?? []).filter((c) => Number(c.price) > 0);

  const grouped: Record<number, number[]> = {};
  for (const c of comps) {
    const bd = Number(c.bedrooms);
    if (!grouped[bd]) grouped[bd] = [];
    grouped[bd].push(Number(c.price));
  }

  const bedroomLabels: Record<number, string> = { 0: 'Studio', 1: '1 bed', 2: '2 beds', 3: '3 beds', 4: '4 beds', 5: '5+ beds' };

  const byBedrooms = Object.entries(grouped)
    .map(([bd, prices]) => ({
      bedrooms: Number(bd),
      label: bedroomLabels[Number(bd)] ?? `${bd} beds`,
      median: roundToNearest(median(prices), 25),
      count: prices.length,
    }))
    .sort((a, b) => a.bedrooms - b.bedrooms);

  const allPrices = comps.map((c) => Number(c.price));
  const medianRent = allPrices.length > 0 ? roundToNearest(median(allPrices), 25) : null;

  return { city, state, medianRent, byBedrooms, comparablesCount: comps.length };
}

export async function calculateEValue(listing: {
  id: string
  city: string
  state?: string
  zip?: string
  bedrooms: number
  bathrooms: number
  sqft?: number
  property_type: string
  ownership_type?: string | null
  price: number
}): Promise<EValueResult> {
  const sb = supabase()

  // 1. Try zip code + exact bedrooms (most precise — same micro-market)
  let comps: { monthly_rent: number; living_area_sqft: number; bedrooms: number; property_type: string }[] = []
  if (listing.zip) {
    const { data } = await sb
      .from('listings')
      .select('monthly_rent, living_area_sqft, bedrooms, property_type')
      .eq('zip', listing.zip)
      .eq('status', 'active')
      .neq('id', listing.id)
      .eq('bedrooms', listing.bedrooms)
      .limit(50)
    comps = data ?? []
  }

  // 2. Widen to zip ±1 bedroom if still thin
  if (comps.length < 3 && listing.zip) {
    const { data } = await sb
      .from('listings')
      .select('monthly_rent, living_area_sqft, bedrooms, property_type')
      .eq('zip', listing.zip)
      .eq('status', 'active')
      .neq('id', listing.id)
      .gte('bedrooms', listing.bedrooms - 1)
      .lte('bedrooms', listing.bedrooms + 1)
      .limit(50)
    comps = data ?? []
  }

  // 3. Fall back to city + exact bedrooms
  if (comps.length < 3) {
    const { data: exactComps } = await sb
      .from('listings')
      .select('monthly_rent, living_area_sqft, bedrooms, property_type')
      .eq('city', listing.city)
      .eq('status', 'active')
      .neq('id', listing.id)
      .eq('bedrooms', listing.bedrooms)
      .limit(50)
    comps = exactComps ?? []
  }

  // 4. Widen to city ±1 bedroom as last resort
  if (comps.length < 3) {
    const { data: wideComps } = await sb
      .from('listings')
      .select('monthly_rent, living_area_sqft, bedrooms, property_type')
      .eq('city', listing.city)
      .eq('status', 'active')
      .neq('id', listing.id)
      .gte('bedrooms', listing.bedrooms - 1)
      .lte('bedrooms', listing.bedrooms + 1)
      .limit(50)
    comps = wideComps ?? []
  }

  // Prefer same property type if we have enough
  const sameType = comps.filter((c) => c.property_type === listing.property_type)
  const workingSet = sameType.length >= 3 ? sameType : comps

  let prices = workingSet.map((c) => Number(c.monthly_rent)).filter((p) => p > 0)

  // If we have sqft data, apply a sqft adjustment
  if (listing.sqft && listing.sqft > 0) {
    const sqftComps = workingSet.filter((c) => c.living_area_sqft && Number(c.living_area_sqft) > 0)
    if (sqftComps.length >= 3) {
      const pricePerSqft = sqftComps.map((c) => Number(c.monthly_rent) / Number(c.living_area_sqft))
      const medianPPSF = median(pricePerSqft)
      const sqftEstimate = medianPPSF * listing.sqft
      const rawMedian = median(prices)
      prices = [sqftEstimate * 0.6 + rawMedian * 0.4, ...prices]
    }
  }

  const eRent = prices.length >= 3
    ? roundToNearest(median(prices), 25)
    : listing.price > 0
      ? roundToNearest(listing.price, 25)   // use asking price directly — not enough market data
      : 0

  const capRate = getCapRate(listing.city)
  const sellable = canSellIndividually(listing.property_type, listing.ownership_type)
  const eSale = sellable
    ? roundToNearest((eRent * 12) / capRate, 1000)
    : null

  const priceMin = prices.length >= 3 ? Math.min(...prices) : eRent * 0.93
  const priceMax = prices.length >= 3 ? Math.max(...prices) : eRent * 1.07

  const confidence: EValueResult['confidence'] =
    prices.length >= 10 ? 'high' :
    prices.length >= 4  ? 'medium' : 'low'

  return {
    eRent,
    eSale,
    showSale: sellable,
    saleNotApplicableReason: saleNotApplicableReason(listing.property_type, listing.ownership_type),
    confidence,
    comparablesCount: workingSet.length,
    priceRange: {
      min: roundToNearest(priceMin, 25),
      max: roundToNearest(priceMax, 25),
    },
    capRate: capRate * 100,
    lastRent: listing.price,
    propertyType: listing.property_type,
    ownershipType: listing.ownership_type,
  }
}
