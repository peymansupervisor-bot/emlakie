import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getJurisdiction } from '@/lib/admin/jurisdictions'
import { listRatesForJurisdiction } from '@/lib/admin/rates'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

function fmtDate(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

const STATUS_CHIP: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
}

interface PageProps {
  params: { id: string }
}

export default async function JurisdictionRatesPage({ params }: PageProps) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'

  const [jurisdiction, rates] = await Promise.all([
    getJurisdiction(params.id),
    listRatesForJurisdiction(params.id),
  ])

  if (!jurisdiction) notFound()

  // Group by rule type for display
  const byRule = new Map<string, typeof rates>()
  for (const r of rates) {
    const key = r.legal_rule?.id ?? 'unknown'
    if (!byRule.has(key)) byRule.set(key, [])
    byRule.get(key)!.push(r)
  }

  function rateStatus(r: typeof rates[0]) {
    if (r.is_published) return 'published'
    if (r.rejected_at) return 'rejected'
    return 'pending'
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rates"
        description={`Interest rates for ${jurisdiction.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jurisdictions/${params.id}`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              ← Jurisdiction
            </Link>
            {canWrite && (
              <Link
                href={`/admin/jurisdictions/${params.id}/rates/new`}
                className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Rate
              </Link>
            )}
          </div>
        }
      />

      {/* Jurisdiction context */}
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Jurisdiction</p>
        <p className="mt-0.5 text-lg font-bold text-green-900">{jurisdiction.name}</p>
        <p className="text-sm text-green-700">{rates.length} rate{rates.length !== 1 ? 's' : ''} on record</p>
      </div>

      {rates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-gray-400">No rates recorded for this jurisdiction.</p>
          {canWrite && (
            <Link
              href={`/admin/jurisdictions/${params.id}/rates/new`}
              className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
            >
              Add First Rate
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byRule.entries()).map(([ruleId, ruleRates]) => {
            const first = ruleRates[0]
            const ruleName = first.legal_rule?.rule_name ?? 'Unknown Rule'
            const ruleTypeName = first.rule_type?.name ?? '—'
            const version = first.legal_rule?.version_number
            const isCurrent = first.legal_rule?.is_current

            return (
              <div key={ruleId} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Rule group header */}
                <div className="border-b border-gray-100 bg-gray-50 px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{ruleTypeName}</p>
                    <p className="text-sm font-semibold text-gray-800">{ruleName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {version !== undefined && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        v{version}
                      </span>
                    )}
                    {isCurrent && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-white">
                    <tr>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Rate Key</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Value</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Effective From</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Effective To</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ruleRates.map((r) => {
                      const status = rateStatus(r)
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-xs font-mono text-gray-600">{r.rate_key}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900">{r.numeric_value}%</td>
                          <td className="px-5 py-3 text-xs text-gray-600">{fmtDate(r.effective_from)}</td>
                          <td className="px-5 py-3 text-xs text-gray-600">{r.effective_to ? fmtDate(r.effective_to) : 'Open-ended'}</td>
                          <td className="px-5 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_CHIP[status] ?? 'bg-gray-100 text-gray-500'}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <Link
                              href={`/admin/jurisdictions/${params.id}/rates/${r.id}`}
                              className="text-xs font-semibold text-green-600 hover:text-green-700"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
