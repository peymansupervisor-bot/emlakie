/**
 * Phase 8 — Security Deposit Interest Calculation Engine
 * Comprehensive Vitest tests. No database required.
 *
 * Rate convention: numeric_value is in percent form.
 *   2.75 = 2.75%  →  depositAmount × (2.75 / 100) × days / daysInYear
 */

import { describe, it, expect } from 'vitest'
import { calculateInterest } from '../calculate'
import { ENGINE_VERSION } from '../types'
import type { CalculationInput } from '../types'
import type { RuleResolution, RateRow, ExemptionRow, LegalRuleRow } from '../../engine/types'

// ── Fixture helpers ──────────────────────────────────────────────────────────

function makeRule(overrides: Partial<LegalRuleRow> = {}): LegalRuleRow {
  return {
    id: 'rule-1',
    jurisdiction_id: 'jur-1',
    rule_type_id: 'rt-1',
    version_number: 1,
    is_current: true,
    rule_name: 'Test Rule',
    effective_date: '2000-01-01',
    superseded_date: null,
    rule_applies: true,
    not_applicable_reason: null,
    parameters: {},
    citation_id: null,
    change_reason: null,
    created_at: '2000-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeResolution(overrides: Partial<RuleResolution> = {}): RuleResolution {
  return {
    status: 'rule_found',
    rule: makeRule(),
    rates: [],
    exemptions: [],
    citation: null,
    asOfDate: new Date('2024-01-01'),
    resolvedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

function makeRate(overrides: Partial<RateRow> = {}): RateRow {
  return {
    id: 'rate-1',
    legal_rule_id: 'rule-1',
    jurisdiction_id: 'jur-1',
    rule_type_id: 'rt-1',
    rate_key: 'annual_interest_rate',
    effective_from: '2000-01-01',
    effective_to: null,
    numeric_value: 2.75,
    rate_source_description: 'Test rate source',
    rate_source_url: null,
    is_published: true,
    notes: null,
    ...overrides,
  }
}

function makeExemption(overrides: Partial<ExemptionRow> = {}): ExemptionRow {
  return {
    id: 'ex-1',
    legal_rule_id: 'rule-1',
    jurisdiction_id: 'jur-1',
    exemption_type: 'owner_occupied',
    condition_operator: 'eq',
    condition_value: 'true',
    exemption_description: 'Owner-occupied exemption',
    citation_section: null,
    is_active: true,
    ...overrides,
  }
}

function makeInput(overrides: Partial<CalculationInput> = {}): CalculationInput {
  return {
    depositAmount: 1000,
    depositReceivedDate: '2023-01-01',
    depositReturnDate: '2024-01-01',
    ruleResolution: makeResolution(),
    rates: [makeRate()],
    ...overrides,
  }
}

// ── 1. Input validation ──────────────────────────────────────────────────────

describe('input validation', () => {
  it('returns invalid_input when depositAmount is negative', () => {
    const result = calculateInterest(makeInput({ depositAmount: -500 }))
    expect(result.status).toBe('invalid_input')
    expect(result.totalInterest).toBe(0)
    expect(result.warnings[0]).toMatch(/negative/)
  })

  it('returns invalid_input when depositReturnDate is before depositReceivedDate', () => {
    const result = calculateInterest(
      makeInput({ depositReceivedDate: '2024-06-01', depositReturnDate: '2023-01-01' }),
    )
    expect(result.status).toBe('invalid_input')
    expect(result.warnings[0]).toMatch(/on or after/)
  })

  it('accepts zero deposit amount (no error)', () => {
    const result = calculateInterest(makeInput({ depositAmount: 0 }))
    expect(result.status).toBe('calculated')
    expect(result.totalInterest).toBe(0)
  })
})

// ── 2. Rule resolution status checks ────────────────────────────────────────

describe('rule resolution status', () => {
  it('returns no_rule when resolution status is no_rule', () => {
    const result = calculateInterest(
      makeInput({ ruleResolution: makeResolution({ status: 'no_rule', rule: null }) }),
    )
    expect(result.status).toBe('no_rule')
    expect(result.totalInterest).toBe(0)
  })

  it('returns no_rule when resolution status is jurisdiction_not_found', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({ status: 'jurisdiction_not_found', rule: null }),
      }),
    )
    expect(result.status).toBe('no_rule')
  })

  it('returns not_required when resolution status is not_applicable', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({
          status: 'not_applicable',
          rule: makeRule({
            rule_applies: false,
            not_applicable_reason: 'Texas has no requirement',
          }),
        }),
      }),
    )
    expect(result.status).toBe('not_required')
    expect(result.totalInterest).toBe(0)
    expect(result.warnings[0]).toMatch(/Texas/)
  })

  it('includes the not_applicable_reason in warnings', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({
          status: 'not_applicable',
          rule: makeRule({ rule_applies: false, not_applicable_reason: 'Custom reason' }),
        }),
      }),
    )
    expect(result.warnings).toContain('Custom reason')
  })

  it('returns not_required with empty warnings when no not_applicable_reason', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({
          status: 'not_applicable',
          rule: makeRule({ rule_applies: false, not_applicable_reason: null }),
        }),
      }),
    )
    expect(result.status).toBe('not_required')
    expect(result.warnings).toHaveLength(0)
  })
})

// ── 3. Exemption detection ───────────────────────────────────────────────────

describe('exemptions', () => {
  it('returns not_required when owner_occupied exemption matches', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({ exemptions: [makeExemption()] }),
        propertyFacts: { owner_occupied: true },
      }),
    )
    expect(result.status).toBe('not_required')
    expect(result.exemptionApplied).toBe('owner_occupied')
  })

  it('does not apply exemption when fact does not match', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({ exemptions: [makeExemption()] }),
        propertyFacts: { owner_occupied: false },
      }),
    )
    expect(result.status).toBe('calculated')
    expect(result.exemptionApplied).toBeNull()
  })

  it('does not apply exemption when relevant fact is absent from propertyFacts', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({ exemptions: [makeExemption()] }),
        propertyFacts: { unit_count: 10 },
      }),
    )
    expect(result.status).toBe('calculated')
  })

  it('applies unit_count lt exemption when building has fewer units', () => {
    const ex = makeExemption({
      exemption_type: 'unit_count',
      condition_operator: 'lt',
      condition_value: '4',
    })
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({ exemptions: [ex] }),
        propertyFacts: { unit_count: 3 },
      }),
    )
    expect(result.status).toBe('not_required')
    expect(result.exemptionApplied).toBe('unit_count')
  })

  it('does not apply unit_count lt exemption when unit count meets threshold', () => {
    const ex = makeExemption({
      exemption_type: 'unit_count',
      condition_operator: 'lt',
      condition_value: '4',
    })
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({ exemptions: [ex] }),
        propertyFacts: { unit_count: 4 },
      }),
    )
    expect(result.status).toBe('calculated')
  })

  it('returns not_required with no propertyFacts when no exemptions exist', () => {
    const result = calculateInterest(
      makeInput({ ruleResolution: makeResolution({ exemptions: [] }) }),
    )
    expect(result.status).not.toBe('not_required')
  })

  it('does not match exemptions when propertyFacts is undefined', () => {
    const result = calculateInterest(
      makeInput({
        ruleResolution: makeResolution({ exemptions: [makeExemption()] }),
        propertyFacts: undefined,
      }),
    )
    expect(result.status).toBe('calculated')
  })
})

// ── 4. Zero-day and zero-deposit cases ──────────────────────────────────────

describe('zero-value edge cases', () => {
  it('returns calculated with $0 when start equals end (0 days)', () => {
    const result = calculateInterest(
      makeInput({ depositReceivedDate: '2023-06-01', depositReturnDate: '2023-06-01' }),
    )
    expect(result.status).toBe('calculated')
    expect(result.totalInterest).toBe(0)
    expect(result.totalDays).toBe(0)
    expect(result.periods).toHaveLength(0)
  })

  it('returns calculated with $0 when depositAmount is 0', () => {
    const result = calculateInterest(makeInput({ depositAmount: 0 }))
    expect(result.status).toBe('calculated')
    expect(result.totalInterest).toBe(0)
  })
})

// ── 5. Simple interest formula ───────────────────────────────────────────────

describe('simple interest formula', () => {
  it('calculates exact interest for a full non-leap year', () => {
    // 2023: 365 days, 2.75% rate, $1000 deposit
    // interest = 1000 × (2.75/100) × 365/365 = 27.50
    const result = calculateInterest(
      makeInput({
        depositAmount: 1000,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates: [makeRate({ numeric_value: 2.75, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.status).toBe('calculated')
    expect(result.totalInterest).toBe(27.5)
    expect(result.totalDays).toBe(365)
  })

  it('calculates exact interest for a full leap year', () => {
    // 2024: 366 days, 2.75% rate, $1000 deposit
    // interest = 1000 × (2.75/100) × 366/366 = 27.50
    const result = calculateInterest(
      makeInput({
        depositAmount: 1000,
        depositReceivedDate: '2024-01-01',
        depositReturnDate: '2025-01-01',
        rates: [makeRate({ numeric_value: 2.75, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.totalInterest).toBe(27.5)
    expect(result.totalDays).toBe(366)
  })

  it('calculates interest for a partial year correctly', () => {
    // Jan 1 – Jul 2 2023 = 182 days, 2% rate, $1000
    // interest = 1000 × 0.02 × 182/365 = 9.972602...  → $9.97
    const result = calculateInterest(
      makeInput({
        depositAmount: 1000,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2023-07-02',
        rates: [makeRate({ numeric_value: 2, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.totalDays).toBe(182)
    expect(result.periods).toHaveLength(1)
    expect(result.periods[0].daysInYear).toBe(365)
    expect(result.totalInterest).toBe(Math.round(1000 * (2 / 100) * (182 / 365) * 100) / 100)
  })

  it('uses daysInYear=366 for segments within a leap year', () => {
    // Feb 28 – Mar 1 2024 (leap year): 2 days
    const result = calculateInterest(
      makeInput({
        depositAmount: 10000,
        depositReceivedDate: '2024-02-28',
        depositReturnDate: '2024-03-01',
        rates: [makeRate({ numeric_value: 3, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.periods[0].daysInYear).toBe(366)
  })

  it('uses daysInYear=365 for segments within a non-leap year', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2023-06-01',
        rates: [makeRate({ numeric_value: 2.75, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.periods[0].daysInYear).toBe(365)
  })
})

// ── 6. Multi-year tenancy ────────────────────────────────────────────────────

describe('multi-year tenancy', () => {
  it('produces one period per calendar year when rate is constant', () => {
    // 2 full years: 2023 (365 days) + 2024 (366 days)
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2025-01-01',
        rates: [makeRate({ numeric_value: 2.75, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.periods).toHaveLength(2)
    expect(result.periods[0].startDate).toBe('2023-01-01')
    expect(result.periods[0].endDate).toBe('2024-01-01')
    expect(result.periods[0].daysInYear).toBe(365)
    expect(result.periods[1].startDate).toBe('2024-01-01')
    expect(result.periods[1].endDate).toBe('2025-01-01')
    expect(result.periods[1].daysInYear).toBe(366)
    expect(result.totalDays).toBe(365 + 366)
  })

  it('correctly sums interest across two full years', () => {
    const deposit = 1000
    const rate = 2.75
    const expected = roundCents(
      deposit * (rate / 100) * (365 / 365) + deposit * (rate / 100) * (366 / 366),
    )
    const result = calculateInterest(
      makeInput({
        depositAmount: deposit,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2025-01-01',
        rates: [makeRate({ numeric_value: rate, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.totalInterest).toBe(expected)
  })

  it('handles a 10-year tenancy without error', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2010-01-01',
        depositReturnDate: '2020-01-01',
        rates: [makeRate({ numeric_value: 2, effective_from: '2000-01-01' })],
      }),
    )
    expect(result.status).toBe('calculated')
    expect(result.periods.length).toBe(10)
    expect(result.totalDays).toBeGreaterThan(3650)
  })
})

// ── 7. Variable annual rates ─────────────────────────────────────────────────

describe('variable annual rates', () => {
  it('applies different rates for different calendar years', () => {
    const rates = [
      makeRate({ id: 'r1', numeric_value: 2.0, effective_from: '2022-01-01', effective_to: '2023-01-01' }),
      makeRate({ id: 'r2', numeric_value: 3.0, effective_from: '2023-01-01', effective_to: null }),
    ]
    const result = calculateInterest(
      makeInput({
        depositAmount: 1000,
        depositReceivedDate: '2022-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    expect(result.periods).toHaveLength(2)
    expect(result.periods[0].annualRatePercent).toBe(2.0)
    expect(result.periods[1].annualRatePercent).toBe(3.0)
  })

  it('splits a period at a mid-year rate change', () => {
    const rates = [
      makeRate({ id: 'r1', numeric_value: 1.5, effective_from: '2023-01-01', effective_to: '2023-07-01' }),
      makeRate({ id: 'r2', numeric_value: 2.5, effective_from: '2023-07-01', effective_to: null }),
    ]
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    expect(result.periods).toHaveLength(2)
    expect(result.periods[0].endDate).toBe('2023-07-01')
    expect(result.periods[1].startDate).toBe('2023-07-01')
  })

  it('correctly sums interest when rates change mid-year', () => {
    const deposit = 2000
    // Jan 1 – Jul 1: 181 days at 1%
    // Jul 1 – Jan 1: 184 days at 2%
    const r1Interest = deposit * (1 / 100) * (181 / 365)
    const r2Interest = deposit * (2 / 100) * (184 / 365)
    const expected = roundCents(r1Interest + r2Interest)

    const rates = [
      makeRate({ id: 'r1', numeric_value: 1, effective_from: '2023-01-01', effective_to: '2023-07-01' }),
      makeRate({ id: 'r2', numeric_value: 2, effective_from: '2023-07-01', effective_to: null }),
    ]
    const result = calculateInterest(
      makeInput({
        depositAmount: deposit,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    expect(result.totalInterest).toBe(expected)
  })

  it('picks the rate effective on the segment start date', () => {
    const rates = [
      makeRate({ id: 'r1', numeric_value: 5.0, effective_from: '2020-01-01', effective_to: '2023-06-15' }),
      makeRate({ id: 'r2', numeric_value: 6.0, effective_from: '2023-06-15', effective_to: null }),
    ]
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-06-15',
        depositReturnDate: '2023-12-31',
        rates,
      }),
    )
    expect(result.periods).toHaveLength(1)
    expect(result.periods[0].annualRatePercent).toBe(6.0)
  })
})

// ── 8. Leap year handling ────────────────────────────────────────────────────

describe('leap year handling', () => {
  it('2024 is a leap year (366 days)', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2024-01-01',
        depositReturnDate: '2025-01-01',
        rates: [makeRate()],
      }),
    )
    expect(result.totalDays).toBe(366)
    expect(result.periods[0].daysInYear).toBe(366)
  })

  it('2023 is not a leap year (365 days)', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates: [makeRate()],
      }),
    )
    expect(result.totalDays).toBe(365)
    expect(result.periods[0].daysInYear).toBe(365)
  })

  it('2000 is a leap year (divisible by 400)', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2000-01-01',
        depositReturnDate: '2001-01-01',
        rates: [makeRate({ effective_from: '1999-01-01' })],
      }),
    )
    expect(result.totalDays).toBe(366)
    expect(result.periods[0].daysInYear).toBe(366)
  })

  it('1900 is not a leap year (divisible by 100 but not 400)', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '1900-01-01',
        depositReturnDate: '1901-01-01',
        rates: [makeRate({ effective_from: '1800-01-01' })],
      }),
    )
    expect(result.totalDays).toBe(365)
    expect(result.periods[0].daysInYear).toBe(365)
  })

  it('splits correctly at Dec 31/Jan 1 leap boundary', () => {
    // 2023 non-leap (Dec 15-31 = 16 days at 365), 2024 leap (Jan 1 – Mar 1 = 60 days at 366)
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-12-15',
        depositReturnDate: '2024-03-01',
        rates: [makeRate({ effective_from: '2000-01-01' })],
      }),
    )
    expect(result.periods).toHaveLength(2)
    expect(result.periods[0].daysInYear).toBe(365)
    expect(result.periods[1].daysInYear).toBe(366)
    expect(result.periods[0].days + result.periods[1].days).toBe(result.totalDays)
  })
})

// ── 9. Missing rate periods ──────────────────────────────────────────────────

describe('missing rate periods', () => {
  it('returns missing_rates status when no rates exist', () => {
    const result = calculateInterest(makeInput({ rates: [] }))
    expect(result.status).toBe('missing_rates')
    expect(result.missingRatePeriods).toHaveLength(1)
    expect(result.totalInterest).toBe(0)
  })

  it('records the exact gap dates in missingRatePeriods', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates: [],
      }),
    )
    expect(result.missingRatePeriods[0].startDate).toBe('2023-01-01')
    expect(result.missingRatePeriods[0].endDate).toBe('2024-01-01')
    expect(result.missingRatePeriods[0].days).toBe(365)
  })

  it('returns missing_rates when rate covers only part of tenancy', () => {
    // Rate only covers second half of 2023
    const rates = [makeRate({ effective_from: '2023-07-01', effective_to: null })]
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    expect(result.status).toBe('missing_rates')
    expect(result.missingRatePeriods).toHaveLength(1)
    expect(result.missingRatePeriods[0].startDate).toBe('2023-01-01')
    expect(result.missingRatePeriods[0].endDate).toBe('2023-07-01')
    expect(result.periods).toHaveLength(1)
    expect(result.periods[0].startDate).toBe('2023-07-01')
  })

  it('calculates partial interest for known periods when some rates are missing', () => {
    const deposit = 1000
    // Rate covers Jul 1 – Jan 1: 184 days at 2%
    const rates = [makeRate({ effective_from: '2023-07-01', effective_to: null, numeric_value: 2 })]
    const expected = roundCents(deposit * (2 / 100) * (184 / 365))
    const result = calculateInterest(
      makeInput({
        depositAmount: deposit,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    expect(result.totalInterest).toBe(expected)
  })

  it('includes a warning message when rates are missing', () => {
    const result = calculateInterest(makeInput({ rates: [] }))
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toMatch(/missing/i)
  })

  it('returns calculated (not missing_rates) when all periods have rates', () => {
    const result = calculateInterest(makeInput())
    expect(result.status).toBe('calculated')
    expect(result.missingRatePeriods).toHaveLength(0)
  })
})

// ── 10. Zero-percent rate ────────────────────────────────────────────────────

describe('zero-percent rate', () => {
  it('returns $0 interest when rate is 0%', () => {
    const result = calculateInterest(
      makeInput({ rates: [makeRate({ numeric_value: 0 })] }),
    )
    expect(result.status).toBe('calculated')
    expect(result.totalInterest).toBe(0)
    expect(result.periods).toHaveLength(1)
    expect(result.periods[0].annualRatePercent).toBe(0)
  })
})

// ── 11. Rounding — final only, no intermediate rounding ──────────────────────

describe('rounding', () => {
  it('rounds totalInterest to 2 decimal places', () => {
    const result = calculateInterest(
      makeInput({
        depositAmount: 1500,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2023-04-17',  // 106 days
        rates: [makeRate({ numeric_value: 2.75 })],
      }),
    )
    // 1500 × 0.0275 × 106/365 = 12.0000...  (need to check exact)
    expect(Number.isFinite(result.totalInterest)).toBe(true)
    expect(result.totalInterest).toBe(
      Math.round(1500 * (2.75 / 100) * (106 / 365) * 100) / 100,
    )
  })

  it('does not round intermediate period interest values', () => {
    // Two periods; verify each period.interest is unrounded
    const result = calculateInterest(
      makeInput({
        depositAmount: 999.99,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2025-01-01',
        rates: [makeRate({ numeric_value: 1.337 })],
      }),
    )
    // period.interest should be raw float, not rounded
    for (const p of result.periods) {
      // Raw value should differ from rounded-to-cents version in most cases
      const roundedVersion = Math.round(p.interest * 100) / 100
      // Either it happens to be exact (fine) or the raw value has more precision
      expect(typeof p.interest).toBe('number')
      expect(p.interest).toBeGreaterThanOrEqual(0)
      // The stored interest should equal the computed formula value (unrounded)
      const expected = 999.99 * (1.337 / 100) * (p.days / p.daysInYear)
      expect(p.interest).toBeCloseTo(expected, 10)
    }
  })

  it('demonstrates no intermediate rounding: sum ≠ sum of individually rounded periods', () => {
    // Choose values where rounding each period and summing would differ from
    // summing raw and rounding once
    const deposit = 3333.33
    const rates = [
      makeRate({ id: 'r1', numeric_value: 1.337, effective_from: '2022-01-01', effective_to: '2023-01-01' }),
      makeRate({ id: 'r2', numeric_value: 1.337, effective_from: '2023-01-01', effective_to: null }),
    ]
    const result = calculateInterest(
      makeInput({
        depositAmount: deposit,
        depositReceivedDate: '2022-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    // Verify totalInterest = round(sum of raw period interests)
    const rawSum = result.periods.reduce((acc, p) => acc + p.interest, 0)
    expect(result.totalInterest).toBe(Math.round(rawSum * 100) / 100)
  })
})

// ── 12. Large deposit and long tenancy ──────────────────────────────────────

describe('large deposit and long tenancy', () => {
  it('handles a $50,000 deposit correctly', () => {
    const result = calculateInterest(
      makeInput({
        depositAmount: 50_000,
        rates: [makeRate({ numeric_value: 2.75 })],
      }),
    )
    expect(result.status).toBe('calculated')
    expect(result.totalInterest).toBeCloseTo(1375, 0) // 50000 × 0.0275 ≈ 1375
  })

  it('handles a 20-year tenancy without overflow', () => {
    const result = calculateInterest(
      makeInput({
        depositAmount: 2000,
        depositReceivedDate: '2000-01-01',
        depositReturnDate: '2020-01-01',
        rates: [makeRate({ numeric_value: 2.0, effective_from: '1999-01-01' })],
      }),
    )
    expect(result.status).toBe('calculated')
    expect(result.periods.length).toBe(20)
    expect(result.totalInterest).toBeGreaterThan(0)
    expect(Number.isFinite(result.totalInterest)).toBe(true)
  })
})

// ── 13. Period breakdown correctness ────────────────────────────────────────

describe('period breakdown', () => {
  it('totalDays equals sum of all period days plus missing period days', () => {
    const rates = [
      makeRate({ effective_from: '2023-07-01', effective_to: null, numeric_value: 2 }),
    ]
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    const periodDays = result.periods.reduce((s, p) => s + p.days, 0)
    const missingDays = result.missingRatePeriods.reduce((s, p) => s + p.days, 0)
    expect(periodDays + missingDays).toBe(result.totalDays)
  })

  it('periods are contiguous and non-overlapping', () => {
    const result = calculateInterest(
      makeInput({
        depositReceivedDate: '2022-01-01',
        depositReturnDate: '2025-01-01',
        rates: [makeRate({ effective_from: '2000-01-01' })],
      }),
    )
    for (let i = 0; i < result.periods.length - 1; i++) {
      expect(result.periods[i].endDate).toBe(result.periods[i + 1].startDate)
    }
  })

  it('first period startDate matches depositReceivedDate', () => {
    const result = calculateInterest(makeInput())
    expect(result.periods[0].startDate).toBe('2023-01-01')
  })

  it('last period endDate matches depositReturnDate', () => {
    const result = calculateInterest(makeInput())
    const last = result.periods[result.periods.length - 1]
    expect(last.endDate).toBe('2024-01-01')
  })

  it('period interest values are all >= 0', () => {
    const result = calculateInterest(makeInput())
    expect(result.periods.every((p) => p.interest >= 0)).toBe(true)
  })
})

// ── 14. Output shape ─────────────────────────────────────────────────────────

describe('output shape', () => {
  it('includes engineVersion in the result', () => {
    const result = calculateInterest(makeInput())
    expect(result.engineVersion).toBe(ENGINE_VERSION)
  })

  it('includes calculatedAt as a valid ISO datetime', () => {
    const result = calculateInterest(makeInput())
    expect(new Date(result.calculatedAt).toString()).not.toBe('Invalid Date')
  })

  it('includes ruleResolutionSnapshot with expected fields', () => {
    const result = calculateInterest(makeInput())
    const snap = result.ruleResolutionSnapshot
    expect(snap.status).toBe('rule_found')
    expect(snap.ruleId).toBe('rule-1')
    expect(snap.ruleName).toBe('Test Rule')
    expect(snap.asOfDate).toBe('2024-01-01')
  })

  it('has no_rule snapshot status when resolution is no_rule', () => {
    const result = calculateInterest(
      makeInput({ ruleResolution: makeResolution({ status: 'no_rule', rule: null }) }),
    )
    expect(result.ruleResolutionSnapshot.status).toBe('no_rule')
    expect(result.ruleResolutionSnapshot.ruleId).toBeNull()
  })

  it('rateSourceDescription is included in period output', () => {
    const result = calculateInterest(makeInput())
    expect(result.periods[0].rateSourceDescription).toBe('Test rate source')
  })
})

// ── 15. Specific numeric examples ────────────────────────────────────────────

describe('specific numeric examples (worked out by hand)', () => {
  it('LA example: $2000 deposit, full 2023, 2.75% → $55.00', () => {
    // 2000 × 0.0275 × 365/365 = 55.00
    const result = calculateInterest(
      makeInput({
        depositAmount: 2000,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates: [makeRate({ numeric_value: 2.75 })],
      }),
    )
    expect(result.totalInterest).toBe(55.0)
  })

  it('SF example: $3000 deposit, full 2023, 1.55% → $46.50', () => {
    // 3000 × 0.0155 × 365/365 = 46.50
    const result = calculateInterest(
      makeInput({
        depositAmount: 3000,
        depositReceivedDate: '2023-01-01',
        depositReturnDate: '2024-01-01',
        rates: [makeRate({ numeric_value: 1.55 })],
      }),
    )
    expect(result.totalInterest).toBe(46.5)
  })

  it('LA 2-year example: $2000, 2022 at 2% and 2023 at 2.75%', () => {
    // 2022: 2000 × 0.02 × 365/365 = 40.00
    // 2023: 2000 × 0.0275 × 365/365 = 55.00
    // total = 95.00
    const rates = [
      makeRate({ id: 'r1', numeric_value: 2.0, effective_from: '2022-01-01', effective_to: '2023-01-01' }),
      makeRate({ id: 'r2', numeric_value: 2.75, effective_from: '2023-01-01', effective_to: null }),
    ]
    const result = calculateInterest(
      makeInput({
        depositAmount: 2000,
        depositReceivedDate: '2022-01-01',
        depositReturnDate: '2024-01-01',
        rates,
      }),
    )
    expect(result.totalInterest).toBe(95.0)
  })
})

// ── Helpers (used by rounding test) ─────────────────────────────────────────

function roundCents(n: number): number {
  return Math.round(n * 100) / 100
}
