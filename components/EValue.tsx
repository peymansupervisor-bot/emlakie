'use client'

import { EValueResult } from '@/lib/e-value'

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// Bar spans E-Rent × 0.52 → × 1.48 (±48% range)
const BAR_MIN = 0.52
const BAR_MAX = 1.48

function needlePct(lastRent: number, eRent: number): number {
  const min = eRent * BAR_MIN
  const max = eRent * BAR_MAX
  return Math.max(1.5, Math.min(98.5, ((lastRent - min) / (max - min)) * 100))
}

function marketPosition(lastRent: number, eRent: number): {
  label: string
  sublabel: string
  color: string
  bgColor: string
} {
  const r = lastRent / eRent
  if (r < 0.82)  return { label: 'Well Below Market', sublabel: 'Significantly under market rate', color: 'text-red-700',    bgColor: 'bg-red-50 border-red-200' }
  if (r < 0.93)  return { label: 'Below Market',      sublabel: 'Priced below comparable units',  color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' }
  if (r <= 1.07) return { label: 'Fair Market Value', sublabel: 'In line with local comparables', color: 'text-brand-700', bgColor: 'bg-brand-50 border-brand-200' }
  if (r <= 1.18) return { label: 'Above Market',      sublabel: 'Priced above comparable units',  color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' }
  return              { label: 'Well Above Market',   sublabel: 'Significantly over market rate',  color: 'text-red-700',    bgColor: 'bg-red-50 border-red-200' }
}

const confidenceConfig = {
  high:   { label: 'High confidence',   color: 'text-brand-700 bg-brand-50 border-brand-200', dot: 'bg-brand-500' },
  medium: { label: 'Medium confidence', color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
  low:    { label: 'Low confidence',    color: 'text-gray-600  bg-gray-50  border-gray-200',  dot: 'bg-gray-400'  },
}

export default function EValue({ ev }: { ev: EValueResult }) {
  const conf = confidenceConfig[ev.confidence]
  const pct  = needlePct(ev.lastRent, ev.eRent)
  const pos  = marketPosition(ev.lastRent, ev.eRent)
  const shift = ev.lastRent !== ev.eRent
    ? Math.round(((ev.lastRent - ev.eRent) / ev.eRent) * 100)
    : 0

  return (
    <section aria-label="E-Value estimate" className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-gray-900">E-rent Value™ &amp; E-sale Value™</span>
            <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-bold text-white tracking-wide">
              by EMLAKIE
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            {ev.isManualOverride
              ? 'Estimate set by EMLAKIE based on direct market knowledge of this property'
              : ev.comparablesCount >= 3
                ? `Automated rental market estimate based on ${ev.comparablesCount} active comparables in this area`
                : 'Based on asking price — insufficient market comparables in this area'}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${conf.color}`}>
          <span className={`h-2 w-2 rounded-full ${conf.dot}`} />
          {conf.label}
        </span>
      </div>

      {/* E-Rent + E-Sale value cards */}
      <div className={`mt-6 grid gap-4 ${ev.showSale ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 max-w-xs'}`}>
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-700">E-rent Value™</p>
          <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900 whitespace-nowrap">{fmt(ev.eRent)}</p>
          <p className="mt-0.5 text-sm text-gray-500">estimated / month</p>
          <p className="mt-2 text-xs text-gray-500">
            Range: {fmt(ev.priceRange.min)} – {fmt(ev.priceRange.max)}/mo
          </p>
        </div>

        {ev.showSale && ev.eSale !== null && (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-600">E-sale Value™</p>
            <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900 whitespace-nowrap">{fmt(ev.eSale)}</p>
            <p className="mt-0.5 text-sm text-gray-500">estimated sale value</p>
            <p className="mt-2 text-xs text-gray-500">
              {ev.capRate}% cap rate · income approach
            </p>
          </div>
        )}
      </div>

      {/* E-Sale not applicable */}
      {!ev.showSale && ev.saleNotApplicableReason && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm font-semibold text-gray-700">Why no E-Sale value?</p>
          <p className="mt-1 text-sm text-gray-600">{ev.saleNotApplicableReason}</p>
        </div>
      )}

      {/* ── Market Position Gauge ── */}
      {ev.lastRent > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Market Position</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${pos.bgColor} ${pos.color}`}>
              {pos.label}
            </span>
          </div>

          {/* Gradient bar */}
          <div className="relative">
            {/* The bar */}
            <div
              className="h-5 w-full rounded-full"
              style={{
                background: 'linear-gradient(to right, #dc2626 0%, #ef4444 12%, #f59e0b 26%, #22c55e 42%, #16a34a 50%, #22c55e 58%, #f59e0b 74%, #ef4444 88%, #dc2626 100%)',
              }}
              role="img"
              aria-label={`Market position gauge. Last listed price ${fmt(ev.lastRent)} is ${pos.label.toLowerCase()}.`}
            />

            {/* Needle */}
            <div
              className="absolute top-0 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {/* Stem line */}
              <div className="mx-auto w-0.5 h-5 bg-gray-900" />
              {/* Diamond marker */}
              <div className="mx-auto mt-0.5 h-3 w-3 rotate-45 border-2 border-gray-900 bg-white" />
            </div>

            {/* Needle label — pinned below the marker */}
            <div
              className="absolute mt-1 -translate-x-1/2"
              style={{ left: `${pct}%`, top: '100%' }}
            >
              <div className="mt-3 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-center shadow-sm">
                <p className="text-xs font-bold text-gray-900">{fmt(ev.lastRent)}/mo</p>
                <p className="text-[10px] text-gray-500">Last listed</p>
              </div>
            </div>
          </div>

          {/* Bar axis labels */}
          <div className="mt-12 flex justify-between text-[11px] font-semibold">
            <span className="text-red-600">← Below Market<br/><span className="font-normal text-gray-500">{fmt(Math.round(ev.eRent * BAR_MIN))}</span></span>
            <span className="text-center text-brand-700">Fair Value<br/><span className="font-normal text-gray-500">{fmt(ev.eRent)}</span></span>
            <span className="text-right text-red-600">Above Market →<br/><span className="font-normal text-gray-500">{fmt(Math.round(ev.eRent * BAR_MAX))}</span></span>
          </div>

          {/* Market shift summary */}
          <div className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${pos.bgColor}`}>
            <span className={`text-2xl font-extrabold ${pos.color}`}>
              {shift === 0 ? '=' : shift > 0 ? `+${shift}%` : `${shift}%`}
            </span>
            <div>
              <p className={`text-sm font-bold ${pos.color}`}>{pos.label}</p>
              <p className="text-xs text-gray-600">{pos.sublabel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Appraiser note */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-start gap-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold text-gray-700">Licensed appraisers:</span> EMLAKIE rental comp data is available for income-approach valuations.
          Contact <a href="mailto:appraisers@emlakie.com" className="font-semibold text-brand-600 hover:underline">appraisers@emlakie.com</a> for comp exports.
        </p>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        E-rent Value™ and E-sale Value™ are EMLAKIE&apos;s automated estimates based on active comparable listings and are not a
        licensed appraisal. Actual rental and sale values may vary. Consult a licensed real estate
        professional for a precise valuation.
      </p>
    </section>
  )
}
