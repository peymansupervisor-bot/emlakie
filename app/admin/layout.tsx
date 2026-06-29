import { requireAdmin } from '@/lib/admin/auth'

export const metadata = { title: 'Admin — Emlakie Compliance' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // requireAdmin redirects server-side before any HTML is rendered.
  // The resolved admin is available to child Server Components via prop drilling
  // or by calling requireAdmin() / getCurrentAdmin() again in each child.
  await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}
