import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

function mapPropertyType(type: string, subType: string): string {
  const t = (subType || type).toLowerCase();
  if (t.includes('condo')) return 'condo';
  if (t.includes('townhouse') || t.includes('townhome')) return 'townhouse';
  if (t.includes('apartment')) return 'apartment';
  if (t.includes('studio')) return 'studio';
  if (t.includes('adu') || t.includes('accessory')) return 'adu';
  if (t.includes('single') || t.includes('house') || t.includes('residential')) return 'house';
  return 'house';
}

// POST /api/listhub/import — import a single ListHub listing into Emlakie
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const listing = body.listing;
  if (!listing) return NextResponse.json({ error: 'No listing provided' }, { status: 400 });

  const sb = supabaseAdmin();

  // Download and upload photos to Supabase Storage
  const mediaItems: { MediaURL: string; Order: number }[] = listing.Media ?? [];
  const sorted = [...mediaItems].sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  const photoUrls: string[] = [];

  for (const media of sorted.slice(0, 30)) {
    try {
      const imgRes = await fetch(media.MediaURL, { signal: AbortSignal.timeout(8000) });
      if (!imgRes.ok) continue;
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const ext = media.MediaURL.split('.').pop()?.split('?')[0] ?? 'jpg';
      const path = `listhub/${listing.ListingKey}/${Date.now()}-${photoUrls.length}.${ext}`;
      const { error } = await sb.storage.from('listing-photos').upload(path, buffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: true,
      });
      if (!error) {
        const { data: { publicUrl } } = sb.storage.from('listing-photos').getPublicUrl(path);
        photoUrls.push(publicUrl);
      }
    } catch {
      // skip failed photo
    }
  }

  // Upsert listing into Supabase
  const { data, error } = await sb.from('listings').upsert({
    mls_number: listing.ListingId,
    address: listing.UnparsedAddress,
    city: listing.City,
    state: listing.StateOrProvince,
    zip: listing.PostalCode,
    price: listing.ListPrice,
    bedrooms: listing.BedroomsTotal ?? 0,
    bathrooms: listing.BathroomsTotalInteger ?? 0,
    sqft: listing.LivingArea ?? null,
    property_type: mapPropertyType(listing.PropertyType ?? '', listing.PropertySubType ?? ''),
    description: listing.PublicRemarks ?? '',
    photos: photoUrls,
    latitude: listing.Latitude ?? null,
    longitude: listing.Longitude ?? null,
    status: 'active',
    source: 'listhub',
  }, { onConflict: 'mls_number' }).select('id').single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id, photoCount: photoUrls.length });
}
