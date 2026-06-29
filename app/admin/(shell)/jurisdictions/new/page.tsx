import { redirect } from 'next/navigation'
import { requireAdminRole } from '@/lib/admin/auth'
import { listStates } from '@/lib/admin/jurisdictions'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import JurisdictionForm from '@/components/admin/JurisdictionForm'
import { createJurisdictionAction } from '../actions'
import Link from 'next/link'

interface PageProps {
  searchParams: { error?: string }
}

export default async function NewJurisdictionPage({ searchParams }: PageProps) {
  await requireAdminRole('editor')
  const states = await listStates()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AdminPageHeader
        title="New Jurisdiction"
        description="Create a new compliance jurisdiction"
        actions={
          <Link
            href="/admin/jurisdictions"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            ← Cancel
          </Link>
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <JurisdictionForm
          action={createJurisdictionAction}
          states={states}
          error={searchParams.error ? decodeURIComponent(searchParams.error) : undefined}
          submitLabel="Create Jurisdiction"
        />
      </div>
    </div>
  )
}
