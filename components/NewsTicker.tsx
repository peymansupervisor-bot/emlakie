const FALLBACK_HEADLINES = [
  { title: 'Mortgage rates dip for third straight week, boosting homebuyer demand' },
  { title: 'Rental vacancy rates hit 5-year low as demand outpaces supply in major metros' },
  { title: 'Single-family rentals see record rent growth in Sun Belt cities' },
  { title: 'Fed signals potential rate cut, giving housing market a lift' },
  { title: 'Multifamily construction permits surge 12% year-over-year' },
  { title: 'Renters spend average of 30% of income on housing — experts weigh in' },
  { title: 'New inventory of affordable rentals jumps in Midwest markets' },
  { title: 'Short-term rental market stabilizes after post-pandemic boom' },
];

interface Headline { title: string }

async function fetchHeadlines(): Promise<Headline[]> {
  try {
    const res = await fetch('https://www.inman.com/feed/', {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return FALLBACK_HEADLINES;
    const xml = await res.text();
    const matches = Array.from(xml.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<\/item>/g));
    const items: Headline[] = matches.slice(0, 10).map(m => ({ title: m[1].trim() }));
    return items.length >= 4 ? items : FALLBACK_HEADLINES;
  } catch {
    return FALLBACK_HEADLINES;
  }
}

export default async function NewsTicker() {
  const headlines = await fetchHeadlines();
  // Duplicate for seamless loop
  const items = [...headlines, ...headlines];

  return (
    <div className="w-full bg-brand-600 text-white overflow-hidden">
      <div className="flex items-center">
        <span className="shrink-0 bg-brand-700 px-3 py-2 text-xs font-bold uppercase tracking-widest z-10">
          News
        </span>
        <div className="relative flex-1 overflow-hidden py-2">
          <div
            className="flex gap-0 animate-marquee motion-reduce:animate-none whitespace-nowrap"
            style={{ width: 'max-content' }}
          >
            {items.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-6 text-sm font-medium text-green-50"
              >
                <span className="text-green-300 select-none" aria-hidden="true">●</span>
                {h.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
