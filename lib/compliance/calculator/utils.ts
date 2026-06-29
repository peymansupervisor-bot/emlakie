export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

/**
 * Number of days from startIso (inclusive) to endIso (exclusive).
 * Uses UTC midnight to avoid DST-related errors.
 */
export function daysBetween(startIso: string, endIso: string): number {
  const msPerDay = 86_400_000
  const start = Date.UTC(
    +startIso.slice(0, 4),
    +startIso.slice(5, 7) - 1,
    +startIso.slice(8, 10),
  )
  const end = Date.UTC(
    +endIso.slice(0, 4),
    +endIso.slice(5, 7) - 1,
    +endIso.slice(8, 10),
  )
  return Math.round((end - start) / msPerDay)
}

/** Calendar year of an ISO date string. */
export function yearOf(iso: string): number {
  return +iso.slice(0, 4)
}

/** "YYYY-01-01" for the given year. */
export function yearStart(year: number): string {
  return `${year}-01-01`
}

/** Round to 2 decimal places. Apply only to the final total — never to intermediates. */
export function roundCents(n: number): number {
  return Math.round(n * 100) / 100
}
