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

function scoreLabel(score: number): string {
  if (score >= 90) return "Exceptional";
  if (score >= 70) return "Very Good";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Limited";
  return "Car-Dependent";
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-brand-600";
  if (score >= 45) return "bg-yellow-500";
  return "bg-gray-400";
}

function scoreTextColor(score: number): string {
  if (score >= 70) return "text-brand-700";
  if (score >= 45) return "text-yellow-600";
  return "text-gray-500";
}

interface Scores {
  walk: number;
  transit: number;
  bike: number;
}

async function fetchScores(lat: number, lng: number): Promise<Scores | null> {
  const walkTags = [
    'amenity=restaurant', 'amenity=fast_food', 'amenity=cafe',
    'shop=supermarket', 'shop=grocery', 'shop=convenience', 'shop=bakery',
    'amenity=school', 'amenity=pharmacy', 'amenity=bank',
    'amenity=bar', 'amenity=pub', 'leisure=park',
  ];
  const transitTags = [
    'highway=bus_stop', 'amenity=bus_station',
    'railway=station', 'railway=subway_entrance', 'railway=tram_stop',
  ];
  const bikeTags = [
    'cycleway=lane', 'cycleway=track', 'highway=cycleway',
    'amenity=bicycle_rental', 'amenity=bicycle_parking',
  ];

  const buildNodes = (tags: string[], radius: number) =>
    tags.flatMap((t) => {
      const [k, v] = t.split('=');
      return [
        `node["${k}"="${v}"](around:${radius},${lat},${lng});`,
        `way["${k}"="${v}"](around:${radius},${lat},${lng});`,
      ];
    }).join('\n');

  const query = `[out:json][timeout:12];
(
${buildNodes(walkTags, 1600)}
${buildNodes(transitTags, 800)}
${buildNodes(bikeTags, 1200)}
);
out center;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const elements: Array<{
      tags?: Record<string, string>;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
    }> = data.elements ?? [];

    const walkTagSet = new Set(walkTags.map((t) => t.split('=')[1]));
    const transitTagSet = new Set(transitTags.map((t) => t.split('=')[1]));
    const bikeTagSet = new Set(bikeTags.map((t) => t.split('=')[1]));

    let walkPoints = 0;
    let transitPoints = 0;
    let bikePoints = 0;

    for (const el of elements) {
      const elLat = el.lat ?? el.center?.lat ?? lat;
      const elLng = el.lon ?? el.center?.lon ?? lng;
      const dist = haversine(lat, lng, elLat, elLng);
      const tagVals = Object.values(el.tags ?? {});

      const isWalk = tagVals.some((v) => walkTagSet.has(v));
      const isTransit = tagVals.some((v) => transitTagSet.has(v));
      const isBike = tagVals.some((v) => bikeTagSet.has(v));

      if (isWalk) {
        if (dist < 400) walkPoints += 10;
        else if (dist < 800) walkPoints += 5;
        else walkPoints += 2;
      }
      if (isTransit) {
        if (dist < 400) transitPoints += 15;
        else transitPoints += 7;
      }
      if (isBike) {
        bikePoints += dist < 600 ? 12 : 5;
      }
    }

    return {
      walk: Math.min(100, Math.round(walkPoints * 1.2)),
      transit: Math.min(100, Math.round(transitPoints * 1.5)),
      bike: Math.min(100, Math.round(bikePoints * 2)),
    };
  } catch {
    return null;
  }
}

function ScoreBar({ label, icon, score }: { label: string; icon: React.ReactNode; score: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          {icon}
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${scoreTextColor(score)}`}>{scoreLabel(score)}</span>
          <span className="text-lg font-extrabold text-gray-900 w-8 text-right">{score}</span>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${score} out of 100`}
          className={`h-full rounded-full transition-all ${scoreColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default async function NeighborhoodScores({ lat, lng }: { lat: number; lng: number }) {
  const scores = await fetchScores(lat, lng);
  if (!scores) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-gray-900">Neighborhood mobility</h2>
      <p className="mt-1 text-sm text-gray-500">Scores based on nearby amenities, transit stops, and bike infrastructure.</p>
      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5 flex flex-col gap-5">
        <ScoreBar
          label="Walkability"
          score={scores.walk}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-brand-600" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M13 4a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
              <path d="m9 20 2-6 2 3 3-4" />
              <path d="m7 14 2-4 3 2 2-4" />
            </svg>
          }
        />
        <ScoreBar
          label="Public Transit"
          score={scores.transit}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-brand-600" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="6" width="18" height="13" rx="2" />
              <path d="M3 11h18M8 6V4M16 6V4" />
              <circle cx="8" cy="16" r="1" fill="currentColor" />
              <circle cx="16" cy="16" r="1" fill="currentColor" />
            </svg>
          }
        />
        <ScoreBar
          label="Bikeability"
          score={scores.bike}
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-brand-600" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="5.5" cy="17.5" r="3.5" />
              <circle cx="18.5" cy="17.5" r="3.5" />
              <path d="M15 6a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
              <path d="m12 17.5-2-5 4-2 2.5 3.5M8.5 9H12l2.5 4" />
            </svg>
          }
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">Estimated scores based on OpenStreetMap data. Actual experience may vary.</p>
    </section>
  );
}
