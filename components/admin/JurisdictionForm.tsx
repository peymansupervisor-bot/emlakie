'use client'

import { useFormStatus } from 'react-dom'
import type { JurisdictionRow, StateRow } from '@/lib/admin/jurisdictions'

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-60"
    >
      {pending && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {pending ? 'Saving…' : label}
    </button>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 w-full'

interface Props {
  action: (formData: FormData) => Promise<void>
  jurisdiction?: JurisdictionRow
  states: StateRow[]
  error?: string
  submitLabel: string
}

export default function JurisdictionForm({ action, jurisdiction, states, error, submitLabel }: Props) {
  const j = jurisdiction

  return (
    <form action={action} className="space-y-8">
      {j && <input type="hidden" name="id" value={j.id} />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Core identity */}
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Core Identity</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" required>
            <input name="name" type="text" defaultValue={j?.name ?? ''} required className={inputCls} placeholder="e.g. Los Angeles" />
          </Field>
          <Field label="Short Name">
            <input name="short_name" type="text" defaultValue={j?.short_name ?? ''} className={inputCls} placeholder="e.g. LA (defaults to name)" />
          </Field>
          <Field label="SEO Slug" required>
            <input name="seo_slug" type="text" defaultValue={j?.seo_slug ?? ''} required className={inputCls} placeholder="e.g. los-angeles-ca" />
          </Field>
          <Field label="Jurisdiction Type" required>
            <select name="jurisdiction_type" defaultValue={j?.jurisdiction_type ?? 'city'} className={inputCls}>
              <option value="city">City</option>
              <option value="county">County</option>
              <option value="state">State</option>
            </select>
          </Field>
          <Field label="State" required>
            <select name="state_id" defaultValue={j?.state_id ?? ''} required className={inputCls}>
              <option value="">Select a state…</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Compliance settings */}
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Compliance Settings</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select name="status" defaultValue={j?.status ?? 'pending'} className={inputCls}>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="no_requirement">No Requirement</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Interest Required">
            <select name="interest_required" defaultValue={j?.interest_required ? 'true' : 'false'} className={inputCls}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </Field>
          <Field label="Priority Tier (1 = highest)">
            <select name="priority_tier" defaultValue={String(j?.priority_tier ?? 3)} className={inputCls}>
              <option value="1">1 — Critical</option>
              <option value="2">2 — High</option>
              <option value="3">3 — Normal</option>
              <option value="4">4 — Low</option>
              <option value="5">5 — Minimal</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Verification */}
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Verification</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Official Housing Authority URL">
            <input name="official_housing_authority_url" type="url" defaultValue={j?.official_housing_authority_url ?? ''} className={inputCls} placeholder="https://…" />
          </Field>
          <Field label="Verification Source URL">
            <input name="verification_source_url" type="url" defaultValue={j?.verification_source_url ?? ''} className={inputCls} placeholder="https://…" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Verification Notes">
              <textarea name="verification_notes" rows={3} defaultValue={j?.verification_notes ?? ''} className={inputCls} />
            </Field>
          </div>
        </div>
      </section>

      {/* SEO (optional) */}
      <section>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">SEO (optional)</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Meta Title">
            <input name="meta_title" type="text" defaultValue={j?.meta_title ?? ''} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Meta Description">
              <textarea name="meta_description" rows={2} defaultValue={j?.meta_description ?? ''} className={inputCls} />
            </Field>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 pt-4">
        <SubmitBtn label={submitLabel} />
      </div>
    </form>
  )
}
