import { NextRequest, NextResponse } from 'next/server';

import { logError } from '@/lib/log-error'
export async function GET(req: NextRequest) {
  try {
    const lat = req.nextUrl.searchParams.get('lat');
    const lng = req.nextUrl.searchParams.get('lng');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!lat || !lng || !apiKey) return NextResponse.json({ heading: null });

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${apiKey}`,
        { next: { revalidate: 86400 } }
      );
      const data = await res.json();
      if (data.status !== 'OK') return NextResponse.json({ heading: null });

      // The pano's heading is the direction of travel. The building is ~90° to one side.
      // We compute the bearing FROM the pano TO the property, which faces the camera at the building.
      const panoLat = data.location.lat;
      const panoLng = data.location.lng;
      const propLat = parseFloat(lat);
      const propLng = parseFloat(lng);

      const dLng = (propLng - panoLng) * (Math.PI / 180);
      const lat1 = panoLat * (Math.PI / 180);
      const lat2 = propLat * (Math.PI / 180);
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      const bearing = ((Math.atan2(y, x) * (180 / Math.PI)) + 360) % 360;

      return NextResponse.json({ heading: Math.round(bearing) });
    } catch {
      return NextResponse.json({ heading: null });
    }
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Streetview-heading', message: _msg, details: _stack, endpoint: 'GET /api/streetview-heading', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
