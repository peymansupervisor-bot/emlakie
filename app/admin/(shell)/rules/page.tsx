import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { listLegalRules, LEGAL_RULES_PAGE_SIZE } from '@/lib/admin/legalRules'
import { listRuleTypes } from '@/lib/admin/ruleTypes'
import { listJurisdictions } from '@/lib/admin/jurisdictions'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

function fmtDate(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

interface PageProps {
  searchParams: {
    jurisdiction_id?: string
    rule_type_id?: string
    is_current?: string
    rule_applies?: string
    search?: string
    page?: string
  }
}

export default async function LegalRulesPage({ searchParams }: PageProps) {
  await requireAdmin()

  const page = parseInt(searchParams.page ?? '1') || 1

  const [{ data: rows, count }, ruleTypes, { data: jurisdictions }] = await Promise.all([
    listLegalRules({
      jurisdiction_id: searchParams.jurisdiction_id,
      rule_type_id: searchParams.rule_type_id,
      is_current: searchParams.is_current,
      rule_applies: searchParams.rule_applies,
      search: searchParams.search,
      page,
    }),
    listRuleTypes(),
    listJurisdictions({ page: 1 }),
  ])

  const total = count ?? 0
  const totalPages = Math.ceil(total / LEGAL_RULES_PAGE_SIZE)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { ...searchParams, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    return `/admin/rules?${p.toString()}`
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Legal Rules"
        description={`${total.toLocaleString()} rule version${total !== 1 ? 's' : ''} across all jurisdictions`}
      />

      {/* Filters */}
      <form
        method="GET"
        action="/admin/rules"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Search</label>
          <input
            name="search"
            defaultValue={searchParams.search ?? ''}
            placeholder="Rule name…"
            className="w-44 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Jurisdiction</label>
          <select
            name="jurisdiction_id"
            defaultValue={searchParams.jurisdiction_id ?? ''}
            className="w-48 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All jurisdictions</option>
            {(jurisdictions ?? []).map((j: Record<string, unknown>) => (
              <option key={j.id as string} value={j.id as string}>{j.name as string}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Rule Type</label>
          <select
            name="rule_type_id"
            defaultValue={searchParams.rule_type_id ?? ''}
            className="w-52 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All rule types</option>
            {ruleTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Status</label>
          <select
            name="is_current"
            defaultValue={searchParams.is_current ?? ''}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">Current &amp; historical</option>
            <option value="true">Current only</option>
            <option value="false">Superseded only</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Applies</label>
          <select
            name="rule_applies"
            defaultValue={searchParams.rule_applies ?? ''}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">Either</option>
            <option value="true">Applies</option>
            <option value="false">Not applicable</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition"
          >
            Filter
          </button>
          <Link
            href="/admin/rules"
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Clear
          </Link>
        </div>
      </form>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No legal rules found</p>
          <p className="mt-1 text-xs text-gray-400">
            Legal rules are created per-jurisdiction via{' '}
            <Link href="/admin/jurisdictions" className="text-green-600 hover:underline">
              Jurisdictions
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Jurisdiction
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Rule Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Version
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Applies
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Effective
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Superseded
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const jur = row.jurisdiction
                const rt = row.rule_type
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {jur ? (
                        <div>
                          <div className="font-medium text-gray-900">{jur.name}</div>
                          <div className="text-xs text-gray-400">
                            {(jur.state as { code: string } | null)?.code ?? ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {rt?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600">
                        v{row.version_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.is_current ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
                          Current
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Superseded
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.rule_applies ? (
                        <span className="text-xs font-semibold text-green-600">Yes</span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-600">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {fmtDate(row.effective_date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {fmtDate(row.superseded_date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {fmtDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/jurisdictions/${row.jurisdiction_id}/rules/${row.id}`}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ({total.toLocaleString()} total)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
