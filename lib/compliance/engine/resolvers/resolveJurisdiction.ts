import type { ComplianceRepository } from '../repository'
import type { JurisdictionLookup, JurisdictionRow } from '../types'

export async function resolveJurisdiction(
  repo: ComplianceRepository,
  lookup: JurisdictionLookup,
): Promise<JurisdictionRow | null> {
  if (!lookup.id && !lookup.slug) {
    throw new Error('resolveJurisdiction: provide id or slug')
  }
  return repo.findJurisdiction(lookup)
}
