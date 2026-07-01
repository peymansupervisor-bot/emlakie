import Link from 'next/link';
import { getTrendingCities } from '@/lib/api';

export default async function TrendingCities() {
  const cities = await getTrendingCities(8);
  if (cities.length === 0) return null;

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {cities.map((c) => (
          <Link
            key={c.slug}
            href={`/rentals/city/${c.slug}`}
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <span className="text-gray-900">{c.city}</span>
            {c.avgRent > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 transition group-hover:bg-brand-50 group-hover:text-brand-700">
                avg ${c.avgRent.toLocaleString()}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
