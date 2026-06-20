import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchBridgeListings, mapBridgePropertyType, BridgeListing } from '@/lib/bridge';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

const ALLOWED_PHOTO_HOSTS = ['photos.bridgedataoutput.com', 'cdn.bridgedataoutput.com', 'cdnparap30.paragonrels.com'];

function isAllowedPhotoUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'https:') return false;
    return ALLOWED_PHOTO_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

async function uploadPhotos(sb: ReturnType<typeof supabaseAdmin>, listing: BridgeListing): Promise<string[]> {
  const sorted = [...(listing.Media ?? [])].sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
  const photoUrls: string[] = [];

  for (const media of sorted.slice(0, 20)) {
    if (!isAllowedPhotoUrl(media.MediaURL)) continue;
    try {
      const imgRes = await fetch(media.MediaURL, { signal: AbortSignal.timeout(8000) });
      if (!imgRes.ok) continue;
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const ext = media.MediaURL.split('.').pop()?.split('?')[0] ?? 'jpg';
      const path = `bridge/${listing.ListingKey}/${photoUrls.length}.${ext}`;
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
  return photoUrls;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.BRIDGE_API_KEY;
  const dataset = process.env.BRIDGE_DATASET;

  if (!apiKey || !dataset) {
    return NextResponse.json({ error: 'Bridge API credentials not configured' }, { status: 500 });
  }

  const sb = supabaseAdmin();
  let imported = 0;
  let skipped = 0;
  let page = 0;
  let total = Infinity;

  while (imported + skipped < total) {
    const { listings, total: t } = await fetchBridgeListings(dataset, apiKey, page);
    total = t;
    if (listings.length === 0) break;

    for (const listing of listings) {
      try {
        const photoUrls = await uploadPhotos(sb, listing);

        const { error } = await sb.from('listings').upsert({
          mls_number: listing.ListingId,
          address: listing.UnparsedAddress,
          city: listing.City,
          state: listing.StateOrProvince,
          zip: listing.PostalCode,
          price: listing.ListPrice,
          bedrooms: listing.BedroomsTotal ?? 0,
          bathrooms: listing.BathroomsTotalInteger ?? 0,
          sqft: listing.LivingArea ?? null,
          property_type: mapBridgePropertyType(listing.PropertyType, listing.PropertySubType),
          description: listing.PublicRemarks ?? '',
          photos: photoUrls,
          lat: listing.Latitude ?? null,
          lng: listing.Longitude ?? null,
          status: 'active',
          source: 'bridge',
          available_from: listing.AvailabilityDate ?? null,
        }, { onConflict: 'mls_number' });

        if (error) { skipped++; } else { imported++; }
      } catch {
        skipped++;
      }
    }

    page++;
    if (listings.length < 200) break;
  }

  console.log(`[bridge-sync] imported=${imported} skipped=${skipped} total=${total}`);
  return NextResponse.json({ imported, skipped, total });
}
