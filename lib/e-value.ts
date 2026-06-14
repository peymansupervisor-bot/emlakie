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

const CAP_RATE = 0.055   // 5.5% — standard residential cap rate

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

export async function calculateEValue(listing: {
  id: string
  city: string
  state?: string
  bedrooms: number
  bathrooms: number
  sqft?: number
  property_type: string
  ownership_type?: string | null
  price: number
}): Promise<EValueResult> {
  const sb = supabase()

  // Pull active listings in the same city with same bedroom count
  // Widen to ±1 bedroom if needed
  let { data: comps } = await sb
    .from('listings')
    .select('price, sqft, bedrooms, property_type')
    .eq('city', listing.city)
    .eq('status', 'active')
    .neq('id', listing.id)
    .gte('bedrooms', listing.bedrooms - 1)
    .lte('bedrooms', listing.bedrooms + 1)
    .limit(50)

  comps = comps ?? []

  // Prefer same property type if we have enough
  const sameType = comps.filter((c) => c.property_type === listing.property_type)
  const workingSet = sameType.length >= 3 ? sameType : comps

  let prices = workingSet.map((c) => Number(c.price)).filter((p) => p > 0)

  // If we have sqft data, apply a sqft adjustment
  if (listing.sqft && listing.sqft > 0) {
    const sqftComps = workingSet.filter((c) => c.sqft && Number(c.sqft) > 0)
    if (sqftComps.length >= 3) {
      // Price per sqft adjustment
      const pricePerSqft = sqftComps.map((c) => Number(c.price) / Number(c.sqft))
      const medianPPSF = median(pricePerSqft)
      const sqftEstimate = medianPPSF * listing.sqft
      // Blend: 60% sqft-adjusted, 40% raw median
      const rawMedian = median(prices)
      prices = [sqftEstimate * 0.6 + rawMedian * 0.4, ...prices]
    }
  }

  const eRent = prices.length > 0
    ? roundToNearest(median(prices), 25)         // round to nearest $25
    : roundToNearest(listing.price * 1.03, 25)   // fallback: +3% market drift

  const sellable = canSellIndividually(listing.property_type, listing.ownership_type)
  const eSale = sellable
    ? roundToNearest((eRent * 12) / CAP_RATE, 1000)
    : null

  const priceMin = prices.length > 0 ? Math.min(...prices) : eRent * 0.9
  const priceMax = prices.length > 0 ? Math.max(...prices) : eRent * 1.1

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
    capRate: CAP_RATE * 100,
    lastRent: listing.price,
    propertyType: listing.property_type,
    ownershipType: listing.ownership_type,
  }
}
