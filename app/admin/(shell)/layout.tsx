import { requireAdmin } from '@/lib/admin/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const metadata = { title: 'Admin — Emlakie Compliance' }

async function fetchBadgeCounts(): Promise<{ queueCount: number; alertCount: number }> {
  try {
    const db = createSupabaseAdmin()
    const [queue, alerts] = await Promise.all([
      db.from('compliance_verification_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      db.from('compliance_data_quality_alerts').select('id', { count: 'exact', head: true }).eq('is_resolved', false),
    ])
    return {
      queueCount: queue.count ?? 0,
      alertCount: alerts.count ?? 0,
    }
  } catch {
    return { queueCount: 0, alertCount: 0 }
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  const { queueCount, alertCount } = await fetchBadgeCounts()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar — fixed width, full height */}
      <AdminSidebar role={admin.role} queueCount={queueCount} alertCount={alertCount} />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          email={admin.email}
          fullName={admin.full_name}
          role={admin.role}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
