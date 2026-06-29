/**
 * End-to-end tests for engine.resolve() — the main entry point used by
 * calculators, API routes, and the AI assistant.
 *
 * These tests also serve as a demonstration of how the engine behaves for
 * realistic US jurisdictions once the compliance_* tables are populated.
 */

import { describe, it, expect } from 'vitest'
import { createComplianceEngine } from '../index'
import { MockComplianceRepository } from './mock.repository'
import { SEED, IDS } from './seeds'

const engine = createComplianceEngine(new MockComplianceRepository(SEED))

describe('engine.resolve()', () => {
  // ── Demo 1: Los Angeles (current rule) ─────────────────────────────────────

  describe('Los Angeles — current resolution', () => {
    it('status is rule_found', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.status).toBe('rule_found')
    })

    it('returns the v2 rule (2022 amendment)', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.rule!.id).toBe(IDS.RULE_LA_V2)
      expect(result.rule!.rule_name).toMatch(/2022 Amendment/)
    })

    it('returns the passbook savings rate (2.75%)', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.rates).toHaveLength(1)
      expect(result.rates[0].numeric_value).toBe(2.75)  // percent form: 2.75 = 2.75%
    })

    it('returns both active exemptions', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.exemptions).toHaveLength(2)
    })

    it('returns the LAMC citation', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.citation).not.toBeNull()
      expect(result.citation!.code_name).toBe('Los Angeles Municipal Code')
    })

    it('includes asOfDate and resolvedAt timestamps', async () => {
      const now = new Date()
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.asOfDate.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000)
      expect(result.resolvedAt).toBeInstanceOf(Date)
    })
  })

  // ── Demo 2: Los Angeles (historical — 2018) ────────────────────────────────

  describe('Los Angeles — historical resolution (2018)', () => {
    it('returns the v1 rule (2015 original)', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
        asOfDate: new Date('2018-06-01'),
      })
      expect(result.status).toBe('rule_found')
      expect(result.rule!.id).toBe(IDS.RULE_LA_V1)
    })

    it('returns the 2% fixed rate (not the 2022 passbook rate)', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
        asOfDate: new Date('2018-06-01'),
      })
      expect(result.rates[0].numeric_value).toBe(2.0)  // percent form: 2.0 = 2%
    })
  })

  // ── Demo 3: San Francisco ──────────────────────────────────────────────────

  describe('San Francisco — current resolution', () => {
    it('status is rule_found with the SF Rent Board rate', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.SF,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.status).toBe('rule_found')
      expect(result.rates[0].numeric_value).toBe(1.55)  // percent form: 1.55 = 1.55%
    })

    it('returns the SF affordable housing exemption', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.SF,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.exemptions[0].exemption_type).toBe('affordable_housing')
    })

    it('returns the SF Admin Code citation', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.SF,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.citation!.section).toBe('49.2')
    })
  })

  // ── Demo 4: Houston — not applicable ──────────────────────────────────────

  describe('Houston — rule not applicable (Texas has no requirement)', () => {
    it('status is not_applicable', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.HOUSTON,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.status).toBe('not_applicable')
    })

    it('returns the rule record with rule_applies=false', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.HOUSTON,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.rule).not.toBeNull()
      expect(result.rule!.rule_applies).toBe(false)
      expect(result.rule!.not_applicable_reason).toMatch(/Texas/)
    })

    it('returns no rates or exemptions when not applicable', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.HOUSTON,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.rates).toHaveLength(0)
      expect(result.exemptions).toHaveLength(0)
      expect(result.citation).toBeNull()
    })
  })

  // ── Demo 5: No rule at all ─────────────────────────────────────────────────

  describe('jurisdiction with no rule defined', () => {
    it('status is no_rule', async () => {
      const result = await engine.resolve({
        jurisdictionId: 'jur-uncharted-city',
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.status).toBe('no_rule')
    })

    it('returns null rule, empty rates, empty exemptions, null citation', async () => {
      const result = await engine.resolve({
        jurisdictionId: 'jur-uncharted-city',
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
      })
      expect(result.rule).toBeNull()
      expect(result.rates).toHaveLength(0)
      expect(result.exemptions).toHaveLength(0)
      expect(result.citation).toBeNull()
    })
  })

  // ── Demo 6: Date boundary edge cases ──────────────────────────────────────

  describe('date boundary correctness', () => {
    it('LA: rule is active on its exact effective_date', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
        asOfDate: new Date('2015-07-01'),
      })
      expect(result.status).toBe('rule_found')
      expect(result.rule!.id).toBe(IDS.RULE_LA_V1)
    })

    it('LA: the day before effective_date returns no_rule', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
        asOfDate: new Date('2015-06-30'),
      })
      expect(result.status).toBe('no_rule')
    })

    it('LA: on the superseded_date v2 is already active (not v1)', async () => {
      const result = await engine.resolve({
        jurisdictionId: IDS.LA,
        ruleTypeId: IDS.RT_SECURITY_DEPOSIT,
        asOfDate: new Date('2022-01-01'),
      })
      expect(result.rule!.id).toBe(IDS.RULE_LA_V2)
    })
  })
})
