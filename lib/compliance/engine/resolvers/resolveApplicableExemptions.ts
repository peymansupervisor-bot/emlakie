import type { ComplianceRepository } from '../repository'
import type { ExemptionResolutionInput, ExemptionRow } from '../types'

export async function resolveApplicableExemptions(
  repo: ComplianceRepository,
  input: ExemptionResolutionInput,
): Promise<ExemptionRow[]> {
  return repo.findActiveExemptions(input.legalRuleId)
}
