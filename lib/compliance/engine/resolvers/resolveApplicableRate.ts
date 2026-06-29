import type { ComplianceRepository } from '../repository'
import type { RateResolutionInput, RateRow } from '../types'
import { toIso } from '../utils'

export async function resolveApplicableRate(
  repo: ComplianceRepository,
  input: RateResolutionInput,
): Promise<RateRow[]> {
  const asOf = input.asOfDate ?? new Date()
  return repo.findApplicableRates(input.legalRuleId, input.rateKey, toIso(asOf))
}
