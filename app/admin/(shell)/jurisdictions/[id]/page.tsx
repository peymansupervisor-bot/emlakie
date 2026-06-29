import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getJurisdiction, getJurisdictionHistory } from '@/lib/admin/jurisdictions'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { verifyJurisdictionAction, flagForReviewAction } from '../actions'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  no_requirement: 'bg-gray-100 text-gray-500',
  inactive: 'bg-red-100 text-red-600',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  no_requirement: 'No Requirement',
  inactive: 'Inactive',
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  verify: 'Verified',
  flag_review: 'Flagged for Review',
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-800">{value ?? <span className="text-gray-300">—</span>}</dd>
    </div>
  )
}

function formatDate(val: string | null | undefined) {
  if (!val) return null
  return new Date(val).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

interface PageProps {
  params: { id: string }
  searchParams: { error?: string; verified?: string; flagged?: string }
}

export default async function JurisdictionDetailPage({ params, searchParams }: PageProps) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'

  const [jurisdiction, history] = await Promise.all([
    getJurisdiction(params.id),
    getJurisdictionHistory(params.id),
  ])

  if (!jurisdiction) notFound()

  const state = jurisdiction.state as { id: string; code: string; name: string } | null

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={jurisdiction.name}
        description={`/${jurisdiction.seo_slug}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/jurisdictions"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              ← Back
            </Link>
            {canWrite && (
              <Link
                href={`/admin/jurisdictions/${jurisdiction.id}/edit`}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                Edit
              </Link>
            )}
          </div>
        }
      />

      {/* Toast banners */}
      {searchParams.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}
      {searchParams.verified && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Jurisdiction verified successfully.
        </div>
      )}
      {searchParams.flagged && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Jurisdiction flagged for review and added to the verification queue.
        </div>
      )}

      {/* Main info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[jurisdiction.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {STATUS_LABELS[jurisdiction.status] ?? jurisdiction.status}
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            {jurisdiction.jurisdiction_type}
          </span>
          {jurisdiction.interest_required && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-700">
              Interest Required
            </span>
          )}
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-500">
            Priority T{jurisdiction.priority_tier}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="Full Name" value={jurisdiction.name} />
          <Field label="Short Name" value={jurisdiction.short_name} />
          <Field label="SEO Slug" value={<code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{jurisdiction.seo_slug}</code>} />
          <Field label="State" value={state ? `${state.name} (${state.code})` : null} />
          <Field label="Interest Required" value={jurisdiction.interest_required ? 'Yes' : 'No'} />
          <Field label="Priority Tier" value={`Tier ${jurisdiction.priority_tier}`} />
          <Field label="Calculation Count" value={jurisdiction.calculation_count.toLocaleString()} />
          <Field label="Status" value={STATUS_LABELS[jurisdiction.status] ?? jurisdiction.status} />
          <Field label="Official Housing URL" value={
            jurisdiction.official_housing_authority_url
              ? <a href={jurisdiction.official_housing_authority_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline break-all">{jurisdiction.official_housing_authority_url}</a>
              : null
          } />
          <Field label="Meta Title" value={jurisdiction.meta_title} />
          <Field label="Last Verified" value={formatDate(jurisdiction.last_verified_at)} />
          <Field label="Verification Source" value={
            jurisdiction.verification_source_url
              ? <a href={jurisdiction.verification_source_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline break-all">{jurisdiction.verification_source_url}</a>
              : null
          } />
          {jurisdiction.verification_notes && (
            <div className="col-span-2 lg:col-span-4">
              <Field label="Verification Notes" value={jurisdiction.verification_notes} />
            </div>
          )}
          {jurisdiction.meta_description && (
            <div className="col-span-2 lg:col-span-4">
              <Field label="Meta Description" value={jurisdiction.meta_description} />
            </div>
          )}
        </dl>

        <div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
          Created {formatDate(jurisdiction.created_at)} · Updated {formatDate(jurisdiction.updated_at)}
        </div>
      </div>

      {/* Admin actions — editor/superadmin only */}
      {canWrite && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Verify */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Verify Jurisdiction</h3>
            <p className="mb-4 text-xs text-gray-500">Mark this jurisdiction as verified. Sets status and records who verified it.</p>
            <form action={verifyJurisdictionAction} className="space-y-3">
              <input type="hidden" name="id" value={jurisdiction.id} />
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Set Status</label>
                <select
                  name="status"
                  defaultValue="active"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="active">Active (interest requirement confirmed)</option>
                  <option value="no_requirement">No Requirement (confirmed no law)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Source URL</label>
                <input
                  name="verification_source_url"
                  type="url"
                  placeholder="https://…"
                  defaultValue={jurisdiction.verification_source_url ?? ''}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Notes</label>
                <textarea
                  name="verification_notes"
                  rows={2}
                  defaultValue={jurisdiction.verification_notes ?? ''}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                Verify
              </button>
            </form>
          </div>

          {/* Flag for Review */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Flag for Review</h3>
            <p className="mb-4 text-xs text-gray-500">Add this jurisdiction to the verification queue for follow-up.</p>
            <form action={flagForReviewAction} className="space-y-3">
              <input type="hidden" name="id" value={jurisdiction.id} />
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Reason</label>
                <input
                  name="reason"
                  type="text"
                  placeholder="Why does this need review?"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Priority (1 = highest)</label>
                <select
                  name="priority"
                  defaultValue="3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="1">1 — Critical</option>
                  <option value="2">2 — High</option>
                  <option value="3">3 — Normal</option>
                  <option value="4">4 — Low</option>
                  <option value="5">5 — Someday</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
              >
                Flag for Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change history */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Change History</h3>
        </div>
        {history.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">No history yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">When</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Field</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(h.changed_at)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                      {CHANGE_TYPE_LABELS[h.change_type] ?? h.change_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{h.field_changed ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-sm truncate">{h.change_notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
