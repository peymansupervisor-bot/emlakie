import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/api';

import { logError } from '@/lib/log-error'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') ?? '';
    const minPrice = searchParams.get('min_price') ?? '';
    const maxPrice = searchParams.get('max_price') ?? '';
    const bedrooms = searchParams.get('bedrooms') ?? '';
    const propertyType = searchParams.get('property_type') ?? '';
    const limit = Math.min(Number(searchParams.get('limit') ?? '10'), 20);

    const { listings, total } = await getListings({ city, minPrice, maxPrice, bedrooms, propertyType });

    const results = listings.slice(0, limit).map((l) => ({
      id: l.id,
      title: l.title,
      address: `${l.address}, ${l.city}${l.state ? `, ${l.state}` : ''}`,
      price_per_month: l.price,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      sqft: l.sqft,
      property_type: l.property_type,
      amenities: l.amenities,
      available_from: l.availableFrom ?? null,
      virtual_tour: l.virtual_tour_url ?? null,
      listing_url: `https://emlakie.com/rentals/${l.id}`,
      photo: l.photos?.[0] ?? null,
    }));

    return NextResponse.json({ total, results }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Gpt › Search', message: _msg, details: _stack, endpoint: 'GET /api/gpt/search', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
