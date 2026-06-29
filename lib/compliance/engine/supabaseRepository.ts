import { createSupabaseAdmin } from '@/lib/supabase-server'
import type { ComplianceRepository } from './repository'
import type {
  JurisdictionLookup,
  JurisdictionRow,
  LegalRuleRow,
  RateRow,
  ExemptionRow,
  CitationRow,
  RuleTypeRow,
} from './types'

const JURISDICTION_COLUMNS =
  'id,name,short_name,jurisdiction_type,state_id,seo_slug,status,interest_required,priority_tier,governing_rule_id'

const CITATION_COLUMNS =
  'id,jurisdiction_id,citation_type,code_name,section,subsection,full_citation_formatted,plain_english_summary,official_url,effective_date'

const RATE_COLUMNS =
  'id,legal_rule_id,jurisdiction_id,rule_type_id,rate_key,effective_from,effective_to,numeric_value,rate_source_description,rate_source_url,is_published,notes'

const EXEMPTION_COLUMNS =
  'id,legal_rule_id,jurisdiction_id,exemption_type,condition_operator,condition_value,exemption_description,citation_section,is_active'

export class SupabaseComplianceRepository implements ComplianceRepository {
  private get db() {
    return createSupabaseAdmin()
  }

  async findJurisdiction(lookup: JurisdictionLookup): Promise<JurisdictionRow | null> {
    if (!lookup.id && !lookup.slug) return null

    const query = this.db
      .from('compliance_jurisdictions')
      .select(JURISDICTION_COLUMNS)

    const { data } = lookup.id
      ? await query.eq('id', lookup.id).maybeSingle()
      : await query.eq('seo_slug', lookup.slug!).maybeSingle()

    return (data as JurisdictionRow | null) ?? null
  }

  async findApplicableRule(
    jurisdictionId: string,
    ruleTypeId: string,
    asOfDateIso: string,
  ): Promise<LegalRuleRow | null> {
    const { data } = await this.db
      .from('compliance_legal_rules')
      .select('*')
      .eq('jurisdiction_id', jurisdictionId)
      .eq('rule_type_id', ruleTypeId)
      .lte('effective_date', asOfDateIso)
      .or(`superseded_date.is.null,superseded_date.gt.${asOfDateIso}`)
      .order('effective_date', { ascending: false })
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle()

    return (data as LegalRuleRow | null) ?? null
  }

  async findApplicableRates(
    legalRuleId: string,
    rateKey: string | undefined,
    asOfDateIso: string,
  ): Promise<RateRow[]> {
    let query = this.db
      .from('compliance_rule_rates')
      .select(RATE_COLUMNS)
      .eq('legal_rule_id', legalRuleId)
      .eq('is_published', true)
      .lte('effective_from', asOfDateIso)
      .or(`effective_to.is.null,effective_to.gt.${asOfDateIso}`)
      .order('effective_from', { ascending: false })

    if (rateKey) {
      query = query.eq('rate_key', rateKey)
    }

    const { data } = await query
    return (data as RateRow[]) ?? []
  }

  async findActiveExemptions(legalRuleId: string): Promise<ExemptionRow[]> {
    const { data } = await this.db
      .from('compliance_rule_exemptions')
      .select(EXEMPTION_COLUMNS)
      .eq('legal_rule_id', legalRuleId)
      .eq('is_active', true)
      .order('exemption_type')

    return (data as ExemptionRow[]) ?? []
  }

  async findCitationById(citationId: string): Promise<CitationRow | null> {
    const { data } = await this.db
      .from('compliance_law_citations')
      .select(CITATION_COLUMNS)
      .eq('id', citationId)
      .maybeSingle()

    return (data as CitationRow | null) ?? null
  }

  async findJurisdictionCitations(
    jurisdictionId: string,
    asOfDateIso: string,
  ): Promise<CitationRow[]> {
    const { data } = await this.db
      .from('compliance_law_citations')
      .select(CITATION_COLUMNS)
      .eq('jurisdiction_id', jurisdictionId)
      .or(`effective_date.is.null,effective_date.lte.${asOfDateIso}`)
      .order('effective_date', { ascending: false })

    return (data as CitationRow[]) ?? []
  }

  async findAllRuleVersions(
    jurisdictionId: string,
    ruleTypeId: string,
  ): Promise<LegalRuleRow[]> {
    const { data } = await this.db
      .from('compliance_legal_rules')
      .select('*')
      .eq('jurisdiction_id', jurisdictionId)
      .eq('rule_type_id', ruleTypeId)
      .order('effective_date', { ascending: false })
      .order('version_number', { ascending: false })

    return (data as LegalRuleRow[]) ?? []
  }

  async findRuleTypeById(id: string): Promise<RuleTypeRow | null> {
    const { data } = await this.db
      .from('compliance_rule_types')
      .select('id,slug,name')
      .eq('id', id)
      .maybeSingle()

    return (data as RuleTypeRow | null) ?? null
  }

  async findRuleTypeBySlug(slug: string): Promise<RuleTypeRow | null> {
    const { data } = await this.db
      .from('compliance_rule_types')
      .select('id,slug,name')
      .eq('slug', slug)
      .maybeSingle()

    return (data as RuleTypeRow | null) ?? null
  }
}
