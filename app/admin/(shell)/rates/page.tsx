import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { listAllRates, RATES_PAGE_SIZE } from '@/lib/admin/rates'
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
  searchParams: {
    page?: string
    is_published?: string
    rate_key?: string
    search?: string
  }
}

export default async function GlobalRatesPage({ searchParams }: PageProps) {
  await requireAdmin()

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const { data: rates, count } = await listAllRates({
    is_published: searchParams.is_published,
    rate_key: searchParams.rate_key,
    search: searchParams.search,
    page,
  })

  const totalPages = Math.ceil(count / RATES_PAGE_SIZE)

  function rateStatus(r: typeof rates[0]) {
    if (r.is_published) return 'published'
    if (r.rejected_at) return 'rejected'
    return 'pending'
  }

  const params = new URLSearchParams()
  if (searchParams.is_published) params.set('is_published', searchParams.is_published)
  if (searchParams.rate_key) params.set('rate_key', searchParams.rate_key)
  if (searchParams.search) params.set('search', searchParams.search)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Legal Rates"
        description={`${count} rate${count !== 1 ? 's' : ''} across all jurisdictions`}
      />

      {/* Notice: create from jurisdiction */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>Read-only index.</strong> To add a rate, navigate to a jurisdiction first:
        {' '}<Link href="/admin/jurisdictions" className="font-semibold underline hover:text-blue-900">Jurisdictions →</Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="search"
          defaultValue={searchParams.search}
          placeholder="Search source description…"
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <select
          name="is_published"
          defaultValue={searchParams.is_published ?? ''}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">All statuses</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
        <select
          name="rate_key"
          defaultValue={searchParams.rate_key ?? ''}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">All rate keys</option>
          <option value="annual_interest_rate">Annual Interest Rate</option>
          <option value="monthly_interest_rate">Monthly Interest Rate</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition"
        >
          Filter
        </button>
        {(searchParams.search || searchParams.is_published || searchParams.rate_key) && (
          <Link href="/admin/rates" className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition">
            Clear
          </Link>
        )}
      </form>

      {rates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-gray-400">No rates found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Jurisdiction</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rule Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rate Key</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Value</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Effective From</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Effective To</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rates.map((r) => {
                const status = rateStatus(r)
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800 text-sm">
                      {r.jurisdiction?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">{r.rule_type?.name ?? '—'}</td>
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
                        href={`/admin/jurisdictions/${r.jurisdiction_id}/rates/${r.id}`}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
              <span>Page {page} of {totalPages} · {count} total</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/rates?${params.toString()}&page=${page - 1}`}
                    className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
                  >
                    ← Prev
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/rates?${params.toString()}&page=${page + 1}`}
                    className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
                  >
                    Next →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
