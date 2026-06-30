import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/auth'
import { getJurisdiction } from '@/lib/admin/jurisdictions'
import { listRuleTypes } from '@/lib/admin/ruleTypes'
import { listCitationsForJurisdiction } from '@/lib/admin/legalRules'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import LegalRuleForm from '@/components/admin/LegalRuleForm'
import { createLegalRuleAction } from '../actions'

interface PageProps {
  params: { id: string }
}

export default async function NewLegalRulePage({ params }: PageProps) {
  const admin = await requireAdmin()
  const canWrite = admin.role === 'editor' || admin.role === 'superadmin'

  if (!canWrite) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        You need Editor or Superadmin access to create legal rules.
      </div>
    )
  }

  const [jurisdiction, ruleTypes, citations] = await Promise.all([
    getJurisdiction(params.id),
    listRuleTypes(),
    listCitationsForJurisdiction(params.id),
  ])

  if (!jurisdiction) notFound()

  const boundAction = createLegalRuleAction.bind(null, params.id)

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="New Legal Rule"
        description={`Creating rule for ${jurisdiction.name}`}
        actions={
          <Link
            href={`/admin/jurisdictions/${params.id}/rules`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            ← Back to Rules
          </Link>
        }
      />

      <div className="max-w-2xl">
        <LegalRuleForm
          jurisdictionId={params.id}
          jurisdictionName={jurisdiction.name}
          ruleTypes={ruleTypes}
          citations={citations}
          action={boundAction}
        />
      </div>
    </div>
  )
}
