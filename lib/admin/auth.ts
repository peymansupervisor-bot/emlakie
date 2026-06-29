import 'server-only'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export type AdminRole = 'viewer' | 'editor' | 'superadmin'

export interface AdminUser {
  id: string
  auth_user_id: string
  email: string
  full_name: string | null
  role: AdminRole
  is_active: boolean
}

/**
 * Returns the current admin user from compliance_admin_users,
 * or null if the session is unauthenticated or the user has no admin row.
 * Uses the service role so RLS does not filter the lookup.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createSupabaseAdmin()
  const { data, error } = await admin
    .from('compliance_admin_users')
    .select('id, auth_user_id, email, full_name, role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !data) return null
  return data as AdminUser
}

/**
 * Server-side guard. Call at the top of any admin Server Component or
 * API route. Redirects to login if unauthenticated, to /admin/unauthorized
 * if authenticated but not an active admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const admin = createSupabaseAdmin()
  const { data, error } = await admin
    .from('compliance_admin_users')
    .select('id, auth_user_id, email, full_name, role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !data || !data.is_active) redirect('/admin/unauthorized')

  return data as AdminUser
}

/**
 * Same as requireAdmin but also enforces a minimum role.
 * Roles are ordered: viewer < editor < superadmin.
 */
export async function requireAdminRole(minimumRole: AdminRole): Promise<AdminUser> {
  const adminUser = await requireAdmin()
  const order: Record<AdminRole, number> = { viewer: 0, editor: 1, superadmin: 2 }

  if (order[adminUser.role] < order[minimumRole]) {
    redirect('/admin/unauthorized')
  }

  return adminUser
}

// ─── Role predicate helpers (server-safe, cheap) ─────────────────────────────

export function isViewer(admin: AdminUser): boolean {
  return admin.role === 'viewer'
}

export function isEditor(admin: AdminUser): boolean {
  return admin.role === 'editor' || admin.role === 'superadmin'
}

export function isSuperadmin(admin: AdminUser): boolean {
  return admin.role === 'superadmin'
}

export function canWrite(admin: AdminUser): boolean {
  return admin.role === 'editor' || admin.role === 'superadmin'
}

export function canDelete(admin: AdminUser): boolean {
  return admin.role === 'superadmin'
}
