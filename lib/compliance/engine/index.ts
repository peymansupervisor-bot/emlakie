import type { ComplianceRepository } from './repository'
import type {
  JurisdictionLookup,
  RuleResolutionInput,
  RateResolutionInput,
  ExemptionResolutionInput,
  CitationResolutionInput,
  HistoricalRulesInput,
  RuleResolution,
  JurisdictionRow,
  LegalRuleRow,
  RateRow,
  ExemptionRow,
  CitationRow,
} from './types'

import { resolveJurisdiction } from './resolvers/resolveJurisdiction'
import { resolveApplicableRule } from './resolvers/resolveApplicableRule'
import { resolveApplicableRate } from './resolvers/resolveApplicableRate'
import { resolveApplicableExemptions } from './resolvers/resolveApplicableExemptions'
import { resolveApplicableCitation } from './resolvers/resolveApplicableCitation'
import { resolveHistoricalRules } from './resolvers/resolveHistoricalRules'

// Re-export all public types
export type { ComplianceRepository } from './repository'
export type {
  JurisdictionLookup,
  RuleResolutionInput,
  RateResolutionInput,
  ExemptionResolutionInput,
  CitationResolutionInput,
  HistoricalRulesInput,
  RuleResolution,
  RuleResolutionStatus,
  JurisdictionRow,
  LegalRuleRow,
  RateRow,
  ExemptionRow,
  CitationRow,
  RuleTypeRow,
} from './types'

export interface ComplianceEngine {
  /** Look up a jurisdiction by id or seo_slug. */
  resolveJurisdiction(lookup: JurisdictionLookup): Promise<JurisdictionRow | null>

  /** Find the single rule that was in effect on asOfDate (defaults to today). */
  resolveApplicableRule(input: RuleResolutionInput): Promise<LegalRuleRow | null>

  /** Find all published rates in effect on asOfDate, optionally filtered by rateKey. */
  resolveApplicableRate(input: RateResolutionInput): Promise<RateRow[]>

  /** Find all currently active exemptions for a given rule. */
  resolveApplicableExemptions(input: ExemptionResolutionInput): Promise<ExemptionRow[]>

  /** Find the citation for a rule (by citationId) or the most recent citation for a jurisdiction. */
  resolveApplicableCitation(input: CitationResolutionInput): Promise<CitationRow | null>

  /** Return all versions of a rule, newest first — for audit and history views. */
  resolveHistoricalRules(input: HistoricalRulesInput): Promise<LegalRuleRow[]>

  /**
   * Full resolution: rule + rates + exemptions + citation in one call.
   * This is the main entry point for calculators, API routes, and the AI assistant.
   */
  resolve(input: RuleResolutionInput): Promise<RuleResolution>
}

export function createComplianceEngine(repo: ComplianceRepository): ComplianceEngine {
  return {
    resolveJurisdiction: (lookup) => resolveJurisdiction(repo, lookup),
    resolveApplicableRule: (input) => resolveApplicableRule(repo, input),
    resolveApplicableRate: (input) => resolveApplicableRate(repo, input),
    resolveApplicableExemptions: (input) => resolveApplicableExemptions(repo, input),
    resolveApplicableCitation: (input) => resolveApplicableCitation(repo, input),
    resolveHistoricalRules: (input) => resolveHistoricalRules(repo, input),

    async resolve(input: RuleResolutionInput): Promise<RuleResolution> {
      const asOf = input.asOfDate ?? new Date()
      const resolvedAt = new Date()

      const rule = await resolveApplicableRule(repo, { ...input, asOfDate: asOf })

      if (!rule) {
        return {
          status: 'no_rule',
          rule: null,
          rates: [],
          exemptions: [],
          citation: null,
          asOfDate: asOf,
          resolvedAt,
        }
      }

      if (!rule.rule_applies) {
        return {
          status: 'not_applicable',
          rule,
          rates: [],
          exemptions: [],
          citation: null,
          asOfDate: asOf,
          resolvedAt,
        }
      }

      const [rates, exemptions, citation] = await Promise.all([
        resolveApplicableRate(repo, { legalRuleId: rule.id, asOfDate: asOf }),
        resolveApplicableExemptions(repo, { legalRuleId: rule.id }),
        rule.citation_id
          ? resolveApplicableCitation(repo, {
              jurisdictionId: input.jurisdictionId,
              citationId: rule.citation_id,
              asOfDate: asOf,
            })
          : Promise.resolve(null),
      ])

      return {
        status: 'rule_found',
        rule,
        rates,
        exemptions,
        citation,
        asOfDate: asOf,
        resolvedAt,
      }
    },
  }
}

/**
 * Convenience factory for production use.
 * Uses the Supabase service-role repository.
 * Import this only in server-side contexts (Server Actions, API routes).
 */
export async function createProductionEngine(): Promise<ComplianceEngine> {
  const { SupabaseComplianceRepository } = await import('./supabaseRepository')
  return createComplianceEngine(new SupabaseComplianceRepository())
}
