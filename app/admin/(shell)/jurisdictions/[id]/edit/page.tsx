import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdminRole } from '@/lib/admin/auth'
import { getJurisdiction, listStates } from '@/lib/admin/jurisdictions'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import JurisdictionForm from '@/components/admin/JurisdictionForm'
import { updateJurisdictionAction } from '../../actions'

interface PageProps {
  params: { id: string }
  searchParams: { error?: string }
}

export default async function EditJurisdictionPage({ params, searchParams }: PageProps) {
  await requireAdminRole('editor')

  const [jurisdiction, states] = await Promise.all([
    getJurisdiction(params.id),
    listStates(),
  ])

  if (!jurisdiction) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title={`Edit: ${jurisdiction.name}`}
        description={`/${jurisdiction.seo_slug}`}
        actions={
          <Link
            href={`/admin/jurisdictions/${jurisdiction.id}`}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            ← Cancel
          </Link>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <JurisdictionForm
          action={updateJurisdictionAction}
          jurisdiction={jurisdiction}
          states={states}
          error={searchParams.error ? decodeURIComponent(searchParams.error) : undefined}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
