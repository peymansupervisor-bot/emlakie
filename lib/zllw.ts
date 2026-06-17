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
  listPriceLow: number | null;
  priceHistory: ZllwPriceEvent[];
  zpid: number | null;
}

export async function getPropertyData(address: string): Promise<ZllwPropertyData | null> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return null;

  try {
    const url = `https://zllw-working-api.p.rapidapi.com/pro/byaddress?propertyaddress=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'zllw-working-api.p.rapidapi.com',
        'x-rapidapi-key': key,
      },
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    const pd = data?.propertyDetails;
    if (!pd) return null;

    const raw: ZllwPriceEvent[] = (pd.priceHistory ?? []).filter(
      (e: ZllwPriceEvent) => e.event && (e.price != null || e.event === 'Sold')
    );

    return {
      yearBuilt: pd.yearBuilt ?? null,
      livingArea: pd.livingArea ?? null,
      lotSize: pd.lotSize ?? null,
      homeType: pd.homeType ?? null,
      zestimate: pd.zestimate ?? null,
      listPriceLow: pd.listPriceLow ?? null,
      priceHistory: raw.slice(0, 10),
      zpid: pd.zpid ?? null,
    };
  } catch {
    return null;
  }
}
