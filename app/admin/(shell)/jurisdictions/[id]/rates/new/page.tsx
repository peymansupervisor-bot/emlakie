import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getJurisdiction } from '@/lib/admin/jurisdictions'
import { listRulesForJurisdiction } from '@/lib/admin/legalRules'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import Link from 'next/link'
import RateForm from './RateForm'

interface PageProps {
  params: { id: string }
}

export default async function NewRatePage({ params }: PageProps) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'
  if (!canWrite) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-red-700">Access Denied</p>
        <p className="mt-1 text-xs text-red-500">Editor or Superadmin role required to create rates.</p>
      </div>
    )
  }

  const [jurisdiction, rules] = await Promise.all([
    getJurisdiction(params.id),
    listRulesForJurisdiction(params.id),
  ])

  if (!jurisdiction) notFound()

  const currentRules = rules.filter((r) => r.is_current)
  const historicalRules = rules.filter((r) => !r.is_current)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Rate"
        description={`Creating rate for ${jurisdiction.name}`}
        actions={
          <Link
            href={`/admin/jurisdictions/${params.id}/rates`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            ← Back to Rates
          </Link>
        }
      />

      {/* Jurisdiction lock banner */}
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Jurisdiction (locked)</p>
        <p className="mt-0.5 text-lg font-bold text-green-900">{jurisdiction.name}</p>
        <p className="text-xs text-green-700 mt-1">
          Only legal rules belonging to this jurisdiction are available below.
          Rates cannot be assigned to a different jurisdiction from this form.
        </p>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
          <p className="text-sm font-semibold text-amber-800">No Legal Rules Found</p>
          <p className="mt-1 text-xs text-amber-600">
            You must create a legal rule for this jurisdiction before adding rates.
          </p>
          <Link
            href={`/admin/jurisdictions/${params.id}/rules/new`}
            className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition"
          >
            Create Legal Rule
          </Link>
        </div>
      ) : (
        <RateForm
          jurisdictionId={params.id}
          currentRules={currentRules as unknown as Array<{
            id: string
            rule_name: string
            version_number: number
            is_current: boolean
            effective_date: string
            rule_type: { id: string; name: string; slug: string } | null
          }>}
          historicalRules={historicalRules as unknown as Array<{
            id: string
            rule_name: string
            version_number: number
            is_current: boolean
            effective_date: string
            rule_type: { id: string; name: string; slug: string } | null
          }>}
        />
      )}
    </div>
  )
}
