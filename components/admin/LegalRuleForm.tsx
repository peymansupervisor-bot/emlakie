'use client'

import { useState, useTransition } from 'react'
import type { RuleTypeRow } from '@/lib/admin/ruleTypes'

const ENUM_LABELS: Record<string, string> = {
  annual: 'Annual',
  monthly: 'Monthly',
  simple: 'Simple interest',
  compound: 'Compound interest',
  cash: 'Cash payment',
  rent_credit: 'Rent credit',
  landlord_choice: "Landlord's choice",
  annually: 'Annually',
  at_termination: 'At lease termination',
  with_deposit_refund: 'With deposit refund',
  deposit_receipt_date: 'Date deposit received',
  move_in_date: 'Move-in date',
  lease_start_date: 'Lease start date',
  fixed: 'Fixed rate',
  locally_set_annual: 'Set annually by local authority',
  cpi_linked: 'Tied to CPI',
  treasury_linked: 'Tied to US Treasury rate',
  passbook_savings_rate: 'Passbook savings rate',
}

interface Citation {
  id: string
  code_name: string
  section: string
  full_citation_formatted: string | null
}

interface Props {
  jurisdictionId: string
  jurisdictionName: string
  ruleTypes: RuleTypeRow[]
  citations: Citation[]
  action: (prevState: unknown, formData: FormData) => Promise<{ error: string } | void>
}

export default function LegalRuleForm({
  jurisdictionId,
  jurisdictionName,
  ruleTypes,
  citations,
  action,
}: Props) {
  const [selectedRuleTypeId, setSelectedRuleTypeId] = useState('')
  const [ruleApplies, setRuleApplies] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedRuleType = ruleTypes.find((rt) => rt.id === selectedRuleTypeId)
  const schema = selectedRuleType?.parameter_schema ?? {}
  const schemaEntries = Object.entries(schema)

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await action(null, formData)
      if (result && 'error' in result) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Hidden jurisdiction id */}
      <input type="hidden" name="jurisdiction_id" value={jurisdictionId} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Core fields */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700">Rule Details</h2>

        {/* Rule type */}
        <div className="flex flex-col gap-1">
          <label htmlFor="rule_type_id" className="text-xs font-semibold text-gray-500">
            Rule Type <span className="text-red-500">*</span>
          </label>
          <select
            id="rule_type_id"
            name="rule_type_id"
            value={selectedRuleTypeId}
            onChange={(e) => setSelectedRuleTypeId(e.target.value)}
            required
            className="max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">Select a rule type…</option>
            {ruleTypes
              .filter((rt) => rt.is_active)
              .map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
          </select>
          {selectedRuleType?.description && (
            <p className="text-xs text-gray-400">{selectedRuleType.description}</p>
          )}
        </div>

        {/* Effective date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="effective_date" className="text-xs font-semibold text-gray-500">
            Effective Date <span className="text-red-500">*</span>
          </label>
          <input
            id="effective_date"
            name="effective_date"
            type="date"
            required
            className="max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400">
            The date this rule version takes legal effect. If a current rule exists for this
            jurisdiction + rule type, it will be superseded on this date.
          </p>
        </div>

        {/* Rule applies toggle */}
        <div className="flex flex-col gap-1">
          <label htmlFor="rule_applies" className="text-xs font-semibold text-gray-500">
            Rule Applies? <span className="text-red-500">*</span>
          </label>
          <select
            id="rule_applies"
            name="rule_applies"
            value={ruleApplies ? 'true' : 'false'}
            onChange={(e) => setRuleApplies(e.target.value === 'true')}
            className="max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="true">Yes — this jurisdiction has this requirement</option>
            <option value="false">No — not applicable here</option>
          </select>
        </div>

        {/* Not applicable reason */}
        {!ruleApplies && (
          <div className="flex flex-col gap-1">
            <label htmlFor="not_applicable_reason" className="text-xs font-semibold text-gray-500">
              Not Applicable Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="not_applicable_reason"
              name="not_applicable_reason"
              rows={2}
              required={!ruleApplies}
              placeholder="e.g. State law does not require security deposit interest."
              className="max-w-lg rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        )}

        {/* Citation */}
        <div className="flex flex-col gap-1">
          <label htmlFor="citation_id" className="text-xs font-semibold text-gray-500">
            Legal Citation (optional)
          </label>
          {citations.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              No citations exist for {jurisdictionName}. Add citations first if needed.
            </p>
          ) : (
            <select
              id="citation_id"
              name="citation_id"
              className="max-w-lg rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">None</option>
              {citations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_citation_formatted ?? `${c.code_name} §${c.section}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Change reason */}
        <div className="flex flex-col gap-1">
          <label htmlFor="change_reason" className="text-xs font-semibold text-gray-500">
            Change Reason <span className="text-red-500">*</span>
          </label>
          <input
            id="change_reason"
            name="change_reason"
            type="text"
            required
            placeholder="e.g. Annual rate update, new ordinance effective Jan 2024"
            className="max-w-lg rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400">Logged to audit history. Required.</p>
        </div>
      </div>

      {/* Dynamic parameter fields */}
      {ruleApplies && selectedRuleType && schemaEntries.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              Parameters — {selectedRuleType.name}
            </h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Fields defined by the rule type schema. All required fields must be filled.
            </p>
          </div>

          {schemaEntries.map(([key, field]) => (
            <div key={key} className="flex flex-col gap-1">
              <label htmlFor={`param_${key}`} className="text-xs font-semibold text-gray-500">
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
              </label>

              {field.type === 'enum' && field.values ? (
                <select
                  id={`param_${key}`}
                  name={`param_${key}`}
                  defaultValue={field.default !== undefined ? String(field.default) : ''}
                  className="max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {!field.required && <option value="">— Select —</option>}
                  {field.values.map((v) => (
                    <option key={v} value={v}>
                      {ENUM_LABELS[v] ?? v}
                    </option>
                  ))}
                </select>
              ) : field.type === 'boolean' ? (
                <select
                  id={`param_${key}`}
                  name={`param_${key}`}
                  defaultValue={
                    field.default !== undefined ? String(field.default) : ''
                  }
                  className="max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {!field.required && <option value="">— Select —</option>}
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : field.type === 'integer' ? (
                <input
                  id={`param_${key}`}
                  name={`param_${key}`}
                  type="number"
                  step="1"
                  min={field.min}
                  max={field.max}
                  defaultValue={
                    field.default !== undefined ? String(field.default) : ''
                  }
                  className="max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              ) : field.type === 'decimal' ? (
                <input
                  id={`param_${key}`}
                  name={`param_${key}`}
                  type="number"
                  step="any"
                  defaultValue={
                    field.default !== undefined ? String(field.default) : ''
                  }
                  className="max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              ) : (
                <input
                  id={`param_${key}`}
                  name={`param_${key}`}
                  type="text"
                  defaultValue={
                    field.default !== undefined ? String(field.default) : ''
                  }
                  className="max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              )}

              {field.help && (
                <p className="text-xs text-gray-400">{field.help}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {ruleApplies && selectedRuleType && schemaEntries.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-4 text-xs text-gray-400">
          This rule type has no configurable parameters.
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-60"
        >
          {isPending && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {isPending ? 'Saving…' : 'Create Legal Rule'}
        </button>
        <a
          href={`/admin/jurisdictions/${jurisdictionId}/rules`}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
