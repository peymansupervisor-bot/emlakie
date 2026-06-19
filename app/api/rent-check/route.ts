import { NextRequest, NextResponse } from 'next/server'
import { getListings } from '@/lib/api'

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ insufficient: true, count: broaderActive.length })
    }

    return buildResponse(broaderActive, true)
  }

  return buildResponse(active, false)
}

function buildResponse(listings: { price: number; address: string; city: string; state?: string; slug?: string | null; id: string }[], broadened: boolean) {
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
    samples: listings.slice(0, 3).map(l => ({
      address: l.address,
      city: l.city,
      state: l.state ?? '',
      price: l.price,
      href: `/rentals/${l.slug ?? l.id}`,
    })),
  })
}
