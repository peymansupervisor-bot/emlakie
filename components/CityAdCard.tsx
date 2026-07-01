import type { CityAd } from '@/lib/city-ads';

export default function CityAdCard({ ad }: { ad: CityAd }) {
  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Sponsored</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
        {ad.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.logo}
            alt={`${ad.company} logo`}
            className="h-12 w-auto shrink-0 self-start object-contain sm:self-center"
          />
        )}
        <div className="flex-1">
          <p className="font-bold text-gray-900">{ad.company}</p>
          <p className="mt-0.5 text-sm text-gray-600">{ad.description}</p>
          <p className="mt-1 text-xs text-gray-400">{ad.tagline} · {ad.phone}</p>
        </div>
        <a
          href={ad.url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="shrink-0 rounded-lg bg-brand-700 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800"
        >
          Visit {ad.company}
        </a>
      </div>
    </section>
  );
}
