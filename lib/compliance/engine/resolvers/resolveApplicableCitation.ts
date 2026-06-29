import type { ComplianceRepository } from '../repository'
import type { CitationResolutionInput, CitationRow } from '../types'
import { toIso } from '../utils'

export async function resolveApplicableCitation(
  repo: ComplianceRepository,
  input: CitationResolutionInput,
): Promise<CitationRow | null> {
  if (input.citationId) {
    return repo.findCitationById(input.citationId)
  }
  const asOf = input.asOfDate ?? new Date()
  const citations = await repo.findJurisdictionCitations(input.jurisdictionId, toIso(asOf))
  return citations[0] ?? null
}
