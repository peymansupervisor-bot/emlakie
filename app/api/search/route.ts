import { NextRequest, NextResponse } from 'next/server';
import { getListings } from '@/lib/api';
import { ListingFilters } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filters: ListingFilters = {};
  if (sp.get('q')) filters.q = sp.get('q')!;
  if (sp.get('city')) filters.city = sp.get('city')!;
  if (sp.get('zip')) filters.zip = sp.get('zip')!;
  if (sp.get('minPrice')) filters.minPrice = sp.get('minPrice')!;
  if (sp.get('maxPrice')) filters.maxPrice = sp.get('maxPrice')!;
  if (sp.get('bedrooms')) filters.bedrooms = sp.get('bedrooms')!;
  if (sp.get('propertyType')) filters.propertyType = sp.get('propertyType')!;
  if (sp.get('amenities')) filters.amenities = sp.get('amenities')!;
  if (sp.get('ownerDirect')) filters.ownerDirect = sp.get('ownerDirect')!;
  if (sp.get('page')) filters.page = sp.get('page')!;

  const result = await getListings(filters);
  return NextResponse.json(result);
}
