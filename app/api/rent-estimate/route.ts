import { NextRequest, NextResponse } from 'next/server'
import { getListings } from '@/lib/api'

import { logError } from '@/lib/log-error'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')?.trim()
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const propertyType = searchParams.get('propertyType') || undefined

    if (!city || !bedrooms) {
      return NextResponse.json({ error: 'city and bedrooms are required' }, { status: 400 })
    }

    // Exact match first: city + beds + type
    const { listings: exact } = await getListings({ city, bedrooms, propertyType })
    const exactActive = exact.filter(l => l.status === 'active' && l.price > 0)

    if (exactActive.length >= 5) return buildResponse(exactActive, 'exact', city)

    // Broaden: city + beds (drop type)
    const { listings: byBeds } = await getListings({ city, bedrooms })
    const byBedsActive = byBeds.filter(l => l.status === 'active' && l.price > 0)

    if (byBedsActive.length >= 3) return buildResponse(byBedsActive, 'broad', city)

    // Broaden further: city only
    const { listings: byCity } = await getListings({ city })
    const byCityActive = byCity.filter(l => l.status === 'active' && l.price > 0)

    if (byCityActive.length >= 3) return buildResponse(byCityActive, 'city', city)

    return NextResponse.json({ insufficient: true, count: byCityActive.length })
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Rent-estimate', message: _msg, details: _stack, endpoint: 'GET /api/rent-estimate', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}

type Confidence = 'exact' | 'broad' | 'city'

function buildResponse(
  listings: { price: number; address: string; city: string; state?: string; bedrooms: number; property_type: string; slug?: string | null; id: string }[],
  confidence: Confidence,
  city: string,
) {
  const prices = listings.map(l => l.price).sort((a, b) => a - b)
  const avg    = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
  const median = prices[Math.floor(prices.length / 2)]
  const low    = prices[Math.floor(prices.length * 0.25)] ?? prices[0]
  const high   = prices[Math.floor(prices.length * 0.75)] ?? prices[prices.length - 1]

  // Suggested range: ±8% around median, snapped to nearest $25
  const snap = (n: number) => Math.round(n / 25) * 25
  const suggestLow  = snap(median * 0.92)
  const suggestHigh = snap(median * 1.08)

  return NextResponse.json({
    confidence,
    count: listings.length,
    city,
    avg,
    median,
    low,
    high,
    suggestLow,
    suggestHigh,
    comparables: listings.slice(0, 4).map(l => ({
      address: l.address,
      city: l.city,
      state: l.state ?? '',
      price: l.price,
      bedrooms: l.bedrooms,
      property_type: l.property_type,
      href: `/rentals/${l.slug ?? l.id}`,
    })),
  })
}
