import AdminBreadcrumbs from './AdminBreadcrumbs'

interface Props {
  title: string
  description?: string
  actions?: React.ReactNode
}

export default function AdminPageHeader({ title, description, actions }: Props) {
  return (
    <div className="mb-6">
      <AdminBreadcrumbs />
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
