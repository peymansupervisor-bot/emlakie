import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { getRuleType } from '@/lib/admin/ruleTypes'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import RuleTypeStatusBadge from '@/components/admin/RuleTypeStatusBadge'
import ParameterSchemaViewer from '@/components/admin/ParameterSchemaViewer'

const EXEMPTION_LABELS: Record<string, string> = {
  property_type: 'Property Type (e.g. condo vs. apartment)',
  unit_count: 'Unit Count (e.g. small landlord exemption)',
  owner_occupied: 'Owner-Occupied Property',
  construction_year: 'Construction Year (e.g. pre-1978 buildings)',
  minimum_tenancy_days: 'Minimum Tenancy Length',
  affordable_housing: 'Affordable / Subsidized Housing',
  government_subsidized: 'Government-Subsidized Units',
  single_room_occupancy: 'Single Room Occupancy (SRO)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-800">{children ?? <span className="text-gray-300">—</span>}</dd>
    </div>
  )
}

function formatDate(val: string) {
  return new Date(val).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

interface PageProps {
  params: { id: string }
}

export default async function RuleTypeDetailPage({ params }: PageProps) {
  await requireAdmin()
  const rt = await getRuleType(params.id)
  if (!rt) notFound()

  const paramCount = rt.parameter_schema ? Object.keys(rt.parameter_schema).length : 0
  const exemptionCount = rt.exemption_types_allowed?.length ?? 0

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={rt.name}
        description={`Rule type · display order ${rt.display_order}`}
        actions={
          <Link
            href="/admin/rule-types"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            ← Back
          </Link>
        }
      />

      {/* Core info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <RuleTypeStatusBadge isActive={rt.is_active} />
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
            Order #{rt.display_order}
          </span>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
            {paramCount} parameter{paramCount !== 1 ? 's' : ''}
          </span>
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-600">
            {exemptionCount} exemption type{exemptionCount !== 1 ? 's' : ''}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name">{rt.name}</Field>
          <Field label="Slug">
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{rt.slug}</code>
          </Field>
          <Field label="Calculator Slug">
            {rt.calculator_slug
              ? <code className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">{rt.calculator_slug}</code>
              : null}
          </Field>
          <Field label="Display Order">{rt.display_order}</Field>
          <Field label="Status">{rt.is_active ? 'Active' : 'Inactive'}</Field>
          {rt.description && (
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Description">{rt.description}</Field>
            </div>
          )}
        </dl>

        <div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-400">
          Created {formatDate(rt.created_at)} · Updated {formatDate(rt.updated_at)}
        </div>
      </div>

      {/* Parameter schema */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Parameter Schema</h3>
          <p className="mt-0.5 text-xs text-gray-400">
            These fields define what data a legal rule of this type must provide to the calculator.
          </p>
        </div>
        <div className="p-6">
          {rt.parameter_schema && Object.keys(rt.parameter_schema).length > 0 ? (
            <ParameterSchemaViewer schema={rt.parameter_schema} />
          ) : (
            <p className="text-sm text-gray-400 italic">No parameters defined for this rule type.</p>
          )}
        </div>
      </div>

      {/* Exemption types */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Allowed Exemption Types</h3>
          <p className="mt-0.5 text-xs text-gray-400">
            These exemption categories may apply to legal rules of this type.
          </p>
        </div>
        <div className="p-6">
          {!rt.exemption_types_allowed || rt.exemption_types_allowed.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No exemption types defined.</p>
          ) : (
            <ul className="space-y-2">
              {rt.exemption_types_allowed.map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-3 w-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {EXEMPTION_LABELS[key] ?? key}
                    </span>
                    <code className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">{key}</code>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Read-only notice */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-400">
        Rule types are managed by engineering and define the compliance engine&apos;s calculator contracts. Editing is not available in this phase.
      </div>
    </div>
  )
}
