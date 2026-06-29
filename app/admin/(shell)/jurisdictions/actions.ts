'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminRole } from '@/lib/admin/auth'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { getJurisdiction, logChange } from '@/lib/admin/jurisdictions'

function str(fd: FormData, key: string): string {
  return ((fd.get(key) as string) ?? '').trim()
}
function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key)
  return v || null
}

export async function createJurisdictionAction(formData: FormData): Promise<void> {
  const admin = await requireAdminRole('editor')
  const db = createSupabaseAdmin()

  const name = str(formData, 'name')
  const seo_slug = str(formData, 'seo_slug')
  const state_id = str(formData, 'state_id')

  if (!name || !seo_slug || !state_id) {
    redirect('/admin/jurisdictions/new?error=' + encodeURIComponent('Name, slug, and state are required'))
  }

  const payload = {
    name,
    short_name: str(formData, 'short_name') || name,
    jurisdiction_type: str(formData, 'jurisdiction_type') || 'city',
    state_id,
    county_id: optStr(formData, 'county_id'),
    city_id: optStr(formData, 'city_id'),
    status: str(formData, 'status') || 'pending',
    interest_required: str(formData, 'interest_required') === 'true',
    seo_slug,
    priority_tier: parseInt(str(formData, 'priority_tier')) || 3,
    official_housing_authority_url: optStr(formData, 'official_housing_authority_url'),
    verification_source_url: optStr(formData, 'verification_source_url'),
    verification_notes: optStr(formData, 'verification_notes'),
    meta_title: optStr(formData, 'meta_title'),
    meta_description: optStr(formData, 'meta_description'),
  }

  const { data, error } = await db.from('compliance_jurisdictions').insert(payload).select('id').single()

  if (error || !data) {
    redirect('/admin/jurisdictions/new?error=' + encodeURIComponent(error?.message ?? 'Failed to create jurisdiction'))
  }

  await logChange({
    entity_type: 'jurisdiction',
    entity_id: data.id,
    jurisdiction_id: data.id,
    changed_by: admin.auth_user_id,
    change_type: 'create',
    new_value_json: payload,
    change_notes: 'Jurisdiction created via admin',
  })

  revalidatePath('/admin/jurisdictions')
  redirect(`/admin/jurisdictions/${data.id}`)
}

export async function updateJurisdictionAction(formData: FormData): Promise<void> {
  const admin = await requireAdminRole('editor')
  const db = createSupabaseAdmin()

  const id = str(formData, 'id')
  if (!id) redirect('/admin/jurisdictions?error=' + encodeURIComponent('Missing jurisdiction ID'))

  const name = str(formData, 'name')
  const seo_slug = str(formData, 'seo_slug')
  const state_id = str(formData, 'state_id')

  if (!name || !seo_slug || !state_id) {
    redirect(`/admin/jurisdictions/${id}/edit?error=` + encodeURIComponent('Name, slug, and state are required'))
  }

  const before = await getJurisdiction(id)

  const payload = {
    name,
    short_name: str(formData, 'short_name') || name,
    jurisdiction_type: str(formData, 'jurisdiction_type') || 'city',
    state_id,
    county_id: optStr(formData, 'county_id'),
    status: str(formData, 'status') || 'pending',
    interest_required: str(formData, 'interest_required') === 'true',
    seo_slug,
    priority_tier: parseInt(str(formData, 'priority_tier')) || 3,
    official_housing_authority_url: optStr(formData, 'official_housing_authority_url'),
    verification_source_url: optStr(formData, 'verification_source_url'),
    verification_notes: optStr(formData, 'verification_notes'),
    meta_title: optStr(formData, 'meta_title'),
    meta_description: optStr(formData, 'meta_description'),
    updated_at: new Date().toISOString(),
  }

  const { error } = await db.from('compliance_jurisdictions').update(payload).eq('id', id)

  if (error) {
    redirect(`/admin/jurisdictions/${id}/edit?error=` + encodeURIComponent(error.message))
  }

  await logChange({
    entity_type: 'jurisdiction',
    entity_id: id,
    jurisdiction_id: id,
    changed_by: admin.auth_user_id,
    change_type: 'update',
    previous_value_json: before,
    new_value_json: payload,
    change_notes: 'Jurisdiction updated via admin',
  })

  revalidatePath(`/admin/jurisdictions/${id}`)
  revalidatePath('/admin/jurisdictions')
  redirect(`/admin/jurisdictions/${id}`)
}

export async function verifyJurisdictionAction(formData: FormData): Promise<void> {
  const admin = await requireAdminRole('editor')
  const db = createSupabaseAdmin()

  const id = str(formData, 'id')
  const newStatus = str(formData, 'status') as 'active' | 'no_requirement'
  const sourceUrl = optStr(formData, 'verification_source_url')
  const notes = optStr(formData, 'verification_notes')

  if (!id || !['active', 'no_requirement'].includes(newStatus)) {
    redirect(`/admin/jurisdictions/${id}?error=` + encodeURIComponent('Invalid verify request'))
  }

  const before = await getJurisdiction(id)

  const { error } = await db.from('compliance_jurisdictions').update({
    status: newStatus,
    last_verified_at: new Date().toISOString(),
    last_verified_by: admin.auth_user_id,
    verification_source_url: sourceUrl,
    verification_notes: notes,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) {
    redirect(`/admin/jurisdictions/${id}?error=` + encodeURIComponent(error.message))
  }

  await logChange({
    entity_type: 'jurisdiction',
    entity_id: id,
    jurisdiction_id: id,
    changed_by: admin.auth_user_id,
    change_type: 'verify',
    field_changed: 'status',
    previous_value_json: { status: before?.status },
    new_value_json: { status: newStatus },
    change_notes: notes ?? `Verified as ${newStatus}`,
  })

  revalidatePath(`/admin/jurisdictions/${id}`)
  redirect(`/admin/jurisdictions/${id}?verified=1`)
}

export async function flagForReviewAction(formData: FormData): Promise<void> {
  const admin = await requireAdminRole('editor')
  const db = createSupabaseAdmin()

  const id = str(formData, 'id')
  const reason = str(formData, 'reason') || 'Flagged for review'
  const priority = Math.min(5, Math.max(1, parseInt(str(formData, 'priority')) || 3))

  if (!id) {
    redirect('/admin/jurisdictions?error=' + encodeURIComponent('Missing jurisdiction ID'))
  }

  const { error } = await db.from('compliance_verification_queue').insert({
    jurisdiction_id: id,
    reason,
    priority,
    status: 'pending',
  })

  if (error) {
    redirect(`/admin/jurisdictions/${id}?error=` + encodeURIComponent(error.message))
  }

  await logChange({
    entity_type: 'jurisdiction',
    entity_id: id,
    jurisdiction_id: id,
    changed_by: admin.auth_user_id,
    change_type: 'flag_review',
    change_notes: reason,
  })

  revalidatePath(`/admin/jurisdictions/${id}`)
  redirect(`/admin/jurisdictions/${id}?flagged=1`)
}
