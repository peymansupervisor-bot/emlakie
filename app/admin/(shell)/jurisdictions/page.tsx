import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { listJurisdictions, listStates, PAGE_SIZE } from '@/lib/admin/jurisdictions'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  no_requirement: 'No Requirement',
  inactive: 'Inactive',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  no_requirement: 'bg-gray-100 text-gray-500',
  inactive: 'bg-red-100 text-red-600',
}

const TYPE_COLORS: Record<string, string> = {
  city: 'bg-blue-100 text-blue-700',
  county: 'bg-purple-100 text-purple-700',
  state: 'bg-indigo-100 text-indigo-700',
}

interface PageProps {
  searchParams: {
    status?: string
    jurisdiction_type?: string
    state_id?: string
    interest_required?: string
    priority_tier?: string
    search?: string
    page?: string
  }
}

export default async function JurisdictionsPage({ searchParams }: PageProps) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'

  const page = parseInt(searchParams.page ?? '1') || 1
  const filters = {
    status: searchParams.status,
    jurisdiction_type: searchParams.jurisdiction_type,
    state_id: searchParams.state_id,
    interest_required: searchParams.interest_required,
    priority_tier: searchParams.priority_tier,
    search: searchParams.search,
    page,
  }

  const [{ data: rows, count }, states] = await Promise.all([
    listJurisdictions(filters),
    listStates(),
  ])

  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams()
    const merged = { ...searchParams, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    return `/admin/jurisdictions?${p.toString()}`
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Jurisdictions"
        description={`${total.toLocaleString()} total jurisdictions`}
        actions={
          canWrite ? (
            <Link
              href="/admin/jurisdictions/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Jurisdiction
            </Link>
          ) : null
        }
      />

      {/* Filters */}
      <form method="GET" action="/admin/jurisdictions" className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Search</label>
          <input
            name="search"
            defaultValue={searchParams.search ?? ''}
            placeholder="Name or slug…"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 w-44"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Status</label>
          <select name="status" defaultValue={searchParams.status ?? ''} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="no_requirement">No Requirement</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Type</label>
          <select name="jurisdiction_type" defaultValue={searchParams.jurisdiction_type ?? ''} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
            <option value="">All types</option>
            <option value="city">City</option>
            <option value="county">County</option>
            <option value="state">State</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">State</label>
          <select name="state_id" defaultValue={searchParams.state_id ?? ''} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 w-44">
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Interest Req.</label>
          <select name="interest_required" defaultValue={searchParams.interest_required ?? ''} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
            <option value="">Either</option>
            <option value="true">Required</option>
            <option value="false">Not required</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500">Priority</label>
          <select name="priority_tier" defaultValue={searchParams.priority_tier ?? ''} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
            <option value="">All tiers</option>
            <option value="1">Tier 1 (highest)</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
            <option value="4">Tier 4</option>
            <option value="5">Tier 5</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition">
            Filter
          </button>
          <Link href="/admin/jurisdictions" className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
            Clear
          </Link>
        </div>
      </form>

      {/* Table */}
      {(!rows || rows.length === 0) ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-gray-400">
          No jurisdictions match the current filters.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Interest</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Calcs</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row: Record<string, unknown>) => {
                const state = row.state as { code: string; name: string } | null
                return (
                  <tr key={row.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div>{row.name as string}</div>
                      <div className="text-xs text-gray-400">{row.seo_slug as string}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_COLORS[row.jurisdiction_type as string] ?? 'bg-gray-100 text-gray-500'}`}>
                        {row.jurisdiction_type as string}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{state?.code ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[row.status as string] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[row.status as string] ?? row.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.interest_required ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">T{row.priority_tier as number}</td>
                    <td className="px-4 py-3 text-gray-600">{(row.calculation_count as number).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/jurisdictions/${row.id as string}`}
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
