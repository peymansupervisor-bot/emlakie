# Phase 8 Checkpoint — Security Deposit Interest Calculation Engine

**Status:** Closed  
**Commit:** pending  
**Depends on:** Phase 7 (Compliance Engine Core)

---

## What was built

A pure-TypeScript interest calculation engine for security deposit interest laws. No UI. No API routes. No Supabase imports. No real legal data.

### Files added

| File | Purpose |
|------|---------|
| `lib/compliance/calculator/types.ts` | `CalculationInput`, `CalculationResult`, `CalculationPeriod`, `MissingRatePeriod`, `PropertyFacts`, `CalculationStatus`, `ENGINE_VERSION` |
| `lib/compliance/calculator/utils.ts` | `daysBetween`, `daysInYear`, `isLeapYear`, `yearOf`, `yearStart`, `roundCents` |
| `lib/compliance/calculator/breakdown.ts` | `buildPeriodBreakdown` — splits tenancy by year and rate boundaries, computes raw interest per segment |
| `lib/compliance/calculator/exemptions.ts` | `checkExemptions` — evaluates eq/lt/lte/gt/gte conditions against `PropertyFacts` |
| `lib/compliance/calculator/calculate.ts` | `calculateInterest` — main entry point, orchestrates all of the above |
| `lib/compliance/calculator/__tests__/calculate.test.ts` | 61 unit tests across 17 describe blocks |

---

## Confirmed scope boundaries

- **No production legal data seeded** — all four engine tables remain empty (`compliance_legal_rules`, `compliance_rule_rates`, `compliance_rule_exemptions`, `compliance_law_citations`).
- **No API routes added** — the calculator is a pure library callable from server actions, routes, or the AI assistant; it does not expose its own endpoints.
- **No UI added** — no React components, no pages, no admin screens.

---

## Rate storage convention (canonical reference)

`numeric_value` in `RateRow` is stored in **percent form**:

| Value | Meaning | Correct? |
|-------|---------|---------|
| `2.75` | 2.75% | ✅ CORRECT |
| `0.0275` | 0.0275% (100× too small) | ❌ WRONG |

The calculator divides by 100 internally in `breakdown.ts`:

```typescript
const annualRatePercent = rate.numeric_value          // e.g. 2.75
const interest = depositAmount * (annualRatePercent / 100) * (days / yearDays)
```

**Never pre-divide when storing rates.** The warning comment in `breakdown.ts` repeats this.

### Canonical test proving the convention

```
numeric_value = 2.75, depositAmount = 2000, period = 365 days (non-leap year)
Expected: 2000 × (2.75 / 100) × (365 / 365) = $55.00
```

The test `'numeric_value=2.75 / deposit=$2000 / 365 days → totalInterest=$55.00'` in `calculate.test.ts` verifies this. A companion test explicitly shows that storing `0.0275` instead produces `$0.55` — 100× too small.

---

## Formula

```
interest = depositAmount × (annualRatePercent / 100) × (days / daysInYear)
```

- **Simple interest** — no compounding.
- **No intermediate rounding** — each period returns a raw `float`; `roundCents()` is called exactly once on `totalInterest`.
- **Leap years** — each segment uses the `daysInYear` of the year it starts in (365 or 366).
- **DST safety** — `daysBetween` uses `Date.UTC` to prevent off-by-one errors from daylight saving transitions.

---

## Period splitting

`buildPeriodBreakdown` collects split points from:
1. Tenancy start and end dates
2. Calendar year boundaries (Jan 1)
3. Rate `effective_from` and `effective_to` boundaries

Each resulting segment is guaranteed to span a single calendar year and a single rate period.

---

## Exemptions

`checkExemptions` evaluates each active exemption against `PropertyFacts`:
- Operators: `eq`, `lt`, `lte`, `gt`, `gte`
- If the relevant fact is absent (undefined/null), the exemption does **not** apply (conservative default)
- First matching exemption wins; `exemptionApplied` is set to `exemption_type`

---

## Calculation status flow

```
invalid_input    → negative deposit, or returnDate < receivedDate
no_rule          → ruleResolution.status is 'no_rule' or 'jurisdiction_not_found'
not_required     → ruleResolution.status is 'not_applicable', OR an exemption matched
calculated       → normal result (may include missingRatePeriods)
missing_rates    → one or more segments had no matching published rate
```

---

## Key design decisions

- **`CalculationInput.rates` is separate from `ruleResolution.rates`** — Phase 7 `resolve()` fetches rates at one `asOfDate`. For multi-year tenancies the caller must supply all historical rate periods in `CalculationInput.rates`.
- **`ENGINE_VERSION = '1.0.0'`** is included in every `CalculationResult` for future compatibility.
- **`createProductionEngine()` lazy-imports Supabase** — test builds never bundle Supabase code.

---

## Test summary

| Suite | Tests |
|-------|-------|
| Phase 7 engine tests | 56 |
| Phase 8 calculator tests | 61 |
| **Total** | **117** |

All tests pass. Run with:

```bash
npx vitest run lib/compliance
```

---

## Phase 7 cleanup included in this phase

Seeds in `lib/compliance/engine/__tests__/seeds.ts` were fixed from decimal to percent form during Phase 8 cleanup:

| Rate | Before (wrong) | After (correct) |
|------|---------------|----------------|
| LA v1 | `0.02` | `2.0` |
| LA v2 | `0.0275` | `2.75` |
| SF | `0.0155` | `1.55` |
| Draft | `0.03` | `3.0` |

Six test assertions in `resolveApplicableRate.test.ts` and `engine.resolve.test.ts` were updated accordingly.

---

## Next phase

Phase 9 will expose the calculator via a server-side API route so the admin portal and AI assistant can invoke it. No API route is added in this phase.
