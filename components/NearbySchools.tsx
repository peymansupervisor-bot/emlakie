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

interface School {
  name: string;
  type: 'Elementary' | 'Middle' | 'High School' | 'College' | 'Other';
  distanceMiles: number;
}

function inferType(tags: Record<string, string>): School['type'] {
  const name = (tags.name ?? '').toLowerCase();
  const amenity = tags.amenity ?? '';
  if (amenity === 'college' || amenity === 'university') return 'College';
  if (name.includes('high school') || name.includes(' high')) return 'High School';
  if (name.includes('middle') || name.includes('junior')) return 'Middle';
  if (name.includes('elementary') || name.includes('primary')) return 'Elementary';
  return 'Other';
}

function typeIcon(type: School['type']) {
  switch (type) {
    case 'Elementary': return '🎒';
    case 'Middle': return '📚';
    case 'High School': return '🎓';
    case 'College': return '🏛️';
    default: return '🏫';
  }
}

function typeBadgeColor(type: School['type']) {
  switch (type) {
    case 'Elementary': return 'bg-blue-50 text-blue-700';
    case 'Middle': return 'bg-purple-50 text-purple-700';
    case 'High School': return 'bg-brand-50 text-brand-700';
    case 'College': return 'bg-amber-50 text-amber-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

async function fetchSchools(lat: number, lng: number): Promise<School[]> {
  const radius = 3200; // ~2 miles
  const query = `[out:json][timeout:10];
(
  node["amenity"="school"](around:${radius},${lat},${lng});
  way["amenity"="school"](around:${radius},${lat},${lng});
  node["amenity"="college"](around:${radius},${lat},${lng});
  way["amenity"="college"](around:${radius},${lat},${lng});
  node["amenity"="university"](around:${radius},${lat},${lng});
  way["amenity"="university"](around:${radius},${lat},${lng});
);
out center;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();

    const schools: School[] = (data.elements ?? [])
      .filter((el: { tags?: Record<string, string> }) => el.tags?.name)
      .map((el: { tags?: Record<string, string>; lat?: number; lon?: number; center?: { lat: number; lon: number } }) => {
        const elLat = el.lat ?? el.center?.lat ?? lat;
        const elLng = el.lon ?? el.center?.lon ?? lng;
        const dist = haversine(lat, lng, elLat, elLng);
        return {
          name: el.tags!.name!,
          type: inferType(el.tags!),
          distanceMiles: dist / 1609.34,
        };
      })
      .filter((s: School) => s.distanceMiles <= 2)
      .sort((a: School, b: School) => a.distanceMiles - b.distanceMiles)
      .slice(0, 6);

    return schools;
  } catch {
    return [];
  }
}

export default async function NearbySchools({ lat, lng }: { lat: number; lng: number }) {
  const schools = await fetchSchools(lat, lng);
  if (schools.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">Schools nearby</h2>
      <p className="mt-1 text-sm text-gray-500">Public and private schools within 2 miles of this property.</p>
      <div className="mt-4 flex flex-col divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {schools.map((school, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <span className="text-2xl">{typeIcon(school.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{school.name}</p>
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeColor(school.type)}`}>
                {school.type}
              </span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-gray-700">{school.distanceMiles.toFixed(1)} mi</p>
              <p className="text-xs text-gray-400">away</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">Source: OpenStreetMap contributors. Verify enrollment zones independently.</p>
    </section>
  );
}
