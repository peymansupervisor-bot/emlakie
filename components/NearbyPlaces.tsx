interface Place {
  name: string;
  distance: number; // meters
}

interface Category {
  label: string;
  emoji: string;
  query: string;
  places: Place[];
}

function metersToMiles(m: number) {
  return (m / 1609.34).toFixed(1);
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchNearby(lat: number, lng: number): Promise<Category[]> {
  const radius = 2000; // 2km (~1.2 miles)

  const categories = [
    { label: 'Grocery', emoji: '🛒', tag: 'shop=supermarket|shop=grocery|shop=convenience' },
    { label: 'Restaurants', emoji: '🍽', tag: 'amenity=restaurant|amenity=fast_food' },
    { label: 'Coffee', emoji: '☕', tag: 'amenity=cafe' },
    { label: 'Schools', emoji: '🏫', tag: 'amenity=school|amenity=college|amenity=university' },
    { label: 'Transit', emoji: '🚌', tag: 'highway=bus_stop|amenity=bus_station|railway=station' },
    { label: 'Hospital', emoji: '🏥', tag: 'amenity=hospital|amenity=clinic|amenity=doctors' },
    { label: 'Pharmacy', emoji: '💊', tag: 'amenity=pharmacy' },
  ];

  const unionParts = categories
    .flatMap(({ tag }) =>
      tag.split('|').flatMap((t) => {
        const [k, v] = t.split('=');
        return [
          `node["${k}"="${v}"](around:${radius},${lat},${lng});`,
          `way["${k}"="${v}"](around:${radius},${lat},${lng});`,
        ];
      })
    )
    .join('\n');

  const query = `[out:json][timeout:10];\n(\n${unionParts}\n);\nout center;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) return [];
    const data = await res.json();

    const results: Category[] = categories.map(({ label, emoji, tag }) => {
      const keys = tag.split('|').map((t) => {
        const [k, v] = t.split('=');
        return { k, v };
      });

      const matched: Place[] = (data.elements ?? [])
        .filter((el: { tags?: Record<string, string> }) =>
          keys.some(({ k, v }) => el.tags?.[k] === v)
        )
        .map((el: { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }) => {
          const elLat = el.lat ?? el.center?.lat ?? lat;
          const elLng = el.lon ?? el.center?.lon ?? lng;
          return {
            name: el.tags?.name ?? label,
            distance: haversine(lat, lng, elLat, elLng),
          };
        })
        .sort((a: Place, b: Place) => a.distance - b.distance)
        .slice(0, 3);

      return { label, emoji, query: tag, places: matched };
    });

    return results;
  } catch {
    return [];
  }
}

export default async function NearbyPlaces({ lat, lng }: { lat: number; lng: number }) {
  const categories = await fetchNearby(lat, lng);
  const hasAny = categories.some((c) => c.places.length > 0);

  if (!hasAny) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">What&apos;s nearby</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories
          .filter((c) => c.places.length > 0)
          .map((cat) => (
            <div key={cat.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-700">
                {cat.emoji} {cat.label}
              </p>
              <ul className="mt-2 space-y-1">
                {cat.places.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-sm text-gray-600">
                    <span className="truncate pr-2">{p.name}</span>
                    <span className="shrink-0 text-xs text-gray-400">{metersToMiles(p.distance)} mi</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </section>
  );
}
