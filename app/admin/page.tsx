import { requireAdmin, isSuperadmin, canWrite } from '@/lib/admin/auth'

export default async function AdminIndexPage() {
  const admin = await requireAdmin()

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Emlakie Compliance Center
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm">
          <span className="text-gray-600">Signed in as</span>
          <span className="font-semibold text-gray-900">{admin.email}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${
            isSuperadmin(admin)
              ? 'bg-red-100 text-red-700'
              : canWrite(admin)
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {admin.role}
          </span>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Phase 3 complete. Dashboard modules will be added in subsequent phases.
        </p>

        <form action="/api/admin/auth/logout" method="POST" className="mt-8">
          <button
            type="submit"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
