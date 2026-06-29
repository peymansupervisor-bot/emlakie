import type { CalculationInput, CalculationResult, CalculationStatus } from './types'
import { ENGINE_VERSION } from './types'
import { daysBetween, roundCents } from './utils'
import { buildPeriodBreakdown } from './breakdown'
import { checkExemptions } from './exemptions'
import type { RuleResolution } from '../engine/types'

function makeSnapshot(resolution: RuleResolution) {
  return {
    status: resolution.status,
    ruleId: resolution.rule?.id ?? null,
    ruleName: resolution.rule?.rule_name ?? null,
    jurisdictionId: resolution.rule?.jurisdiction_id ?? '',
    ruleTypeId: resolution.rule?.rule_type_id ?? '',
    asOfDate: resolution.asOfDate.toISOString().slice(0, 10),
  }
}

function earlyResult(
  status: CalculationStatus,
  input: CalculationInput,
  totalDays = 0,
  extra: Partial<CalculationResult> = {},
): CalculationResult {
  return {
    status,
    totalInterest: 0,
    totalDays,
    periods: [],
    warnings: [],
    missingRatePeriods: [],
    exemptionApplied: null,
    engineVersion: ENGINE_VERSION,
    calculatedAt: new Date().toISOString(),
    ruleResolutionSnapshot: makeSnapshot(input.ruleResolution),
    ...extra,
  }
}

/**
 * Calculate security deposit interest.
 *
 * Formula (simple interest):
 *   interest = depositAmount × (annualRatePercent / 100) × days / daysInYear
 *
 * Rates must be in percent form: 2.75 = 2.75%. Do not pass 0.0275.
 * Intermediate values are never rounded. Rounding to cents happens once,
 * on the final totalInterest.
 */
export function calculateInterest(input: CalculationInput): CalculationResult {
  const {
    depositAmount,
    depositReceivedDate,
    depositReturnDate,
    ruleResolution,
    rates,
    propertyFacts,
  } = input

  // ── Input validation ─────────────────────────────────────────────────────

  if (depositAmount < 0) {
    return earlyResult('invalid_input', input, 0, {
      warnings: ['Deposit amount must not be negative.'],
    })
  }

  const totalDays = daysBetween(depositReceivedDate, depositReturnDate)

  if (totalDays < 0) {
    return earlyResult('invalid_input', input, 0, {
      warnings: ['Deposit return date must be on or after deposit received date.'],
    })
  }

  // ── Rule resolution checks ───────────────────────────────────────────────

  if (
    ruleResolution.status === 'no_rule' ||
    ruleResolution.status === 'jurisdiction_not_found'
  ) {
    return earlyResult('no_rule', input, totalDays)
  }

  if (ruleResolution.status === 'not_applicable') {
    const reason = ruleResolution.rule?.not_applicable_reason
    return earlyResult('not_required', input, totalDays, {
      warnings: reason ? [reason] : [],
    })
  }

  // ── Exemption check ──────────────────────────────────────────────────────

  const exemptionApplied = checkExemptions(ruleResolution.exemptions, propertyFacts)
  if (exemptionApplied) {
    return earlyResult('not_required', input, totalDays, {
      exemptionApplied,
      warnings: [`Property is exempt under: ${exemptionApplied}`],
    })
  }

  // ── Zero-day or zero-deposit short circuit ───────────────────────────────

  if (totalDays === 0 || depositAmount === 0) {
    return earlyResult('calculated', input, totalDays)
  }

  // ── Period breakdown and interest calculation ────────────────────────────

  const { periods, missingRatePeriods } = buildPeriodBreakdown(
    depositReceivedDate,
    depositReturnDate,
    depositAmount,
    rates,
  )

  const warnings: string[] = []
  const status: CalculationStatus =
    missingRatePeriods.length > 0 ? 'missing_rates' : 'calculated'

  if (missingRatePeriods.length > 0) {
    warnings.push(
      `Rate data missing for ${missingRatePeriods.length} period(s). ` +
        'Interest shown reflects only periods with known rates.',
    )
  }

  // Sum all raw period interest values, then round once
  const rawTotal = periods.reduce((sum, p) => sum + p.interest, 0)
  const totalInterest = roundCents(rawTotal)

  return {
    status,
    totalInterest,
    totalDays,
    periods,
    warnings,
    missingRatePeriods,
    exemptionApplied: null,
    engineVersion: ENGINE_VERSION,
    calculatedAt: new Date().toISOString(),
    ruleResolutionSnapshot: makeSnapshot(ruleResolution),
  }
}
