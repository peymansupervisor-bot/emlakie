'use client'

import type { AdminRole } from '@/lib/admin/auth'

interface Props {
  email: string
  fullName: string | null
  role: AdminRole
  title?: string
}

export default function AdminHeader({ email, fullName, role, title }: Props) {
  const displayName = fullName ?? email.split('@')[0]

  async function handleLogout() {
    // This area's session lives in cookies (set by the @supabase/ssr server
    // client at login, read by middleware.ts and requireAdmin()) — signing
    // out must go through a server route using that same client, not
    // lib/supabase.ts's localStorage-based client, or the cookie session
    // (and full admin access) stays alive indefinitely.
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {title && <span className="font-semibold text-gray-900">{title}</span>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-gray-500 sm:inline">Signed in as</span>
          <span className="font-medium text-gray-900">{displayName}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            role === 'superadmin'
              ? 'bg-red-100 text-red-700'
              : role === 'editor'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
