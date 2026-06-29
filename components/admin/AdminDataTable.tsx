interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface Props<T extends Record<string, unknown>> {
  columns: Column<T>[]
  rows: T[]
  keyField: keyof T
  emptyMessage?: string
}

export default function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  keyField,
  emptyMessage = 'No records found.',
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={String(row[keyField])} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-4 py-3 text-gray-700 ${col.className ?? ''}`}>
                  {col.render
                    ? col.render(row)
                    : String(row[col.key as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
