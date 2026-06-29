import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { listRuleTypes } from '@/lib/admin/ruleTypes'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import RuleTypeStatusBadge from '@/components/admin/RuleTypeStatusBadge'

function formatDate(val: string) {
  return new Date(val).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

export default async function RuleTypesPage() {
  await requireAdmin()
  const ruleTypes = await listRuleTypes()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Rule Types"
        description={`${ruleTypes.length} rule type${ruleTypes.length !== 1 ? 's' : ''} defined`}
      />

      {ruleTypes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-gray-400">
          No rule types defined yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Calculator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ruleTypes.map((rt) => (
                <tr key={rt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center text-xs font-bold text-gray-400">{rt.display_order}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{rt.name}</div>
                    {rt.description && (
                      <div className="mt-0.5 max-w-sm truncate text-xs text-gray-400">{rt.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">{rt.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    {rt.calculator_slug
                      ? <code className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600">{rt.calculator_slug}</code>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <RuleTypeStatusBadge isActive={rt.is_active} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(rt.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/rule-types/${rt.id}`}
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
      )}

      <p className="text-xs text-gray-400">
        Sorted by display order, then name. Rule types define the compliance categories the engine supports.
      </p>
    </div>
  )
}
