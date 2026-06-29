export const ENGINE_VERSION = '1.0.0'

export type CalculationStatus =
  | 'calculated'      // interest determined; may be $0 if deposit=0 or 0 days
  | 'not_required'    // rule_applies=false, or a matching exemption was found
  | 'no_rule'         // no rule exists for this jurisdiction + rule type on this date
  | 'missing_rates'   // rule found, but rate data is absent for part or all of the period
  | 'invalid_input'   // bad input (end before start, negative deposit, etc.)

/**
 * Known property facts used to evaluate exemptions.
 * Keys match exemption_type values in compliance_rule_exemptions.
 */
export interface PropertyFacts {
  owner_occupied?: boolean
  unit_count?: number
  property_type?: string
  affordable_housing?: boolean
  government_subsidized?: boolean
  single_room_occupancy?: boolean
  construction_year?: number
  minimum_tenancy_days?: number
}

export interface CalculationInput {
  /** Deposit amount in dollars. Must be >= 0. */
  depositAmount: number
  /** ISO date "YYYY-MM-DD" — first day deposit was held (inclusive). */
  depositReceivedDate: string
  /** ISO date "YYYY-MM-DD" — day deposit was returned (exclusive for interest accrual). */
  depositReturnDate: string
  /** Full resolution from the Phase 7 compliance engine. */
  ruleResolution: import('../engine/types').RuleResolution
  /**
   * All rate periods that may apply across the full tenancy.
   * The Phase 7 engine returns rates at a single asOfDate; for multi-year
   * tenancies the caller must collect all historical rates and pass them here.
   * numeric_value must be in percent form: 2.75 = 2.75%.
   */
  rates: import('../engine/types').RateRow[]
  /** Optional property details used to evaluate exemptions. */
  propertyFacts?: PropertyFacts
}

/** One contiguous segment of the tenancy at a single rate and calendar year. */
export interface CalculationPeriod {
  startDate: string             // inclusive
  endDate: string               // exclusive
  days: number
  daysInYear: number            // 365 or 366
  annualRatePercent: number     // e.g. 2.75 (not 0.0275)
  interest: number              // raw (unrounded) contribution for this period
  rateSourceDescription: string | null
  rateKey: string
}

/** A contiguous gap where no published rate exists. */
export interface MissingRatePeriod {
  startDate: string
  endDate: string
  days: number
}

export interface CalculationResult {
  status: CalculationStatus
  /** Total interest owed in dollars. Rounded to 2 decimal places at the end only. */
  totalInterest: number
  /** Total calendar days the deposit was held. */
  totalDays: number
  /** Per-period breakdown (one row per rate period × calendar year segment). */
  periods: CalculationPeriod[]
  /** Human-readable warnings (missing rates, exemptions, etc.). */
  warnings: string[]
  /** Gaps where no published rate was found. Interest for these periods is excluded. */
  missingRatePeriods: MissingRatePeriod[]
  /** Exemption type that triggered not_required, or null. */
  exemptionApplied: string | null
  engineVersion: string
  calculatedAt: string          // ISO datetime
  ruleResolutionSnapshot: {
    status: string
    ruleId: string | null
    ruleName: string | null
    jurisdictionId: string
    ruleTypeId: string
    asOfDate: string
  }
}
