import { describe, it, expect } from 'vitest'
import { MockComplianceRepository } from './mock.repository'
import { SEED, IDS } from './seeds'
import { resolveApplicableRule } from '../resolvers/resolveApplicableRule'

const repo = new MockComplianceRepository(SEED)

describe('resolveApplicableRule', () => {
  it('returns the current rule for today', async () => {
    // LA v2 is current (effective 2022-01-01, no superseded_date)
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(result).not.toBeNull()
    expect(result!.id).toBe(IDS.RULE_LA_V2)
    expect(result!.version_number).toBe(2)
    expect(result!.rule_applies).toBe(true)
  })

  it('returns the older rule when queried before the v2 effective date', async () => {
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      asOfDate: new Date('2020-06-15'),
    })
    expect(result).not.toBeNull()
    expect(result!.id).toBe(IDS.RULE_LA_V1)
    expect(result!.version_number).toBe(1)
  })

  it('returns the v2 rule on its exact effective_date', async () => {
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      asOfDate: new Date('2022-01-01'),
    })
    expect(result!.id).toBe(IDS.RULE_LA_V2)
  })

  it('returns null before any rule was effective', async () => {
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      asOfDate: new Date('2010-01-01'),
    })
    expect(result).toBeNull()
  })

  it('returns the SF rule', async () => {
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: IDS.SF,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(result!.id).toBe(IDS.RULE_SF)
    expect(result!.jurisdiction_id).toBe(IDS.SF)
  })

  it('returns rule_applies=false for Houston (no state requirement)', async () => {
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: IDS.HOUSTON,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(result).not.toBeNull()
    expect(result!.rule_applies).toBe(false)
    expect(result!.not_applicable_reason).toMatch(/Texas/)
  })

  it('returns null for a jurisdiction with no rule at all', async () => {
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: 'jur-no-rules',
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
    })
    expect(result).toBeNull()
  })

  it('does not return a rule superseded exactly on asOfDate', async () => {
    // LA v1 was superseded on 2022-01-01 — that exact date should return v2
    const result = await resolveApplicableRule(repo, {
      jurisdictionId: IDS.LA,
      ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      asOfDate: new Date('2022-01-01'),
    })
    expect(result!.id).not.toBe(IDS.RULE_LA_V1)
  })
})
