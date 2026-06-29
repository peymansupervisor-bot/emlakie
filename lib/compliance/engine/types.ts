// ── Input types ───────────────────────────────────────────────────────────────

export interface JurisdictionLookup {
  id?: string
  slug?: string
}

export interface RuleResolutionInput {
  jurisdictionId: string
  ruleTypeId: string
  asOfDate?: Date
}

export interface RateResolutionInput {
  legalRuleId: string
  rateKey?: string
  asOfDate?: Date
}

export interface ExemptionResolutionInput {
  legalRuleId: string
}

export interface CitationResolutionInput {
  jurisdictionId: string
  citationId?: string
  asOfDate?: Date
}

export interface HistoricalRulesInput {
  jurisdictionId: string
  ruleTypeId: string
}

// ── DB row types (mirrors compliance_* table columns) ─────────────────────────

export interface JurisdictionRow {
  id: string
  name: string
  short_name: string | null
  jurisdiction_type: string
  state_id: string | null
  seo_slug: string | null
  status: string
  interest_required: boolean
  priority_tier: number
  governing_rule_id: string | null
}

export interface LegalRuleRow {
  id: string
  jurisdiction_id: string
  rule_type_id: string
  version_number: number
  is_current: boolean
  rule_name: string
  effective_date: string       // ISO 8601 date string, e.g. "2022-01-01"
  superseded_date: string | null
  rule_applies: boolean
  not_applicable_reason: string | null
  parameters: Record<string, unknown>
  citation_id: string | null
  change_reason: string | null
  created_at: string
}

export interface RateRow {
  id: string
  legal_rule_id: string
  jurisdiction_id: string
  rule_type_id: string
  rate_key: string
  effective_from: string       // ISO 8601 date string
  effective_to: string | null
  numeric_value: number
  rate_source_description: string | null
  rate_source_url: string | null
  is_published: boolean
  notes: string | null
}

export interface ExemptionRow {
  id: string
  legal_rule_id: string
  jurisdiction_id: string
  exemption_type: string
  condition_operator: string | null
  condition_value: string | null
  exemption_description: string | null
  citation_section: string | null
  is_active: boolean
}

export interface CitationRow {
  id: string
  jurisdiction_id: string
  citation_type: string
  code_name: string | null
  section: string | null
  subsection: string | null
  full_citation_formatted: string | null
  plain_english_summary: string | null
  official_url: string | null
  effective_date: string | null
}

export interface RuleTypeRow {
  id: string
  slug: string
  name: string
}

// ── Resolution result ─────────────────────────────────────────────────────────

export type RuleResolutionStatus =
  | 'rule_found'        // active rule found, rule_applies = true
  | 'not_applicable'    // rule found but rule_applies = false
  | 'no_rule'           // no matching rule for this jurisdiction + rule type + date
  | 'jurisdiction_not_found'

export interface RuleResolution {
  status: RuleResolutionStatus
  rule: LegalRuleRow | null
  rates: RateRow[]
  exemptions: ExemptionRow[]
  citation: CitationRow | null
  asOfDate: Date
  resolvedAt: Date
}
