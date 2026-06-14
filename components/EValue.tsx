import { EValueResult } from '@/lib/e-value'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const confidenceConfig = {
  high:   { label: 'High confidence',   color: 'text-brand-700 bg-brand-50 border-brand-200',   dot: 'bg-brand-500' },
  medium: { label: 'Medium confidence', color: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-400' },
  low:    { label: 'Low confidence',    color: 'text-gray-600  bg-gray-50  border-gray-200',    dot: 'bg-gray-400'  },
}

export default function EValue({ ev }: { ev: EValueResult }) {
  const conf = confidenceConfig[ev.confidence]

  return (
    <section aria-label="E-Value estimate" className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-gray-900">E-Value</span>
            <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white tracking-wide">
              by EMLAKIE
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            Estimated current market value based on comparable active listings
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${conf.color}`}>
          <span className={`h-2 w-2 rounded-full ${conf.dot}`} />
          {conf.label} · {ev.comparablesCount} comp{ev.comparablesCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Two big numbers */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-brand-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">E-Rent</p>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">{fmt(ev.eRent)}</p>
          <p className="mt-0.5 text-sm text-gray-500">estimated / month</p>
          <p className="mt-2 text-xs text-gray-400">
            Range: {fmt(ev.priceRange.min)} – {fmt(ev.priceRange.max)}/mo
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-600">E-Sale</p>
          <p className="mt-1 text-3xl font-extrabold text-gray-900">{fmt(ev.eSale)}</p>
          <p className="mt-0.5 text-sm text-gray-500">estimated sale value</p>
          <p className="mt-2 text-xs text-gray-400">
            Based on {ev.capRate}% cap rate
          </p>
        </div>
      </div>

      {/* Last rent vs E-Rent comparison */}
      {ev.lastRent > 0 && (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last listed rent</span>
            <span className="font-semibold text-gray-900">{fmt(ev.lastRent)}/mo</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">vs. current market</span>
            {ev.eRent !== ev.lastRent && (
              <span className={`font-semibold ${ev.eRent > ev.lastRent ? 'text-brand-700' : 'text-red-600'}`}>
                {ev.eRent > ev.lastRent ? '▲' : '▼'}{' '}
                {Math.abs(Math.round(((ev.eRent - ev.lastRent) / ev.lastRent) * 100))}% market shift
              </span>
            )}
            {ev.eRent === ev.lastRent && (
              <span className="font-semibold text-gray-600">At market rate</span>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-gray-400 leading-relaxed">
        E-Value is EMLAKIE&apos;s automated estimate based on comparable active listings and is not an
        appraisal. Actual rental and sale values may vary. For a precise valuation, consult a
        licensed real estate professional.
      </p>
    </section>
  )
}
