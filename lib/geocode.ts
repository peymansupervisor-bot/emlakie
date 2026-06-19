export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip?: string | null
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    const full = [address, city, state, zip, 'USA'].filter(Boolean).join(', ');
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(full)}&key=${apiKey}`
      );
      const data = await res.json();
      const loc = data?.results?.[0]?.geometry?.location;
      if (loc) return { lat: loc.lat, lng: loc.lng };
    } catch {
      // fall through to Nominatim
    }
  }

  // Fallback: Nominatim (OpenStreetMap)
  try {
    const full = encodeURIComponent([address, city, state, zip, 'USA'].filter(Boolean).join(', '));
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${full}&format=json&limit=1&countrycodes=us`,
      { headers: { 'User-Agent': 'emlakie-geocoder/1.0', 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };

    // Last resort: city + state only
    const cityOnly = encodeURIComponent([city, state, zip, 'USA'].filter(Boolean).join(', '));
    const res2 = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${cityOnly}&format=json&limit=1&countrycodes=us`,
      { headers: { 'User-Agent': 'emlakie-geocoder/1.0', 'Accept-Language': 'en' } }
    );
    const data2 = await res2.json();
    if (data2?.[0]) return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
  } catch {
    // ignore
  }

  return null;
}
