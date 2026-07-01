import { NextRequest, NextResponse } from 'next/server'
import { getListings } from '@/lib/api'
import { getActiveRentalListings } from '@/lib/rentcast'
import { US_CITIES } from '@/lib/us-cities'

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')?.trim()
    const bedrooms = searchParams.get('bedrooms')
    const propertyType = searchParams.get('propertyType') || undefined

    if (!city || !bedrooms) {
      return NextResponse.json({ error: 'city and bedrooms are required' }, { status: 400 })
    }

    const { listings } = await getListings({ city, bedrooms, propertyType })
    const active = listings.filter(l => l.status === 'active' && l.price > 0)

    if (active.length < 3) {
      // Try without propertyType filter for a broader sample
      const { listings: broader } = await getListings({ city, bedrooms })
      const broaderActive = broader.filter(l => l.status === 'active' && l.price > 0)

      if (broaderActive.length < 3) {
        // EMLAKIE's own inventory in this city is too thin — fall back to
        // RentCast's active rental listings instead of giving up. These are
        // real listings (not a synthesized estimate), so the result is at
        // worst an imperfect market snapshot, never an invented number.
        const state = broaderActive[0]?.state
          ?? US_CITIES.find((c) => c.city.toLowerCase() === city.toLowerCase())?.state
        if (state) {
          const marketListings = await getActiveRentalListings(city, state, Number(bedrooms))
          if (marketListings.length >= 3) {
            return buildResponse(marketListings, false, 'market-data')
          }
        }
        return NextResponse.json({ insufficient: true, count: broaderActive.length })
      }

      return buildResponse(broaderActive, true, 'emlakie')
    }

    return buildResponse(active, false, 'emlakie')
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Rent-check', message: _msg, details: _stack, endpoint: 'GET /api/rent-check', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}

function buildResponse(
  listings: { price: number; address: string; city: string; state?: string; slug?: string | null; id?: string }[],
  broadened: boolean,
  source: 'emlakie' | 'market-data',
) {
  const prices = listings.map(l => l.price).sort((a, b) => a - b)
  const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length)
  const median = prices[Math.floor(prices.length / 2)]
  const low = prices[Math.floor(prices.length * 0.25)] ?? prices[0]
  const high = prices[Math.floor(prices.length * 0.75)] ?? prices[prices.length - 1]

  return NextResponse.json({
    count: listings.length,
    avg,
    median,
    low,
    high,
    broadened,
    source,
    samples: listings.slice(0, 3).map(l => ({
      address: l.address,
      city: l.city,
      state: l.state ?? '',
      price: l.price,
      href: source === 'emlakie' && l.id ? `/rentals/${l.slug ?? l.id}` : null,
    })),
  })
}
