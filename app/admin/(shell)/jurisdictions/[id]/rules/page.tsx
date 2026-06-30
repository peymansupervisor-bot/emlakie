import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getJurisdiction } from '@/lib/admin/jurisdictions'
import { listRulesForJurisdiction } from '@/lib/admin/legalRules'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

function fmtDate(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

interface PageProps {
  params: { id: string }
}

export default async function JurisdictionRulesPage({ params }: PageProps) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'

  const [jurisdiction, rules] = await Promise.all([
    getJurisdiction(params.id),
    listRulesForJurisdiction(params.id),
  ])

  if (!jurisdiction) notFound()

  // Group by rule_type
  const byRuleType = new Map<string, typeof rules>()
  for (const rule of rules) {
    const rtId = rule.rule_type_id
    if (!byRuleType.has(rtId)) byRuleType.set(rtId, [])
    byRuleType.get(rtId)!.push(rule)
  }

  const currentRules = rules.filter((r) => r.is_current)
  const historicalRules = rules.filter((r) => !r.is_current)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${jurisdiction.name} — Legal Rules`}
        description={`${rules.length} rule version${rules.length !== 1 ? 's' : ''} · ${currentRules.length} current · ${historicalRules.length} historical`}
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
                href={`/admin/jurisdictions/${params.id}/rules/new`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Rule Version
              </Link>
            )}
          </div>
        }
      />

      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No legal rules defined yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Create the first rule version for {jurisdiction.name}.
          </p>
          {canWrite && (
            <Link
              href={`/admin/jurisdictions/${params.id}/rules/new`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
            >
              Create First Rule
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current rules */}
          {currentRules.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Current Rules
              </h2>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rule Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Version</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Applies</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Effective</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rule Name</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{rule.rule_type?.name ?? '—'}</div>
                          <code className="text-[10px] text-gray-400">{rule.rule_type?.slug}</code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                            v{rule.version_number}
                          </span>
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                            Current
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {rule.rule_applies ? (
                            <span className="text-xs font-semibold text-green-600">Yes</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(rule.effective_date)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{rule.rule_name}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/jurisdictions/${params.id}/rules/${rule.id}`}
                            className="text-xs font-semibold text-green-600 hover:text-green-700"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Historical rules */}
          {historicalRules.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Historical Versions
              </h2>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rule Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Version</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Applies</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Effective</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Superseded</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historicalRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-700">{rule.rule_type?.name ?? '—'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-500">
                            v{rule.version_number}
                          </span>
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Superseded
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {rule.rule_applies ? (
                            <span className="text-xs text-green-600">Yes</span>
                          ) : (
                            <span className="text-xs text-amber-600">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(rule.effective_date)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(rule.superseded_date)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/jurisdictions/${params.id}/rules/${rule.id}`}
                            className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
