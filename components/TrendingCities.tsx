import Link from 'next/link';
import { getTrendingCities } from '@/lib/api';

export default async function TrendingCities() {
  const cities = await getTrendingCities(8);
  if (cities.length === 0) return null;

  return (
    <div className="mt-6 w-full max-w-2xl mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Trending cities</p>
      <div className="flex flex-wrap justify-center gap-2">
        {cities.map((c) => (
          <Link
            key={c.slug}
            href={`/rentals/city/${c.slug}`}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 hover:shadow-card-hover"
          >
            <span>{c.city}</span>
            {c.avgRent > 0 && (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600 group-hover:bg-brand-100">
                avg ${c.avgRent.toLocaleString()}/mo
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
