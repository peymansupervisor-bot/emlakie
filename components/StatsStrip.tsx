import { getStats } from '@/lib/api';

function fmt(n: number, floor: number): string {
  const display = Math.max(n, floor);
  if (display >= 1000) return `${(display / 1000).toFixed(1).replace(/\.0$/, '')}k+`;
  return `${display}+`;
}

export default async function StatsStrip() {
  const stats = await getStats();

  const items = [
    { value: fmt(stats.listings, 500), label: 'homes listed' },
    { value: fmt(stats.cities, 80), label: 'cities covered' },
    { value: fmt(stats.landlords, 200), label: 'landlords' },
  ];

  return (
    <div className="mt-5 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-1 mb-2">
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">Live platform stats</span>
      </div>
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
