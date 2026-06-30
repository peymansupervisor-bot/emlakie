import { notFound, redirect } from 'next/navigation'
import { getLegalRule } from '@/lib/admin/legalRules'
import { requireAdmin } from '@/lib/admin/auth'

interface PageProps {
  params: { id: string }
}

// Redirect to the canonical jurisdiction-scoped URL
export default async function LegalRuleGlobalPage({ params }: PageProps) {
  await requireAdmin()
  const rule = await getLegalRule(params.id)
  if (!rule) notFound()
  redirect(`/admin/jurisdictions/${rule.jurisdiction_id}/rules/${rule.id}`)
}
