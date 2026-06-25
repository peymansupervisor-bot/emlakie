import { getStats } from '@/lib/api';

function fmt(n: number, floor: number): string {
  const display = Math.max(n, floor);
  if (display >= 1000) return `${(display / 1000).toFixed(1).replace(/\.0$/, '')}k+`;
  return `${display}+`;
}

export default async function StatsStrip() {
  const stats = await getStats();

  const items = [
    { value: fmt(stats.listings, 500), label: 'Active Listings' },
    { value: fmt(stats.cities, 80), label: 'Cities' },
    { value: fmt(stats.landlords, 200), label: 'Landlords' },
  ];

  return (
    <div className="mt-5 w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-3 divide-x divide-gray-200 rounded-2xl border border-gray-200 bg-white shadow-card">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center py-4 px-2">
            <span className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{item.value}</span>
            <span className="mt-0.5 text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
