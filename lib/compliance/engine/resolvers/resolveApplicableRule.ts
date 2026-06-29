import type { ComplianceRepository } from '../repository'
import type { RuleResolutionInput, LegalRuleRow } from '../types'
import { toIso } from '../utils'

export async function resolveApplicableRule(
  repo: ComplianceRepository,
  input: RuleResolutionInput,
): Promise<LegalRuleRow | null> {
  const asOf = input.asOfDate ?? new Date()
  return repo.findApplicableRule(input.jurisdictionId, input.ruleTypeId, toIso(asOf))
}
