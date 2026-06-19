const FALLBACK_HEADLINES = [
  { title: 'Mortgage rates dip for third straight week, boosting homebuyer demand', link: 'https://www.inman.com' },
  { title: 'Rental vacancy rates hit 5-year low as demand outpaces supply in major metros', link: 'https://www.inman.com' },
  { title: "Single-family rentals see record rent growth in Sun Belt cities", link: 'https://www.inman.com' },
  { title: 'Fed signals potential rate cut, giving housing market a lift', link: 'https://www.inman.com' },
  { title: 'Multifamily construction permits surge 12% year-over-year', link: 'https://www.inman.com' },
  { title: 'Renters spend average of 30% of income on housing — experts weigh in', link: 'https://www.inman.com' },
  { title: 'New inventory of affordable rentals jumps in Midwest markets', link: 'https://www.inman.com' },
  { title: "Short-term rental market stabilizes after post-pandemic boom", link: 'https://www.inman.com' },
];

interface Headline { title: string; link: string }

async function fetchHeadlines(): Promise<Headline[]> {
  try {
    const res = await fetch('https://www.inman.com/feed/', {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return FALLBACK_HEADLINES;
    const xml = await res.text();
    const matches = Array.from(xml.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/g));
    const items: Headline[] = matches.slice(0, 10).map(m => ({ title: m[1].trim(), link: m[2].trim() }));
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
            className="flex gap-0 animate-marquee whitespace-nowrap"
            style={{ width: 'max-content' }}
          >
            {items.map((h, i) => (
              <a
                key={i}
                href={h.link}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 text-sm font-medium text-green-50 hover:text-white transition-colors"
              >
                <span className="text-green-300 select-none" aria-hidden="true">●</span>
                {h.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
