import type { ParameterSchema, ParameterField } from '@/lib/admin/ruleTypes'

const TYPE_LABELS: Record<string, string> = {
  enum: 'Choice',
  integer: 'Whole Number',
  decimal: 'Decimal Number',
  string: 'Text',
  boolean: 'Yes / No',
}

const ENUM_VALUE_LABELS: Record<string, string> = {
  annual: 'Annual',
  monthly: 'Monthly',
  simple: 'Simple interest',
  compound: 'Compound interest',
  cash: 'Cash payment',
  rent_credit: 'Rent credit',
  landlord_choice: "Landlord's choice",
  annually: 'Annually',
  at_termination: 'At lease termination',
  with_deposit_refund: 'With deposit refund',
  deposit_receipt_date: 'Date deposit was received',
  move_in_date: 'Move-in date',
  lease_start_date: 'Lease start date',
  fixed: 'Fixed rate',
  locally_set_annual: 'Set annually by local authority',
  cpi_linked: 'Tied to CPI (inflation index)',
  treasury_linked: 'Tied to US Treasury rate',
  passbook_savings_rate: 'Passbook savings rate',
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—'
  const s = String(val)
  return ENUM_VALUE_LABELS[s] ?? s
}

function FieldCard({ name, field }: { name: string; field: ParameterField }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-900">{field.label}</p>
          <p className="mt-0.5 font-mono text-[11px] text-gray-400">{name}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">
            {TYPE_LABELS[field.type] ?? field.type}
          </span>
          {field.required && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-500">
              Required
            </span>
          )}
        </div>
      </div>

      {field.help && (
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">{field.help}</p>
      )}

      {field.type === 'enum' && field.values && field.values.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            Allowed values
          </p>
          <div className="flex flex-wrap gap-1.5">
            {field.values.map((v) => (
              <span
                key={v}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                  String(field.default) === v
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                }`}
              >
                {formatValue(v)}
                {String(field.default) === v && (
                  <span className="ml-1 text-[9px] font-bold uppercase text-green-500">default</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {field.type === 'integer' && (
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          {field.min !== undefined && <span>Min: <strong className="text-gray-700">{field.min}</strong></span>}
          {field.max !== undefined && <span>Max: <strong className="text-gray-700">{field.max}</strong></span>}
          {field.default !== undefined && <span>Default: <strong className="text-gray-700">{String(field.default)}</strong></span>}
        </div>
      )}
    </div>
  )
}

interface Props {
  schema: ParameterSchema
}

export default function ParameterSchemaViewer({ schema }: Props) {
  const entries = Object.entries(schema)

  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">No parameters defined.</p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map(([name, field]) => (
        <FieldCard key={name} name={name} field={field} />
      ))}
    </div>
  )
}
