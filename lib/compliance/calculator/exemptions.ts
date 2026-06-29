import type { ExemptionRow } from '../engine/types'
import type { PropertyFacts } from './types'

function exemptionApplies(ex: ExemptionRow, facts: PropertyFacts): boolean {
  if (!ex.condition_operator || ex.condition_value === null) return false

  const factValue = facts[ex.exemption_type as keyof PropertyFacts]
  if (factValue === undefined || factValue === null) return false

  const threshold = Number(ex.condition_value)

  switch (ex.condition_operator) {
    case 'eq':  return String(factValue) === ex.condition_value
    case 'lt':  return Number(factValue) < threshold
    case 'lte': return Number(factValue) <= threshold
    case 'gt':  return Number(factValue) > threshold
    case 'gte': return Number(factValue) >= threshold
    default:    return false
  }
}

/**
 * Returns the first exemption_type that matches the given property facts,
 * or null if none match (or no facts provided).
 */
export function checkExemptions(
  exemptions: ExemptionRow[],
  facts: PropertyFacts | undefined,
): string | null {
  if (!facts || exemptions.length === 0) return null
  for (const ex of exemptions) {
    if (exemptionApplies(ex, facts)) return ex.exemption_type
  }
  return null
}
