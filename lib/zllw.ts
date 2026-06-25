export interface ZllwPriceEvent {
  date: string;
  price: number | null;
  pricePerSquareFoot: number | null;
  event: string;
  source: string;
}

export interface ZllwPropertyData {
  yearBuilt: number | null;
  livingArea: number | null;
  lotSize: number | null;
  homeType: string | null;
  zestimate: number | null;
  rentZestimate: number | null;
  listPriceLow: number | null;
  priceHistory: ZllwPriceEvent[];
  zpid: number | null;
  latitude: number | null;
  longitude: number | null;
}

const HEADERS = (key: string) => ({
  'Content-Type': 'application/json',
  'x-rapidapi-host': 'zllw-working-api.p.rapidapi.com',
  'x-rapidapi-key': key,
});

export async function getPropertyData(address: string): Promise<ZllwPropertyData | null> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return null;

  try {
    const propRes = await fetch(
      `https://zllw-working-api.p.rapidapi.com/pro/byaddress?propertyaddress=${encodeURIComponent(address)}`,
      { headers: HEADERS(key), next: { revalidate: 86400 } }
    );
    const propData = await propRes.json();
    const pd = propData?.propertyDetails;
    if (!pd) return null;

    // Use zpid (Zillow Property ID) for the rent call — unambiguous, works for any address
    const zpid = pd.zpid;
    const rentRes = await fetch(
      `https://zllw-working-api.p.rapidapi.com/graph_charts?byzpid=${zpid}&which=rent_zestimate_history&recent_first=True`,
      { headers: HEADERS(key), next: { revalidate: 86400 } }
    );
    const rentData = await rentRes.json();

    const rentPoints: { x: number; y: number }[] = rentData?.DataPoints?.homeValueChartData?.[0]?.points ?? [];
    const rentZestimate = rentPoints.length > 0 ? rentPoints[0].y : null;

    const raw: ZllwPriceEvent[] = (pd.priceHistory ?? []).filter(
      (e: ZllwPriceEvent) => e.event && (e.price != null || e.event === 'Sold')
    );

    return {
      yearBuilt: pd.yearBuilt ?? null,
      livingArea: pd.livingArea ?? null,
      lotSize: pd.lotSize ?? null,
      homeType: pd.homeType ?? null,
      zestimate: pd.zestimate ?? null,
      rentZestimate,
      listPriceLow: pd.listPriceLow ?? null,
      priceHistory: raw.slice(0, 10),
      zpid: pd.zpid ?? null,
      latitude: pd.latitude ?? null,
      longitude: pd.longitude ?? null,
    };
  } catch {
    return null;
  }
}
