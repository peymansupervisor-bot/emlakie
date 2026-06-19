import Link from 'next/link';
import { getTrendingCities } from '@/lib/api';

export default async function TrendingCities() {
  const cities = await getTrendingCities(6);
  if (cities.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-2">Trending cities</p>
      {/* Horizontal scroll on mobile, wraps on sm+ */}
      <div className="-mx-4 sm:mx-0">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/rentals/city/${c.slug}`}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 sm:px-4 sm:py-2"
            >
              <span>{c.city}</span>
              {c.avgRent > 0 && (
                <span className="hidden sm:inline rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600 group-hover:bg-brand-100">
                  avg ${c.avgRent.toLocaleString()}/mo
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
