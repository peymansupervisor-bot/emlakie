import type { ComplianceRepository } from '../repository'
import type {
  JurisdictionLookup,
  JurisdictionRow,
  LegalRuleRow,
  RateRow,
  ExemptionRow,
  CitationRow,
  RuleTypeRow,
} from '../types'

export interface MockData {
  jurisdictions?: JurisdictionRow[]
  rules?: LegalRuleRow[]
  rates?: RateRow[]
  exemptions?: ExemptionRow[]
  citations?: CitationRow[]
  ruleTypes?: RuleTypeRow[]
}

export class MockComplianceRepository implements ComplianceRepository {
  constructor(private data: MockData = {}) {}

  async findJurisdiction(lookup: JurisdictionLookup): Promise<JurisdictionRow | null> {
    return (
      this.data.jurisdictions?.find(
        (j) =>
          (lookup.id !== undefined && j.id === lookup.id) ||
          (lookup.slug !== undefined && j.seo_slug === lookup.slug),
      ) ?? null
    )
  }

  async findApplicableRule(
    jurisdictionId: string,
    ruleTypeId: string,
    asOfDateIso: string,
  ): Promise<LegalRuleRow | null> {
    const candidates = (this.data.rules ?? [])
      .filter(
        (r) =>
          r.jurisdiction_id === jurisdictionId &&
          r.rule_type_id === ruleTypeId &&
          r.effective_date <= asOfDateIso &&
          (r.superseded_date === null || r.superseded_date > asOfDateIso),
      )
      .sort((a, b) => {
        const d = b.effective_date.localeCompare(a.effective_date)
        return d !== 0 ? d : b.version_number - a.version_number
      })
    return candidates[0] ?? null
  }

  async findApplicableRates(
    legalRuleId: string,
    rateKey: string | undefined,
    asOfDateIso: string,
  ): Promise<RateRow[]> {
    return (this.data.rates ?? []).filter(
      (r) =>
        r.legal_rule_id === legalRuleId &&
        r.is_published &&
        r.effective_from <= asOfDateIso &&
        (r.effective_to === null || r.effective_to > asOfDateIso) &&
        (rateKey === undefined || r.rate_key === rateKey),
    )
  }

  async findActiveExemptions(legalRuleId: string): Promise<ExemptionRow[]> {
    return (this.data.exemptions ?? []).filter(
      (e) => e.legal_rule_id === legalRuleId && e.is_active,
    )
  }

  async findCitationById(citationId: string): Promise<CitationRow | null> {
    return this.data.citations?.find((c) => c.id === citationId) ?? null
  }

  async findJurisdictionCitations(
    jurisdictionId: string,
    asOfDateIso: string,
  ): Promise<CitationRow[]> {
    return (this.data.citations ?? []).filter(
      (c) =>
        c.jurisdiction_id === jurisdictionId &&
        (c.effective_date === null || c.effective_date <= asOfDateIso),
    )
  }

  async findAllRuleVersions(
    jurisdictionId: string,
    ruleTypeId: string,
  ): Promise<LegalRuleRow[]> {
    return (this.data.rules ?? [])
      .filter((r) => r.jurisdiction_id === jurisdictionId && r.rule_type_id === ruleTypeId)
      .sort((a, b) => {
        const d = b.effective_date.localeCompare(a.effective_date)
        return d !== 0 ? d : b.version_number - a.version_number
      })
  }

  async findRuleTypeById(id: string): Promise<RuleTypeRow | null> {
    return this.data.ruleTypes?.find((rt) => rt.id === id) ?? null
  }

  async findRuleTypeBySlug(slug: string): Promise<RuleTypeRow | null> {
    return this.data.ruleTypes?.find((rt) => rt.slug === slug) ?? null
  }
}
