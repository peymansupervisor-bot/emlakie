import { describe, it, expect } from 'vitest'
import { MockComplianceRepository } from './mock.repository'
import { SEED, IDS } from './seeds'
import { resolveHistoricalRules } from '../resolvers/resolveHistoricalRules'

const repo = new MockComplianceRepository(SEED)

describe('resolveHistoricalRules', () => {
  it('returns all versions for LA, newest first', async () => {
    const rules = await resolveHistoricalRules(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(rules).toHaveLength(2)
    expect(rules[0].id).toBe(IDS.RULE_LA_V2)  // v2 (2022) is newer
    expect(rules[1].id).toBe(IDS.RULE_LA_V1)  // v1 (2015)
  })

  it('returns version numbers in descending order', async () => {
    const rules = await resolveHistoricalRules(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(rules[0].version_number).toBeGreaterThan(rules[1].version_number)
  })

  it('returns a single version for SF', async () => {
    const rules = await resolveHistoricalRules(repo, {
      jurisdictionId: IDS.SF,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(rules).toHaveLength(1)
    expect(rules[0].id).toBe(IDS.RULE_SF)
  })

  it('returns empty array for a jurisdiction with no rules', async () => {
    const rules = await resolveHistoricalRules(repo, {
      jurisdictionId: 'jur-no-rules',
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(rules).toHaveLength(0)
  })

  it('includes superseded rules in the history', async () => {
    const rules = await resolveHistoricalRules(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    const v1 = rules.find((r) => r.id === IDS.RULE_LA_V1)
    expect(v1).toBeDefined()
    expect(v1!.superseded_date).toBe('2022-01-01')
    expect(v1!.is_current).toBe(false)
  })
})
