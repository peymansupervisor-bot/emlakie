import { requireAdmin } from '@/lib/admin/auth'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminEmptyState from '@/components/admin/AdminEmptyState'

const SECTION_META: Record<string, { title: string; description: string }> = {
  jurisdictions:         { title: 'Jurisdictions',       description: 'Manage governing entities and their compliance status.' },
  'rule-types':         { title: 'Rule Types',           description: 'Configure the generic legal rule engine categories.' },
  rules:                { title: 'Legal Rules',           description: 'Versioned rules per jurisdiction and rule type.' },
  rates:                { title: 'Rates',                 description: 'Annually-changing rate values with four-eyes approval.' },
  exemptions:           { title: 'Exemptions',            description: 'Property-type and building-level exemptions.' },
  citations:            { title: 'Law Citations',         description: 'Statute and ordinance citations per jurisdiction.' },
  'verification-queue': { title: 'Verification Queue',   description: 'Work queue for pending data review and approval.' },
  'audit-log':          { title: 'Audit Log',             description: 'Immutable history of all compliance data changes.' },
  'data-health':        { title: 'Data Health',           description: 'Automated data quality alerts and resolution.' },
  analytics:            { title: 'Analytics',             description: 'Calculator usage, coverage, and engagement metrics.' },
  settings:             { title: 'Settings',              description: 'Admin system configuration.' },
}

export async function generateStaticParams() {
  return Object.keys(SECTION_META).map((section) => ({ section }))
}

interface Props {
  params: Promise<{ section: string }>
}

export default async function AdminSectionPage({ params }: Props) {
  await requireAdmin()
  const { section } = await params
  const meta = SECTION_META[section] ?? { title: section, description: 'Coming soon.' }

  const calendarIcon = (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )

  return (
    <>
      <AdminPageHeader title={meta.title} description={meta.description} />
      <AdminEmptyState
        title="Coming in a future phase"
        description={`The ${meta.title} module will be built in an upcoming phase. The database schema and RLS policies are already in place.`}
        icon={calendarIcon}
      />
    </>
  )
}
