'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import { createRateAction } from '../actions'
import SubmitButton from '@/components/admin/SubmitButton'
import Link from 'next/link'

interface RuleOption {
  id: string
  rule_name: string
  version_number: number
  is_current: boolean
  effective_date: string
  rule_type: { id: string; name: string; slug: string } | null
}

interface Props {
  jurisdictionId: string
  currentRules: RuleOption[]
  historicalRules: RuleOption[]
}

const COMMON_RATE_KEYS = [
  { value: 'annual_interest_rate', label: 'Annual Interest Rate' },
  { value: 'monthly_interest_rate', label: 'Monthly Interest Rate' },
]

function fmtDate(val: string) {
  return new Date(val).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

export default function RateForm({ jurisdictionId, currentRules, historicalRules }: Props) {
  const boundAction = createRateAction.bind(null, jurisdictionId)
  const [state, action] = useFormState(boundAction, null)
  const [selectedRuleId, setSelectedRuleId] = useState('')

  const allRules = [...currentRules, ...historicalRules]
  const selectedRule = allRules.find((r) => r.id === selectedRuleId)

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Step 1 — Select Legal Rule</h2>
        <p className="text-xs text-gray-500">
          The rate will be permanently linked to the selected rule version and its jurisdiction.
        </p>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Legal Rule <span className="text-red-500">*</span>
          </label>
          <select
            name="legal_rule_id"
            value={selectedRuleId}
            onChange={(e) => setSelectedRuleId(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">Select a legal rule…</option>
            {currentRules.length > 0 && (
              <optgroup label="Current Rules">
                {currentRules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.rule_type?.name ?? 'Unknown'} — v{r.version_number} (effective {fmtDate(r.effective_date)})
                  </option>
                ))}
              </optgroup>
            )}
            {historicalRules.length > 0 && (
              <optgroup label="Historical Rules">
                {historicalRules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.rule_type?.name ?? 'Unknown'} — v{r.version_number} (effective {fmtDate(r.effective_date)})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Rule context confirmation block */}
        {selectedRule && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 space-y-0.5">
            <p className="font-semibold text-blue-900">Rate will be linked to:</p>
            <p>Rule type: <span className="font-semibold">{selectedRule.rule_type?.name ?? '—'}</span></p>
            <p>Version: <span className="font-semibold">v{selectedRule.version_number}</span>{selectedRule.is_current && <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-green-700">Current</span>}</p>
            <p>Effective: <span className="font-semibold">{fmtDate(selectedRule.effective_date)}</span></p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Step 2 — Rate Details</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Rate Key <span className="text-red-500">*</span>
            </label>
            <select
              name="rate_key"
              defaultValue="annual_interest_rate"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              {COMMON_RATE_KEYS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-400">
              Almost always &ldquo;Annual Interest Rate&rdquo; for security deposit interest jurisdictions.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Rate Value (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="numeric_value"
                type="number"
                step="0.0001"
                min="0"
                max="100"
                placeholder="e.g. 2.75"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Enter as a percentage: 2.75 means 2.75% per year.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Effective From <span className="text-red-500">*</span>
            </label>
            <input
              name="effective_from"
              type="date"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              Effective To <span className="text-xs text-gray-400">(leave blank if currently active)</span>
            </label>
            <input
              name="effective_to"
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <p className="mt-1 text-[11px] text-gray-400">Blank = open-ended (rate is still in effect).</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Step 3 — Source &amp; Evidence</h2>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            Source Description <span className="text-red-500">*</span>
          </label>
          <input
            name="rate_source_description"
            type="text"
            placeholder="e.g. Berkeley Rent Board 2026 Annual Rate Announcement"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Source URL</label>
          <input
            name="rate_source_url"
            type="url"
            placeholder="https://…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Internal Notes</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Optional notes for other admins"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <strong>Pending approval.</strong> This rate will be saved as a draft and must be approved by a Superadmin
          before it is used by the compliance engine.
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label="Save Rate (Pending Approval)" pendingLabel="Saving…" />
        <Link
          href={`/admin/jurisdictions/${jurisdictionId}/rates`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
