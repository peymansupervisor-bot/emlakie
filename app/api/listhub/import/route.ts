import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { geocodeAddress } from '@/lib/geocode';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
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

// Allowed photo hostnames for ListHub imports (SSRF protection)
const ALLOWED_PHOTO_HOSTS = [
  'cdn.listhub.com',
  'photos.listhub.com',
  'media.listhub.com',
  'images.listhub.com',
  'ssl.cdn-redfin.com',
  'photos.zillowstatic.com',
];

function isAllowedPhotoUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'https:') return false;
    return ALLOWED_PHOTO_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

// POST /api/listhub/import — import a single ListHub listing into EMLAKIE
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-import-secret');
    if (!secret || secret !== process.env.LISTHUB_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const listing = body.listing;
    if (!listing) return NextResponse.json({ error: 'No listing provided' }, { status: 400 });

    const sb = supabaseAdmin();

    // Download and upload photos to Supabase Storage
    const mediaItems: { MediaURL: string; Order: number }[] = listing.Media ?? [];
    const sorted = [...mediaItems].sort((a, b) => (a.Order ?? 0) - (b.Order ?? 0));
    const photoUrls: string[] = [];

    for (const media of sorted.slice(0, 30)) {
      if (!isAllowedPhotoUrl(media.MediaURL)) continue;
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
      lat: listing.Latitude ?? null,
      lng: listing.Longitude ?? null,
      status: 'active',
      source: 'listhub',
    }, { onConflict: 'mls_number' }).select('id').single();

    if (error) return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });

    // If MLS didn't provide coordinates, geocode from address
    if (!listing.Latitude || !listing.Longitude) {
      const coords = await geocodeAddress(
        listing.UnparsedAddress,
        listing.City,
        listing.StateOrProvince,
        listing.PostalCode
      );
      if (coords) {
        await sb.from('listings').update({ lat: coords.lat, lng: coords.lng }).eq('id', data.id);
      }
    }

    return NextResponse.json({ id: data.id, photoCount: photoUrls.length });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Listhub › Import', message: _msg, details: _stack, endpoint: 'POST /api/listhub/import', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
