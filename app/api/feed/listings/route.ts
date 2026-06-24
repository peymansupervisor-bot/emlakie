import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Public XML feed of all active EMLAKIE listings.
// Used for syndication to partners (e.g. Zumper).
// Cached for 15 minutes; force-refresh by adding ?refresh=1 with the feed secret.
export const revalidate = 900;

function escXml(val: unknown): string {
  if (val == null) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXml(listings: Record<string, unknown>[]): string {
  const now = new Date().toISOString();

  const items = listings.map((l) => {
    const photos = (l.photos as string[] | null) ?? [];
    const amenities = (l.amenities as string[] | null) ?? [];
    const slug = (l.slug as string | null) ?? (l.id as string);
    const listingUrl = `https://emlakie.com/rentals/${slug}`;

    const photoXml = photos
      .slice(0, 20)
      .map((p, i) => `      <Photo position="${i + 1}">${escXml(p)}</Photo>`)
      .join('\n');

    const amenityXml = amenities
      .map((a) => `      <Amenity>${escXml(a)}</Amenity>`)
      .join('\n');

    return `  <Listing>
    <ID>${escXml(l.id)}</ID>
    <ListingURL>${escXml(listingUrl)}</ListingURL>
    <Status>Active</Status>
    <Title>${escXml(l.title)}</Title>
    <Description>${escXml(l.description)}</Description>
    <Address>
      <StreetAddress>${escXml(l.address)}</StreetAddress>
      <City>${escXml(l.city)}</City>
      <State>${escXml(l.state)}</State>
      <Zip>${escXml(l.zip)}</Zip>
      ${l.lat != null ? `<Latitude>${l.lat}</Latitude>` : ''}
      ${l.lng != null ? `<Longitude>${l.lng}</Longitude>` : ''}
    </Address>
    <Pricing>
      <MonthlyRent>${l.monthly_rent ?? ''}</MonthlyRent>
      ${l.deposit != null ? `<Deposit>${l.deposit}</Deposit>` : ''}
    </Pricing>
    <Details>
      <PropertyType>${escXml(l.property_type)}</PropertyType>
      <Bedrooms>${l.bedrooms ?? ''}</Bedrooms>
      <Bathrooms>${l.bathrooms ?? ''}</Bathrooms>
      ${l.living_area_sqft != null ? `<SquareFeet>${l.living_area_sqft}</SquareFeet>` : ''}
      <PetsAllowed>${l.pets_allowed ? 'true' : 'false'}</PetsAllowed>
      ${l.parking ? `<Parking>${escXml(l.parking)}</Parking>` : ''}
      ${l.lease_term ? `<LeaseTerm>${escXml(l.lease_term)}</LeaseTerm>` : ''}
      ${l.available_date ? `<AvailableDate>${escXml(l.available_date)}</AvailableDate>` : ''}
      <Section8Accepted>${l.section_8 ? 'true' : 'false'}</Section8Accepted>
    </Details>
    <Amenities>
${amenityXml}
    </Amenities>
    <Photos>
${photoXml}
    </Photos>
    <Contact>
      ${l.contact_name ? `<Name>${escXml(l.contact_name)}</Name>` : ''}
      ${l.contact_email ? `<Email>${escXml(l.contact_email)}</Email>` : ''}
      ${l.contact_phone ? `<Phone>${escXml(l.contact_phone)}</Phone>` : ''}
    </Contact>
    ${l.listed_date ? `<ListedDate>${escXml(l.listed_date)}</ListedDate>` : ''}
    ${l.updated_at ? `<UpdatedAt>${escXml(l.updated_at)}</UpdatedAt>` : ''}
  </Listing>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<Listings
  xmlns="https://emlakie.com/feed/v1"
  provider="EMLAKIE"
  providerURL="https://emlakie.com"
  generated="${now}"
  count="${listings.length}">
${items.join('\n')}
</Listings>`;
}

export async function GET(req: NextRequest) {
  // Optional secret for cache-busting or partner verification
  const feedSecret = process.env.FEED_SECRET;
  const providedSecret = req.nextUrl.searchParams.get('secret');
  if (feedSecret && providedSecret && providedSecret !== feedSecret) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await sb
      .from('listings')
      .select([
        'id', 'title', 'description', 'address', 'city', 'state', 'zip',
        'lat', 'lng', 'monthly_rent', 'deposit', 'bedrooms', 'bathrooms',
        'living_area_sqft', 'property_type', 'amenities', 'photos',
        'available_date', 'lease_term', 'pets_allowed', 'parking',
        'contact_name', 'contact_email', 'contact_phone',
        'listed_date', 'updated_at', 'slug', 'section_8',
      ].join(','))
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const xml = buildXml((data ?? []) as unknown as Record<string, unknown>[]);

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600',
        'X-Feed-Provider': 'EMLAKIE',
        'X-Listing-Count': String((data ?? []).length),
      },
    });
  } catch (err) {
    console.error('[feed/listings] error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
