import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getRate, getRateHistory } from '@/lib/admin/rates'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ApproveRejectPanel from './ApproveRejectPanel'

function fmtDate(val: string | null | undefined) {
  if (!val) return '—'
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
  approve: 'Approved',
  reject: 'Rejected',
  update: 'Updated',
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  create: 'bg-blue-100 text-blue-700',
  approve: 'bg-green-100 text-green-700',
  reject: 'bg-red-100 text-red-600',
  update: 'bg-gray-100 text-gray-600',
}

interface PageProps {
  params: { id: string; rateId: string }
  searchParams: { error?: string; approved?: string; rejected?: string }
}

export default async function RateDetailPage({ params, searchParams }: PageProps) {
  const admin = await requireAdmin()
  const isSuperadmin = admin.role === 'superadmin'

  const [rate, history] = await Promise.all([
    getRate(params.rateId),
    getRateHistory(params.rateId),
  ])

  if (!rate || rate.jurisdiction_id !== params.id) notFound()

  const isPending = !rate.is_published && !rate.rejected_at
  const isRejected = !!rate.rejected_at
  const isPublished = rate.is_published

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${rate.numeric_value}% — ${rate.rate_key.replace(/_/g, ' ')}`}
        description={`${rate.rule_type?.name ?? '—'} · ${rate.jurisdiction?.name ?? '—'}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jurisdictions/${params.id}/rates`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              ← All Rates
            </Link>
          </div>
        }
      />

      {/* Toast banners */}
      {searchParams.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}
      {searchParams.approved && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Rate approved and published successfully. It is now active in the compliance engine.
        </div>
      )}
      {searchParams.rejected && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Rate rejected.
        </div>
      )}

      {/* Status banner */}
      <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
        isPublished
          ? 'border border-green-200 bg-green-50 text-green-800'
          : isRejected
          ? 'border border-red-200 bg-red-50 text-red-700'
          : 'border border-amber-200 bg-amber-50 text-amber-800'
      }`}>
        {isPublished && <><span className="font-bold">Published</span> — active in the compliance engine</>}
        {isRejected && <><span className="font-bold">Rejected</span> — not published</>}
        {isPending && <><span className="font-bold">Pending approval</span> — not yet active in the compliance engine</>}
      </div>

      {/* Jurisdiction + Rule context */}
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Jurisdiction</p>
        <p className="text-base font-bold text-green-900">{rate.jurisdiction?.name ?? '—'}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-green-700">
          <span>{rate.rule_type?.name ?? '—'}</span>
          <span>·</span>
          <span>{rate.legal_rule?.rule_name ?? '—'}</span>
          {rate.legal_rule?.version_number !== undefined && (
            <>
              <span>·</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
                v{rate.legal_rule.version_number}
              </span>
            </>
          )}
          {rate.legal_rule?.is_current && (
            <span className="rounded-full bg-white border border-green-300 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">
              Current Rule
            </span>
          )}
        </div>
      </div>

      {/* Rate summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Rate Details</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Field label="Rate Key" value={<code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{rate.rate_key}</code>} />
          <Field label="Value" value={<span className="text-lg font-bold text-gray-900">{rate.numeric_value}%</span>} />
          <Field label="Status" value={
            isPublished
              ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700">Published</span>
              : isRejected
              ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">Rejected</span>
              : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">Pending</span>
          } />
          <Field label="Effective From" value={fmtDate(rate.effective_from)} />
          <Field label="Effective To" value={rate.effective_to ? fmtDate(rate.effective_to) : 'Open-ended'} />
          <Field label="Created" value={fmtDateTime(rate.created_at)} />
          {isPublished && rate.approved_at && (
            <Field label="Approved" value={fmtDateTime(rate.approved_at)} />
          )}
          {isRejected && rate.rejected_at && (
            <Field label="Rejected" value={fmtDateTime(rate.rejected_at)} />
          )}
        </dl>
      </div>

      {/* Source / Evidence */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Source &amp; Evidence</h2>
        <dl className="space-y-4">
          <Field label="Source Description" value={rate.rate_source_description} />
          {rate.rate_source_url && (
            <Field label="Source URL" value={
              <a href={rate.rate_source_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline break-all text-sm">
                {rate.rate_source_url}
              </a>
            } />
          )}
          {rate.notes && <Field label="Notes" value={rate.notes} />}
          {isRejected && rate.rejection_notes && (
            <Field label="Rejection Notes" value={<span className="text-red-700">{rate.rejection_notes}</span>} />
          )}
        </dl>
      </div>

      {/* Approve / Reject panel — superadmin + pending only */}
      {isSuperadmin && isPending && (
        <ApproveRejectPanel
          jurisdictionId={params.id}
          rateId={params.rateId}
        />
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
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CHANGE_TYPE_COLORS[entry.change_type as string] ?? 'bg-gray-100 text-gray-500'}`}>
                  {CHANGE_TYPE_LABELS[entry.change_type as string] ?? entry.change_type as string}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700">{entry.change_notes as string ?? '—'}</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {entry.changed_by as string} · {fmtDateTime(entry.changed_at as string)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Navigation */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">More for {rate.jurisdiction?.name}</h2>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/jurisdictions/${params.id}`} className="text-sm font-semibold text-green-600 hover:text-green-700">
            Jurisdiction Details →
          </Link>
          <Link href={`/admin/jurisdictions/${params.id}/rules`} className="text-sm font-semibold text-green-600 hover:text-green-700">
            Legal Rules →
          </Link>
          <Link href={`/admin/jurisdictions/${params.id}/rates`} className="text-sm font-semibold text-green-600 hover:text-green-700">
            All Rates →
          </Link>
        </div>
      </div>
    </div>
  )
}
