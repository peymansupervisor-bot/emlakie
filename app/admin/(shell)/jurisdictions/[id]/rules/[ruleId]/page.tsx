import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getLegalRule, getRuleHistory } from '@/lib/admin/legalRules'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

function fmtDate(val: string | null | undefined) {
  if (!val) return null
  return new Date(val).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

function fmtDateTime(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-800">{value ?? <span className="text-gray-300">—</span>}</dd>
    </div>
  )
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  create: 'Created',
  superseded: 'Superseded',
  update: 'Updated',
  deprecate: 'Deprecated',
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  superseded: 'bg-gray-100 text-gray-500',
  update: 'bg-blue-100 text-blue-700',
  deprecate: 'bg-red-100 text-red-600',
}

interface PageProps {
  params: { id: string; ruleId: string }
}

export default async function LegalRuleDetailPage({ params }: PageProps) {
  await requireAdmin()

  const [rule, history] = await Promise.all([
    getLegalRule(params.ruleId),
    getRuleHistory(params.ruleId),
  ])

  if (!rule || rule.jurisdiction_id !== params.id) notFound()

  const paramEntries = Object.entries(rule.parameters ?? {})

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={rule.rule_name}
        description={`${rule.rule_type?.name ?? 'Unknown type'} · v${rule.version_number}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jurisdictions/${params.id}/rules`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              ← All Rules
            </Link>
          </div>
        }
      />

      {/* Status banner */}
      <div
        className={`rounded-lg px-4 py-3 text-sm font-medium ${
          rule.is_current
            ? 'border border-green-200 bg-green-50 text-green-800'
            : 'border border-gray-200 bg-gray-50 text-gray-500'
        }`}
      >
        {rule.is_current ? (
          <>
            <span className="font-bold">Current rule</span> — active as of{' '}
            {fmtDate(rule.effective_date)}
          </>
        ) : (
          <>
            <span className="font-bold">Historical rule</span> — superseded on{' '}
            {fmtDate(rule.superseded_date) ?? 'unknown date'}
          </>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Rule Summary</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Field label="Jurisdiction" value={rule.jurisdiction?.name ?? '—'} />
          <Field label="Rule Type" value={rule.rule_type?.name ?? '—'} />
          <Field label="Version" value={`v${rule.version_number}`} />
          <Field
            label="Status"
            value={
              rule.is_current ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                  Current
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Superseded
                </span>
              )
            }
          />
          <Field
            label="Applies"
            value={
              rule.rule_applies ? (
                <span className="font-semibold text-green-600">Yes</span>
              ) : (
                <span className="font-semibold text-amber-600">Not Applicable</span>
              )
            }
          />
          <Field label="Effective Date" value={fmtDate(rule.effective_date)} />
          {!rule.is_current && (
            <Field label="Superseded Date" value={fmtDate(rule.superseded_date)} />
          )}
          <Field label="Created" value={fmtDateTime(rule.created_at)} />
          {rule.change_reason && (
            <div className="col-span-2 sm:col-span-3">
              <Field label="Change Reason" value={rule.change_reason} />
            </div>
          )}
          {!rule.rule_applies && rule.not_applicable_reason && (
            <div className="col-span-2 sm:col-span-3">
              <Field label="Not Applicable Reason" value={rule.not_applicable_reason} />
            </div>
          )}
        </dl>
      </div>

      {/* Citation */}
      {rule.citation && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Legal Citation</h2>
          <dl className="grid gap-y-4">
            <Field label="Citation" value={rule.citation.full_citation_formatted ?? `${rule.citation.code_name} §${rule.citation.section}`} />
          </dl>
        </div>
      )}

      {/* Parameters */}
      {rule.rule_applies && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">Parameters</h2>
          {paramEntries.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No parameters recorded.</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              {paramEntries.map(([key, val]) => (
                <Field
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={
                    val === null || val === undefined
                      ? null
                      : typeof val === 'boolean'
                      ? val ? 'Yes' : 'No'
                      : String(val)
                  }
                />
              ))}
            </dl>
          )}
        </div>
      )}

      {/* Audit history */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Audit History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No history recorded.</p>
        ) : (
          <ol className="space-y-3">
            {history.map((entry: Record<string, unknown>) => (
              <li key={entry.id as string} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    CHANGE_TYPE_COLORS[entry.change_type as string] ?? 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {CHANGE_TYPE_LABELS[entry.change_type as string] ?? entry.change_type as string}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700">
                    {entry.change_notes as string | null ?? '—'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {entry.changed_by as string} · {fmtDateTime(entry.changed_at as string)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Navigation context */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">More for {rule.jurisdiction?.name}</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/jurisdictions/${params.id}`}
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Jurisdiction Details →
          </Link>
          <Link
            href={`/admin/jurisdictions/${params.id}/rules`}
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            All Rules →
          </Link>
          <Link
            href={`/admin/jurisdictions/${params.id}/rules/new`}
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Add New Rule Version →
          </Link>
        </div>
      </div>
    </div>
  )
}
