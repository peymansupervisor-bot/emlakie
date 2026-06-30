import { redirect, notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getRate } from '@/lib/admin/rates'

interface PageProps {
  params: { id: string }
}

export default async function GlobalRateRedirectPage({ params }: PageProps) {
  await requireAdmin()
  const rate = await getRate(params.id)
  if (!rate) notFound()
  redirect(`/admin/jurisdictions/${rate.jurisdiction_id}/rates/${rate.id}`)
}
