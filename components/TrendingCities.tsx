import Link from 'next/link';
import { getTrendingCities } from '@/lib/api';

export default async function TrendingCities() {
  const cities = await getTrendingCities(8);
  if (cities.length === 0) return null;

  return (
    <div className="mt-5">
      <p className="text-xs font-medium text-gray-400 mb-2.5">Trending cities</p>
      <div className="flex flex-wrap justify-center gap-2">
        {cities.map((c) => (
          <Link
            key={c.slug}
            href={`/rentals/city/${c.slug}`}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {c.city}
            {c.avgRent > 0 && (
              <span className="text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                ${c.avgRent.toLocaleString()}/mo
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
