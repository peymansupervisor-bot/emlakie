import 'server-only'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import type { AdminUser } from './auth'

export interface RateRow {
  id: string
  legal_rule_id: string
  jurisdiction_id: string
  rule_type_id: string
  rate_key: string
  effective_from: string
  effective_to: string | null
  numeric_value: number
  rate_source_description: string
  rate_source_url: string | null
  rate_source_pdf_path: string | null
  is_published: boolean
  created_by: string | null
  approved_by: string | null
  approved_at: string | null
  rejected_by: string | null
  rejected_at: string | null
  rejection_notes: string | null
  notes: string | null
  created_at: string
}

export interface RateWithRelations extends RateRow {
  jurisdiction: { id: string; name: string; seo_slug: string } | null
  legal_rule: { id: string; rule_name: string; version_number: number; is_current: boolean; effective_date: string } | null
  rule_type: { id: string; name: string; slug: string } | null
}

export interface CreateRateInput {
  legal_rule_id: string
  jurisdiction_id: string
  rule_type_id: string
  rate_key: string
  effective_from: string
  effective_to: string | null
  numeric_value: number
  rate_source_description: string
  rate_source_url: string | null
  notes: string | null
}

export const RATES_PAGE_SIZE = 25

export interface ListRatesFilters {
  jurisdiction_id?: string
  rule_type_id?: string
  is_published?: string
  rate_key?: string
  search?: string
  page?: number
}

const RATE_SELECT = `
  *,
  jurisdiction:compliance_jurisdictions!jurisdiction_id(id, name, seo_slug),
  legal_rule:compliance_legal_rules!legal_rule_id(id, rule_name, version_number, is_current, effective_date),
  rule_type:compliance_rule_types!rule_type_id(id, name, slug)
`

export async function listRatesForJurisdiction(
  jurisdictionId: string,
): Promise<RateWithRelations[]> {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_rule_rates')
    .select(RATE_SELECT)
    .eq('jurisdiction_id', jurisdictionId)
    .order('effective_from', { ascending: false })
  return (data ?? []) as unknown as RateWithRelations[]
}

export async function listAllRates(
  filters: ListRatesFilters = {},
): Promise<{ data: RateWithRelations[]; count: number }> {
  const db = createSupabaseAdmin()
  const page = filters.page ?? 1
  const from = (page - 1) * RATES_PAGE_SIZE
  const to = from + RATES_PAGE_SIZE - 1

  let query = db
    .from('compliance_rule_rates')
    .select(RATE_SELECT, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (filters.jurisdiction_id) query = query.eq('jurisdiction_id', filters.jurisdiction_id)
  if (filters.rule_type_id) query = query.eq('rule_type_id', filters.rule_type_id)
  if (filters.rate_key) query = query.eq('rate_key', filters.rate_key)
  if (filters.is_published !== undefined && filters.is_published !== '') {
    query = query.eq('is_published', filters.is_published === 'true')
  }
  if (filters.search) {
    query = query.ilike('rate_source_description', `%${filters.search}%`)
  }

  const { data, count, error } = await query
  if (error) return { data: [], count: 0 }
  return { data: (data ?? []) as unknown as RateWithRelations[], count: count ?? 0 }
}

export async function getRate(id: string): Promise<RateWithRelations | null> {
  const db = createSupabaseAdmin()
  const { data, error } = await db
    .from('compliance_rule_rates')
    .select(RATE_SELECT)
    .eq('id', id)
    .single()
  if (error) return null
  return data as unknown as RateWithRelations
}

export async function getRateHistory(rateId: string) {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_rule_change_history')
    .select('*')
    .eq('entity_id', rateId)
    .eq('entity_type', 'rate')
    .order('changed_at', { ascending: false })
  return data ?? []
}

/**
 * Checks whether a published rate for the same (legal_rule_id, rate_key) overlaps
 * with the proposed [effective_from, effective_to) window.
 * Two date ranges [A,B) and [C,D) overlap when A < D and C < B
 * (treating null effective_to as +infinity).
 * excludeId: skip a row when updating an existing rate.
 */
export async function checkPublishedOverlap(
  legalRuleId: string,
  rateKey: string,
  effectiveFrom: string,
  effectiveTo: string | null,
  excludeId?: string,
): Promise<RateRow | null> {
  const db = createSupabaseAdmin()

  // Find any published rate whose period overlaps with [effectiveFrom, effectiveTo)
  // Overlap condition (intervals [A,B) and [C,D)):
  //   A < D  (or D is null)  →  effectiveFrom < existing.effective_to OR existing.effective_to IS NULL
  //   C < B  (or B is null)  →  existing.effective_from < effectiveTo OR effectiveTo IS NULL
  let query = db
    .from('compliance_rule_rates')
    .select('*')
    .eq('legal_rule_id', legalRuleId)
    .eq('rate_key', rateKey)
    .eq('is_published', true)

  // existing.effective_to IS NULL OR existing.effective_to > effectiveFrom
  query = query.or(`effective_to.is.null,effective_to.gt.${effectiveFrom}`)

  // effectiveTo IS NULL OR effectiveTo > existing.effective_from
  if (effectiveTo !== null) {
    query = query.lt('effective_from', effectiveTo)
  }

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query.limit(1).maybeSingle()
  return (data as RateRow | null) ?? null
}

export async function createRate(
  input: CreateRateInput,
  admin: AdminUser,
): Promise<{ id: string } | { error: string }> {
  const db = createSupabaseAdmin()

  // Verify legal_rule belongs to jurisdiction (prevent cross-jurisdiction injection)
  const { data: rule } = await db
    .from('compliance_legal_rules')
    .select('id, jurisdiction_id, rule_type_id')
    .eq('id', input.legal_rule_id)
    .eq('jurisdiction_id', input.jurisdiction_id)
    .single()

  if (!rule) {
    return { error: 'Legal rule not found in this jurisdiction.' }
  }

  // Overlap check — block if a published rate already covers this period
  const overlap = await checkPublishedOverlap(
    input.legal_rule_id,
    input.rate_key,
    input.effective_from,
    input.effective_to,
  )
  if (overlap) {
    const period = overlap.effective_to
      ? `${overlap.effective_from} – ${overlap.effective_to}`
      : `${overlap.effective_from} – present`
    return {
      error: `A published rate for this rule and rate key already covers the period ${period}. Resolve the overlap before saving.`,
    }
  }

  const { data, error } = await db
    .from('compliance_rule_rates')
    .insert({
      legal_rule_id: input.legal_rule_id,
      jurisdiction_id: input.jurisdiction_id,
      rule_type_id: rule.rule_type_id,
      rate_key: input.rate_key,
      effective_from: input.effective_from,
      effective_to: input.effective_to ?? null,
      numeric_value: input.numeric_value,
      rate_source_description: input.rate_source_description,
      rate_source_url: input.rate_source_url ?? null,
      notes: input.notes ?? null,
      is_published: false,
      created_by: admin.id,
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to create rate.' }

  await db.from('compliance_rule_change_history').insert({
    entity_type: 'rate',
    entity_id: data.id,
    change_type: 'create',
    field_changed: null,
    previous_value_json: null,
    new_value_json: { ...input, is_published: false },
    change_notes: `Rate created: ${input.numeric_value}% from ${input.effective_from}`,
    changed_by: admin.id,
    changed_at: new Date().toISOString(),
  })

  return { id: data.id }
}

export async function approveRate(
  rateId: string,
  admin: AdminUser,
): Promise<{ success: true } | { error: string }> {
  const db = createSupabaseAdmin()

  const rate = await getRate(rateId)
  if (!rate) return { error: 'Rate not found.' }
  if (rate.is_published) return { error: 'Rate is already published.' }

  // Re-check overlap at approve time (another rate may have been approved since creation)
  const overlap = await checkPublishedOverlap(
    rate.legal_rule_id,
    rate.rate_key,
    rate.effective_from,
    rate.effective_to,
    rateId,
  )
  if (overlap) {
    const period = overlap.effective_to
      ? `${overlap.effective_from} – ${overlap.effective_to}`
      : `${overlap.effective_from} – present`
    return {
      error: `Cannot approve: a published rate already covers the period ${period}. Resolve the overlap first.`,
    }
  }

  const now = new Date().toISOString()
  const { error } = await db
    .from('compliance_rule_rates')
    .update({ is_published: true, approved_by: admin.id, approved_at: now })
    .eq('id', rateId)

  if (error) return { error: error.message }

  await db.from('compliance_rule_change_history').insert({
    entity_type: 'rate',
    entity_id: rateId,
    change_type: 'approve',
    field_changed: 'is_published',
    previous_value_json: { is_published: false },
    new_value_json: { is_published: true },
    change_notes: `Rate approved and published by ${admin.email}`,
    changed_by: admin.id,
    changed_at: now,
  })

  return { success: true }
}

export async function rejectRate(
  rateId: string,
  notes: string,
  admin: AdminUser,
): Promise<{ success: true } | { error: string }> {
  const db = createSupabaseAdmin()

  const rate = await getRate(rateId)
  if (!rate) return { error: 'Rate not found.' }
  if (rate.is_published) return { error: 'Cannot reject an already-published rate.' }

  const now = new Date().toISOString()
  const { error } = await db
    .from('compliance_rule_rates')
    .update({ rejected_by: admin.id, rejected_at: now, rejection_notes: notes })
    .eq('id', rateId)

  if (error) return { error: error.message }

  await db.from('compliance_rule_change_history').insert({
    entity_type: 'rate',
    entity_id: rateId,
    change_type: 'reject',
    field_changed: null,
    previous_value_json: null,
    new_value_json: { rejection_notes: notes },
    change_notes: `Rate rejected: ${notes}`,
    changed_by: admin.id,
    changed_at: now,
  })

  return { success: true }
}
