import { getMarketPulse } from '@/lib/api';

export default async function MarketPulse() {
  const pulse = await getMarketPulse();
  if (pulse.length === 0) return null;

  const weekLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">This week in rentals</p>
            <p className="mt-0.5 text-xs text-gray-500">Avg asking rent · Updated {weekLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {pulse.map(p => (
              <div key={p.label} className="min-w-[76px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
                <p className="text-lg font-extrabold text-gray-900">${p.avgRent.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
