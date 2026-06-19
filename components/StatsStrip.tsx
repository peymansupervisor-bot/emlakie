import { getStats } from '@/lib/api';

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return n.toString();
}

export default async function StatsStrip() {
  const stats = await getStats();

  const items = [
    { value: stats.listings > 0 ? fmt(stats.listings) : '500+', label: 'active listings' },
    { value: stats.cities > 0 ? fmt(stats.cities) : '80+', label: 'cities' },
    { value: stats.landlords > 0 ? fmt(stats.landlords) : '200+', label: 'landlords' },
  ];

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
        </span>
        Live
      </span>
      {items.map((item, i) => (
        <span key={i} className="flex items-baseline gap-1">
          <span className="text-lg font-extrabold text-gray-900">{item.value}</span>
          <span className="text-xs text-gray-500">{item.label}</span>
        </span>
      ))}
    </div>
  );
}
