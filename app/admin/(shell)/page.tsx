import { requireAdmin, isSuperadmin, canWrite } from '@/lib/admin/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

async function fetchStats() {
  try {
    const db = createSupabaseAdmin()
    const [states, jurisdictions, ruleTypes, queuePending, alertsOpen] = await Promise.all([
      db.from('compliance_states').select('id', { count: 'exact', head: true }),
      db.from('compliance_jurisdictions').select('id', { count: 'exact', head: true }),
      db.from('compliance_rule_types').select('id', { count: 'exact', head: true }).eq('is_active', true),
      db.from('compliance_verification_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      db.from('compliance_data_quality_alerts').select('id', { count: 'exact', head: true }).eq('is_resolved', false),
    ])
    return {
      states: states.count ?? 0,
      jurisdictions: jurisdictions.count ?? 0,
      ruleTypes: ruleTypes.count ?? 0,
      queuePending: queuePending.count ?? 0,
      alertsOpen: alertsOpen.count ?? 0,
    }
  } catch {
    return { states: 0, jurisdictions: 0, ruleTypes: 0, queuePending: 0, alertsOpen: 0 }
  }
}

function StatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent?: boolean }) {
  return (
    <a
      href={href}
      className={`block rounded-xl border p-5 transition hover:shadow-sm ${
        accent ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent ? 'text-amber-700' : 'text-gray-900'}`}>{value}</p>
    </a>
  )
}

export default async function AdminDashboardPage() {
  const [admin, stats] = await Promise.all([requireAdmin(), fetchStats()])

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Emlakie Compliance Center overview"
      />

      {/* Welcome */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
            {(admin.full_name ?? admin.email)[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Welcome back, {admin.full_name ?? admin.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-400">
              Signed in as{' '}
              <span className={`font-semibold ${
                isSuperadmin(admin) ? 'text-red-600' : canWrite(admin) ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {admin.role}
              </span>
              {' '}· {admin.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="States" value={stats.states} href="/admin/jurisdictions" />
        <StatCard label="Jurisdictions" value={stats.jurisdictions} href="/admin/jurisdictions" />
        <StatCard label="Rule Types" value={stats.ruleTypes} href="/admin/rule-types" />
        <StatCard label="Queue Pending" value={stats.queuePending} href="/admin/verification-queue" accent={stats.queuePending > 0} />
        <StatCard label="Open Alerts" value={stats.alertsOpen} href="/admin/data-health" accent={stats.alertsOpen > 0} />
      </div>

      {/* Phase notice */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Build status</p>
        <p className="mt-1 text-sm text-gray-600">
          Phase 4 complete. All navigation sections are scaffolded. Jurisdiction manager, rule editor,
          rate manager, verification queue, and calculator will be built in upcoming phases.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-500 sm:grid-cols-6">
          {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].map((p) => (
            <span key={p} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {p} ✓
            </span>
          ))}
          {['Phase 5+'].map((p) => (
            <span key={p} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              {p}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
