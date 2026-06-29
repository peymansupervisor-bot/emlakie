import type { ComplianceRepository } from '../repository'
import type { HistoricalRulesInput, LegalRuleRow } from '../types'

export async function resolveHistoricalRules(
  repo: ComplianceRepository,
  input: HistoricalRulesInput,
): Promise<LegalRuleRow[]> {
  return repo.findAllRuleVersions(input.jurisdictionId, input.ruleTypeId)
}
