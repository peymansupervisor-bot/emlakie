import type { RateRow } from '../engine/types'
import type { CalculationPeriod, MissingRatePeriod } from './types'
import { daysBetween, daysInYear, yearOf, yearStart } from './utils'

export interface BreakdownResult {
  periods: CalculationPeriod[]
  missingRatePeriods: MissingRatePeriod[]
}

function findRateForDate(rates: RateRow[], dateIso: string): RateRow | null {
  return (
    rates.find(
      (r) =>
        r.effective_from <= dateIso &&
        (r.effective_to === null || r.effective_to > dateIso),
    ) ?? null
  )
}

/**
 * Collect all date split points: tenancy boundaries + calendar year boundaries
 * + rate period boundaries. Each segment between consecutive points is
 * guaranteed to lie within a single calendar year and a single rate period.
 */
function collectSplitPoints(
  startIso: string,
  endIso: string,
  rates: RateRow[],
): string[] {
  const points = new Set<string>([startIso, endIso])

  // Year boundaries (Jan 1 of each year within the tenancy)
  const startYear = yearOf(startIso)
  const endYear = yearOf(endIso)
  for (let yr = startYear + 1; yr <= endYear; yr++) {
    const boundary = yearStart(yr)
    if (boundary > startIso && boundary < endIso) {
      points.add(boundary)
    }
  }

  // Rate period boundaries
  for (const rate of rates) {
    if (rate.effective_from > startIso && rate.effective_from < endIso) {
      points.add(rate.effective_from)
    }
    if (rate.effective_to && rate.effective_to > startIso && rate.effective_to < endIso) {
      points.add(rate.effective_to)
    }
  }

  return Array.from(points).sort()
}

/**
 * Split the deposit period into segments by calendar year and rate boundaries.
 * For each segment, find the applicable rate and compute the raw (unrounded) interest.
 * Segments with no matching rate are recorded in missingRatePeriods.
 *
 * numeric_value in RateRow must be in percent form: 2.75 = 2.75%.
 * Formula per segment: depositAmount × (annualRatePercent / 100) × days / daysInYear
 */
export function buildPeriodBreakdown(
  startIso: string,
  endIso: string,
  depositAmount: number,
  rates: RateRow[],
): BreakdownResult {
  const periods: CalculationPeriod[] = []
  const missingRatePeriods: MissingRatePeriod[] = []

  const splitPoints = collectSplitPoints(startIso, endIso, rates)

  for (let i = 0; i < splitPoints.length - 1; i++) {
    const segStart = splitPoints[i]
    const segEnd = splitPoints[i + 1]
    const days = daysBetween(segStart, segEnd)

    if (days === 0) continue

    const rate = findRateForDate(rates, segStart)

    if (!rate) {
      missingRatePeriods.push({ startDate: segStart, endDate: segEnd, days })
      continue
    }

    const year = yearOf(segStart)
    const yearDays = daysInYear(year)
    const annualRatePercent = rate.numeric_value

    // Raw (unrounded) interest for this segment
    const interest = depositAmount * (annualRatePercent / 100) * (days / yearDays)

    periods.push({
      startDate: segStart,
      endDate: segEnd,
      days,
      daysInYear: yearDays,
      annualRatePercent,
      interest,
      rateSourceDescription: rate.rate_source_description,
      rateKey: rate.rate_key,
    })
  }

  return { periods, missingRatePeriods }
}
