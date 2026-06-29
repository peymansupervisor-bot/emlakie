import { describe, it, expect } from 'vitest'
import { MockComplianceRepository } from './mock.repository'
import { SEED, IDS } from './seeds'
import { resolveApplicableExemptions } from '../resolvers/resolveApplicableExemptions'

const repo = new MockComplianceRepository(SEED)

describe('resolveApplicableExemptions', () => {
  it('returns all active exemptions for LA v2', async () => {
    const exemptions = await resolveApplicableExemptions(repo, { legalRuleId: IDS.RULE_LA_V2 })
    expect(exemptions).toHaveLength(2)
    const types = exemptions.map((e) => e.exemption_type)
    expect(types).toContain('owner_occupied')
    expect(types).toContain('unit_count')
  })

  it('excludes inactive exemptions', async () => {
    const exemptions = await resolveApplicableExemptions(repo, { legalRuleId: IDS.RULE_LA_V2 })
    expect(exemptions.every((e) => e.is_active)).toBe(true)
    expect(exemptions.some((e) => e.id === 'ex-la-old-commercial')).toBe(false)
  })

  it('returns the SF exemption', async () => {
    const exemptions = await resolveApplicableExemptions(repo, { legalRuleId: IDS.RULE_SF })
    expect(exemptions).toHaveLength(1)
    expect(exemptions[0].exemption_type).toBe('affordable_housing')
    expect(exemptions[0].id).toBe(IDS.EX_SF_AFFORDABLE)
  })

  it('returns empty array for a rule with no exemptions', async () => {
    const exemptions = await resolveApplicableExemptions(repo, { legalRuleId: IDS.RULE_HOUSTON_NA })
    expect(exemptions).toHaveLength(0)
  })

  it('includes condition_operator and condition_value for property logic', async () => {
    const exemptions = await resolveApplicableExemptions(repo, { legalRuleId: IDS.RULE_LA_V2 })
    const unitCountEx = exemptions.find((e) => e.exemption_type === 'unit_count')
    expect(unitCountEx?.condition_operator).toBe('lt')
    expect(unitCountEx?.condition_value).toBe('4')
  })
})
