import 'server-only'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import type { AdminUser } from './auth'

export interface LegalRuleRow {
  id: string
  jurisdiction_id: string
  rule_type_id: string
  version_number: number
  is_current: boolean
  rule_name: string
  effective_date: string
  superseded_date: string | null
  rule_applies: boolean
  not_applicable_reason: string | null
  parameters: Record<string, unknown>
  citation_id: string | null
  change_reason: string | null
  created_at: string
}

export interface LegalRuleWithRelations extends LegalRuleRow {
  jurisdiction: { id: string; name: string; seo_slug: string; state: { code: string } | null } | null
  rule_type: { id: string; name: string; slug: string } | null
  citation: { id: string; code_name: string; section: string; full_citation_formatted: string | null } | null
}

export interface CreateLegalRuleInput {
  jurisdiction_id: string
  rule_type_id: string
  rule_name: string
  effective_date: string
  rule_applies: boolean
  not_applicable_reason: string | null
  parameters: Record<string, unknown>
  citation_id: string | null
  change_reason: string
}

export const LEGAL_RULES_PAGE_SIZE = 25

export interface ListLegalRulesFilters {
  jurisdiction_id?: string
  rule_type_id?: string
  state_id?: string
  is_current?: string
  rule_applies?: string
  search?: string
  page?: number
}

export async function listLegalRules(
  filters: ListLegalRulesFilters = {},
): Promise<{ data: LegalRuleWithRelations[]; count: number }> {
  const db = createSupabaseAdmin()
  const page = filters.page ?? 1
  const from = (page - 1) * LEGAL_RULES_PAGE_SIZE
  const to = from + LEGAL_RULES_PAGE_SIZE - 1

  let query = db
    .from('compliance_legal_rules')
    .select(
      `*,
       jurisdiction:compliance_jurisdictions!jurisdiction_id(id, name, seo_slug, state_id, state:compliance_states!state_id(code)),
       rule_type:compliance_rule_types!rule_type_id(id, name, slug),
       citation:compliance_law_citations!citation_id(id, code_name, section, full_citation_formatted)`,
      { count: 'exact' },
    )
    .range(from, to)
    .order('created_at', { ascending: false })

  if (filters.jurisdiction_id) {
    query = query.eq('jurisdiction_id', filters.jurisdiction_id)
  }
  if (filters.rule_type_id) {
    query = query.eq('rule_type_id', filters.rule_type_id)
  }
  if (filters.is_current !== undefined && filters.is_current !== '') {
    query = query.eq('is_current', filters.is_current === 'true')
  }
  if (filters.rule_applies !== undefined && filters.rule_applies !== '') {
    query = query.eq('rule_applies', filters.rule_applies === 'true')
  }
  if (filters.search) {
    query = query.ilike('rule_name', `%${filters.search}%`)
  }

  const { data, error, count } = await query
  if (error) return { data: [], count: 0 }
  return { data: (data ?? []) as unknown as LegalRuleWithRelations[], count: count ?? 0 }
}

export async function listRulesForJurisdiction(
  jurisdictionId: string,
): Promise<LegalRuleWithRelations[]> {
  const db = createSupabaseAdmin()
  const { data, error } = await db
    .from('compliance_legal_rules')
    .select(
      `*,
       rule_type:compliance_rule_types!rule_type_id(id, name, slug),
       citation:compliance_law_citations!citation_id(id, code_name, section, full_citation_formatted)`,
    )
    .eq('jurisdiction_id', jurisdictionId)
    .order('rule_type_id', { ascending: true })
    .order('version_number', { ascending: false })
  if (error) return []
  return (data ?? []) as unknown as LegalRuleWithRelations[]
}

export async function getLegalRule(id: string): Promise<LegalRuleWithRelations | null> {
  const db = createSupabaseAdmin()
  const { data, error } = await db
    .from('compliance_legal_rules')
    .select(
      `*,
       jurisdiction:compliance_jurisdictions!jurisdiction_id(id, name, seo_slug, state_id, state:compliance_states!state_id(code)),
       rule_type:compliance_rule_types!rule_type_id(id, name, slug),
       citation:compliance_law_citations!citation_id(id, code_name, section, full_citation_formatted)`,
    )
    .eq('id', id)
    .single()
  if (error) return null
  return data as unknown as LegalRuleWithRelations
}

export async function getNextVersionNumber(
  jurisdictionId: string,
  ruleTypeId: string,
): Promise<number> {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_legal_rules')
    .select('version_number')
    .eq('jurisdiction_id', jurisdictionId)
    .eq('rule_type_id', ruleTypeId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()
  return ((data?.version_number as number | null) ?? 0) + 1
}

export async function getCurrentRule(
  jurisdictionId: string,
  ruleTypeId: string,
): Promise<LegalRuleRow | null> {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_legal_rules')
    .select('*')
    .eq('jurisdiction_id', jurisdictionId)
    .eq('rule_type_id', ruleTypeId)
    .eq('is_current', true)
    .limit(1)
    .single()
  return (data as LegalRuleRow | null) ?? null
}

export async function getRuleHistory(ruleId: string) {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_rule_change_history')
    .select('*')
    .eq('entity_id', ruleId)
    .eq('entity_type', 'legal_rule')
    .order('changed_at', { ascending: false })
  return data ?? []
}

export async function listCitationsForJurisdiction(jurisdictionId: string) {
  const db = createSupabaseAdmin()
  const { data } = await db
    .from('compliance_law_citations')
    .select('id, code_name, section, full_citation_formatted')
    .eq('jurisdiction_id', jurisdictionId)
    .order('code_name')
  return (data ?? []) as Array<{
    id: string
    code_name: string
    section: string
    full_citation_formatted: string | null
  }>
}

export async function createLegalRule(
  input: CreateLegalRuleInput,
  admin: AdminUser,
): Promise<{ id: string } | { error: string }> {
  const db = createSupabaseAdmin()

  const version = await getNextVersionNumber(input.jurisdiction_id, input.rule_type_id)
  const prevCurrent = await getCurrentRule(input.jurisdiction_id, input.rule_type_id)

  // Supersede the previous current rule
  if (prevCurrent) {
    const { error: supErr } = await db
      .from('compliance_legal_rules')
      .update({
        is_current: false,
        superseded_date: input.effective_date,
      })
      .eq('id', prevCurrent.id)

    if (supErr) return { error: `Failed to supersede previous rule: ${supErr.message}` }

    await db.from('compliance_rule_change_history').insert({
      entity_type: 'legal_rule',
      entity_id: prevCurrent.id,
      change_type: 'superseded',
      field_changed: 'is_current',
      previous_value_json: { is_current: true, superseded_date: null },
      new_value_json: { is_current: false, superseded_date: input.effective_date },
      change_notes: `Superseded by v${version}: ${input.change_reason}`,
      changed_by: admin.email,
      changed_at: new Date().toISOString(),
    })
  }

  // Insert new rule
  const { data, error } = await db
    .from('compliance_legal_rules')
    .insert({
      jurisdiction_id: input.jurisdiction_id,
      rule_type_id: input.rule_type_id,
      version_number: version,
      is_current: true,
      rule_name: input.rule_name,
      effective_date: input.effective_date,
      superseded_date: null,
      rule_applies: input.rule_applies,
      not_applicable_reason: input.not_applicable_reason,
      parameters: input.parameters,
      citation_id: input.citation_id || null,
      change_reason: input.change_reason,
    })
    .select('id')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to create legal rule' }

  await db.from('compliance_rule_change_history').insert({
    entity_type: 'legal_rule',
    entity_id: data.id,
    change_type: 'create',
    field_changed: null,
    previous_value_json: null,
    new_value_json: { ...input, version_number: version, is_current: true },
    change_notes: input.change_reason,
    changed_by: admin.email,
    changed_at: new Date().toISOString(),
  })

  return { id: data.id }
}
