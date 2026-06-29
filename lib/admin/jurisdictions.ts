import 'server-only'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export type JurisdictionStatus = 'active' | 'pending' | 'no_requirement' | 'inactive'
export type JurisdictionType = 'city' | 'county' | 'state'

export interface JurisdictionRow {
  id: string
  name: string
  short_name: string
  jurisdiction_type: JurisdictionType
  state_id: string
  county_id: string | null
  city_id: string | null
  governing_rule_id: string | null
  status: JurisdictionStatus
  interest_required: boolean
  seo_slug: string
  meta_title: string | null
  meta_description: string | null
  official_housing_authority_url: string | null
  last_verified_at: string | null
  last_verified_by: string | null
  verification_source_url: string | null
  verification_notes: string | null
  priority_tier: number
  calculation_count: number
  created_at: string
  updated_at: string
  state?: { id: string; code: string; name: string } | null
}

export interface ChangeHistoryRow {
  id: string
  entity_type: string
  entity_id: string
  change_type: string
  field_changed: string | null
  previous_value_json: unknown
  new_value_json: unknown
  change_notes: string | null
  changed_by: string
  changed_at: string
}

export interface StateRow {
  id: string
  code: string
  name: string
}

export interface ListFilters {
  status?: string
  jurisdiction_type?: string
  state_id?: string
  interest_required?: string
  priority_tier?: string
  search?: string
  page?: number
}

export const PAGE_SIZE = 50

export async function listJurisdictions(filters: ListFilters) {
  const db = createSupabaseAdmin()
  let query = db
    .from('compliance_jurisdictions')
    .select(
      'id, name, short_name, jurisdiction_type, status, interest_required, seo_slug, priority_tier, calculation_count, created_at, state:compliance_states(code, name)',
      { count: 'exact' }
    )
    .order('name')

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.jurisdiction_type) query = query.eq('jurisdiction_type', filters.jurisdiction_type)
  if (filters.state_id) query = query.eq('state_id', filters.state_id)
  if (filters.interest_required === 'true') query = query.eq('interest_required', true)
  if (filters.interest_required === 'false') query = query.eq('interest_required', false)
  if (filters.priority_tier) query = query.eq('priority_tier', parseInt(filters.priority_tier))
  if (filters.search) {
    const safe = filters.search.replace(/[%_]/g, '\\$&')
    query = query.or(`name.ilike.%${safe}%,seo_slug.ilike.%${safe}%`)
  }

  const page = Math.max(1, filters.page ?? 1)
  const from = (page - 1) * PAGE_SIZE
  query = query.range(from, from + PAGE_SIZE - 1)

  return query
}

export async function getJurisdiction(id: string): Promise<JurisdictionRow | null> {
  const db = createSupabaseAdmin()
  const { data, error } = await db
    .from('compliance_jurisdictions')
    .select('*, state:compliance_states(id, code, name)')
    .eq('id', id)
    .single()
  if (error) return null
  return data as JurisdictionRow
}

export async function getJurisdictionHistory(jurisdictionId: string): Promise<ChangeHistoryRow[]> {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_rule_change_history')
    .select('*')
    .eq('entity_type', 'jurisdiction')
    .eq('entity_id', jurisdictionId)
    .order('changed_at', { ascending: false })
    .limit(50)
  return (data ?? []) as ChangeHistoryRow[]
}

export async function listStates(): Promise<StateRow[]> {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_states')
    .select('id, code, name')
    .order('name')
  return (data ?? []) as StateRow[]
}

export async function logChange(params: {
  entity_type: string
  entity_id: string
  jurisdiction_id: string | null
  changed_by: string
  change_type: string
  field_changed?: string | null
  previous_value_json?: unknown
  new_value_json?: unknown
  change_notes?: string | null
}) {
  const db = createSupabaseAdmin()
  await db.from('compliance_rule_change_history').insert({
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    jurisdiction_id: params.jurisdiction_id,
    changed_by: params.changed_by,
    change_type: params.change_type,
    field_changed: params.field_changed ?? null,
    previous_value_json: params.previous_value_json ?? null,
    new_value_json: params.new_value_json ?? null,
    change_notes: params.change_notes ?? null,
  })
}
