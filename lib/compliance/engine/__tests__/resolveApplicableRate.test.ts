import { describe, it, expect } from 'vitest'
import { MockComplianceRepository } from './mock.repository'
import { SEED, IDS } from './seeds'
import { resolveApplicableRate } from '../resolvers/resolveApplicableRate'

const repo = new MockComplianceRepository(SEED)

describe('resolveApplicableRate', () => {
  it('returns the current published rate for LA v2', async () => {
    const rates = await resolveApplicableRate(repo, { legalRuleId: IDS.RULE_LA_V2 })
    expect(rates).toHaveLength(1)
    expect(rates[0].id).toBe(IDS.RATE_LA_2022)
    expect(rates[0].numeric_value).toBe(0.0275)
    expect(rates[0].is_published).toBe(true)
  })

  it('filters by rateKey', async () => {
    const rates = await resolveApplicableRate(repo, {
      legalRuleId: IDS.RULE_LA_V2,
      rateKey: 'annual_interest_rate',
    })
    expect(rates).toHaveLength(1)
    expect(rates[0].rate_key).toBe('annual_interest_rate')
  })

  it('returns empty array for an unknown rateKey', async () => {
    const rates = await resolveApplicableRate(repo, {
      legalRuleId: IDS.RULE_LA_V2,
      rateKey: 'nonexistent_key',
    })
    expect(rates).toHaveLength(0)
  })

  it('excludes unpublished rates', async () => {
    // The draft rate for LA v2 is is_published=false — must not appear
    const rates = await resolveApplicableRate(repo, {
      legalRuleId: IDS.RULE_LA_V2,
      asOfDate: new Date('2025-06-01'),
    })
    expect(rates.every((r) => r.is_published)).toBe(true)
    expect(rates.some((r) => r.id === 'rate-la-draft')).toBe(false)
  })

  it('returns the historical rate when queried before the v2 effective date', async () => {
    const rates = await resolveApplicableRate(repo, {
      legalRuleId: IDS.RULE_LA_V1,
      asOfDate: new Date('2018-01-01'),
    })
    expect(rates).toHaveLength(1)
    expect(rates[0].id).toBe(IDS.RATE_LA_2015)
    expect(rates[0].numeric_value).toBe(0.02)
  })

  it('returns the SF rate', async () => {
    const rates = await resolveApplicableRate(repo, { legalRuleId: IDS.RULE_SF })
    expect(rates).toHaveLength(1)
    expect(rates[0].numeric_value).toBe(0.0155)
  })

  it('returns empty array for a rule with no rates', async () => {
    const rates = await resolveApplicableRate(repo, { legalRuleId: IDS.RULE_HOUSTON_NA })
    expect(rates).toHaveLength(0)
  })

  it('excludes a rate whose effective_to has passed', async () => {
    // RATE_LA_2015 has effective_to = 2021-12-31; querying in 2023 should return nothing
    const rates = await resolveApplicableRate(repo, {
      legalRuleId: IDS.RULE_LA_V1,
      asOfDate: new Date('2023-01-01'),
    })
    expect(rates).toHaveLength(0)
  })
})
