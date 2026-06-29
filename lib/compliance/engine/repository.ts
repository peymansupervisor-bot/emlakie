import type {
  JurisdictionLookup,
  JurisdictionRow,
  LegalRuleRow,
  RateRow,
  ExemptionRow,
  CitationRow,
  RuleTypeRow,
} from './types'

export interface ComplianceRepository {
  findJurisdiction(lookup: JurisdictionLookup): Promise<JurisdictionRow | null>

  // Returns the single most-recent rule effective on or before asOfDateIso
  // that has not yet been superseded (superseded_date IS NULL or > asOfDateIso).
  findApplicableRule(
    jurisdictionId: string,
    ruleTypeId: string,
    asOfDateIso: string,
  ): Promise<LegalRuleRow | null>

  // Returns all published rates for the rule, effective on asOfDateIso.
  // Pass rateKey to filter to one rate type (e.g. "annual_interest_rate").
  findApplicableRates(
    legalRuleId: string,
    rateKey: string | undefined,
    asOfDateIso: string,
  ): Promise<RateRow[]>

  findActiveExemptions(legalRuleId: string): Promise<ExemptionRow[]>

  findCitationById(citationId: string): Promise<CitationRow | null>

  findJurisdictionCitations(
    jurisdictionId: string,
    asOfDateIso: string,
  ): Promise<CitationRow[]>

  // All versions of a rule (newest first) — used for audit / history views.
  findAllRuleVersions(
    jurisdictionId: string,
    ruleTypeId: string,
  ): Promise<LegalRuleRow[]>

  findRuleTypeById(id: string): Promise<RuleTypeRow | null>
  findRuleTypeBySlug(slug: string): Promise<RuleTypeRow | null>
}
