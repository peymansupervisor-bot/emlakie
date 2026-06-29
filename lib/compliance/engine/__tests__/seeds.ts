/**
 * Realistic seed data for unit tests.
 *
 * Jurisdictions modelled after real US cities with known security deposit
 * interest laws. IDs are stable UUIDs used consistently across test suites.
 */

import type { MockData } from './mock.repository'
import type { JurisdictionRow, LegalRuleRow, RateRow, ExemptionRow, CitationRow } from '../types'

// ── Stable IDs ────────────────────────────────────────────────────────────────

export const IDS = {
  // Jurisdictions
  LA: 'jur-los-angeles-ca',
  SF: 'jur-san-francisco-ca',
  CHICAGO: 'jur-chicago-il',
  HOUSTON: 'jur-houston-tx',   // no requirement

  // Rule types
  RT_SECURITY_DEPOSIT: 'rt-security-deposit',

  // Rules
  RULE_LA_V1: 'rule-la-sd-v1',
  RULE_LA_V2: 'rule-la-sd-v2',
  RULE_SF: 'rule-sf-sd-v1',
  RULE_CHICAGO: 'rule-chicago-sd-v1',
  RULE_HOUSTON_NA: 'rule-houston-sd-na',

  // Rates
  RATE_LA_2015: 'rate-la-2015',
  RATE_LA_2022: 'rate-la-2022',
  RATE_SF: 'rate-sf-2019',

  // Exemptions
  EX_LA_OWNER_OCC: 'ex-la-owner-occ',
  EX_LA_UNIT_COUNT: 'ex-la-unit-count',
  EX_SF_AFFORDABLE: 'ex-sf-affordable',

  // Citations
  CIT_LA: 'cit-la-lamc',
  CIT_SF: 'cit-sf-rcc',
}

// ── Jurisdictions ─────────────────────────────────────────────────────────────

const jurisdictions: JurisdictionRow[] = [
  {
    id: IDS.LA,
    name: 'Los Angeles',
    short_name: 'LA',
    jurisdiction_type: 'city',
    state_id: 'state-ca',
    seo_slug: 'los-angeles-ca',
    status: 'active',
    interest_required: true,
    priority_tier: 1,
    governing_rule_id: IDS.RULE_LA_V2,
  },
  {
    id: IDS.SF,
    name: 'San Francisco',
    short_name: 'SF',
    jurisdiction_type: 'city',
    state_id: 'state-ca',
    seo_slug: 'san-francisco-ca',
    status: 'active',
    interest_required: true,
    priority_tier: 1,
    governing_rule_id: IDS.RULE_SF,
  },
  {
    id: IDS.CHICAGO,
    name: 'Chicago',
    short_name: null,
    jurisdiction_type: 'city',
    state_id: 'state-il',
    seo_slug: 'chicago-il',
    status: 'active',
    interest_required: true,
    priority_tier: 1,
    governing_rule_id: IDS.RULE_CHICAGO,
  },
  {
    id: IDS.HOUSTON,
    name: 'Houston',
    short_name: null,
    jurisdiction_type: 'city',
    state_id: 'state-tx',
    seo_slug: 'houston-tx',
    status: 'no_requirement',
    interest_required: false,
    priority_tier: 2,
    governing_rule_id: null,
  },
]

// ── Legal rules ───────────────────────────────────────────────────────────────
// LA has two versions: v1 effective 2015, superseded 2022; v2 effective 2022.

const rules: LegalRuleRow[] = [
  {
    id: IDS.RULE_LA_V1,
    jurisdiction_id: IDS.LA,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    version_number: 1,
    is_current: false,
    rule_name: 'LA Security Deposit Interest (2015)',
    effective_date: '2015-07-01',
    superseded_date: '2022-01-01',
    rule_applies: true,
    not_applicable_reason: null,
    parameters: { interest_type: 'simple', payment_method: 'annual' },
    citation_id: IDS.CIT_LA,
    change_reason: 'Initial adoption',
    created_at: '2015-06-01T00:00:00Z',
  },
  {
    id: IDS.RULE_LA_V2,
    jurisdiction_id: IDS.LA,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    version_number: 2,
    is_current: true,
    rule_name: 'LA Security Deposit Interest (2022 Amendment)',
    effective_date: '2022-01-01',
    superseded_date: null,
    rule_applies: true,
    not_applicable_reason: null,
    parameters: { interest_type: 'simple', payment_method: 'annual' },
    citation_id: IDS.CIT_LA,
    change_reason: 'Rate formula updated to passbook savings rate',
    created_at: '2021-10-01T00:00:00Z',
  },
  {
    id: IDS.RULE_SF,
    jurisdiction_id: IDS.SF,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    version_number: 1,
    is_current: true,
    rule_name: 'SF Security Deposit Interest',
    effective_date: '2019-03-01',
    superseded_date: null,
    rule_applies: true,
    not_applicable_reason: null,
    parameters: { interest_type: 'simple', payment_method: 'annual' },
    citation_id: IDS.CIT_SF,
    change_reason: null,
    created_at: '2019-02-01T00:00:00Z',
  },
  {
    id: IDS.RULE_CHICAGO,
    jurisdiction_id: IDS.CHICAGO,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    version_number: 1,
    is_current: true,
    rule_name: 'Chicago RLTO Security Deposit Interest',
    effective_date: '2010-01-01',
    superseded_date: null,
    rule_applies: true,
    not_applicable_reason: null,
    parameters: { interest_type: 'simple', payment_method: 'annually' },
    citation_id: null,
    change_reason: null,
    created_at: '2010-01-01T00:00:00Z',
  },
  {
    id: IDS.RULE_HOUSTON_NA,
    jurisdiction_id: IDS.HOUSTON,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    version_number: 1,
    is_current: true,
    rule_name: 'Houston — No Security Deposit Interest Requirement',
    effective_date: '2000-01-01',
    superseded_date: null,
    rule_applies: false,
    not_applicable_reason: 'Texas state law does not require security deposit interest',
    parameters: {},
    citation_id: null,
    change_reason: null,
    created_at: '2000-01-01T00:00:00Z',
  },
]

// ── Rates ─────────────────────────────────────────────────────────────────────

const rates: RateRow[] = [
  // LA v1: 2% from 2015 to 2022
  {
    id: IDS.RATE_LA_2015,
    legal_rule_id: IDS.RULE_LA_V1,
    jurisdiction_id: IDS.LA,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    rate_key: 'annual_interest_rate',
    effective_from: '2015-07-01',
    effective_to: '2021-12-31',
    numeric_value: 0.02,
    rate_source_description: 'Fixed at 2% per LAMC §49.99',
    rate_source_url: null,
    is_published: true,
    notes: null,
  },
  // LA v2: passbook savings rate 2022–present
  {
    id: IDS.RATE_LA_2022,
    legal_rule_id: IDS.RULE_LA_V2,
    jurisdiction_id: IDS.LA,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    rate_key: 'annual_interest_rate',
    effective_from: '2022-01-01',
    effective_to: null,
    numeric_value: 0.0275,
    rate_source_description: 'Passbook savings rate per LAMC §49.99.2',
    rate_source_url: null,
    is_published: true,
    notes: 'Rate updated annually by LAHD',
  },
  // SF rate
  {
    id: IDS.RATE_SF,
    legal_rule_id: IDS.RULE_SF,
    jurisdiction_id: IDS.SF,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    rate_key: 'annual_interest_rate',
    effective_from: '2019-03-01',
    effective_to: null,
    numeric_value: 0.0155,
    rate_source_description: 'Set annually by SF Rent Board',
    rate_source_url: null,
    is_published: true,
    notes: null,
  },
  // Unpublished draft rate — should NOT appear in results
  {
    id: 'rate-la-draft',
    legal_rule_id: IDS.RULE_LA_V2,
    jurisdiction_id: IDS.LA,
    rule_type_id: IDS.RT_SECURITY_DEPOSIT,
    rate_key: 'annual_interest_rate',
    effective_from: '2025-01-01',
    effective_to: null,
    numeric_value: 0.03,
    rate_source_description: 'Proposed 2025 rate (draft, not yet approved)',
    rate_source_url: null,
    is_published: false,
    notes: null,
  },
]

// ── Exemptions ────────────────────────────────────────────────────────────────

const exemptions: ExemptionRow[] = [
  {
    id: IDS.EX_LA_OWNER_OCC,
    legal_rule_id: IDS.RULE_LA_V2,
    jurisdiction_id: IDS.LA,
    exemption_type: 'owner_occupied',
    condition_operator: 'eq',
    condition_value: 'true',
    exemption_description: 'Owner-occupied single-family homes are exempt from LA security deposit interest requirements',
    citation_section: 'LAMC §49.99.1(b)',
    is_active: true,
  },
  {
    id: IDS.EX_LA_UNIT_COUNT,
    legal_rule_id: IDS.RULE_LA_V2,
    jurisdiction_id: IDS.LA,
    exemption_type: 'unit_count',
    condition_operator: 'lt',
    condition_value: '4',
    exemption_description: 'Buildings with fewer than 4 units are exempt',
    citation_section: 'LAMC §49.99.1(a)',
    is_active: true,
  },
  {
    id: IDS.EX_SF_AFFORDABLE,
    legal_rule_id: IDS.RULE_SF,
    jurisdiction_id: IDS.SF,
    exemption_type: 'affordable_housing',
    condition_operator: 'eq',
    condition_value: 'true',
    exemption_description: 'Units covered under Section 8 or other affordable housing programs may be exempt',
    citation_section: null,
    is_active: true,
  },
  // Inactive exemption — should NOT appear in results
  {
    id: 'ex-la-old-commercial',
    legal_rule_id: IDS.RULE_LA_V2,
    jurisdiction_id: IDS.LA,
    exemption_type: 'property_type',
    condition_operator: 'eq',
    condition_value: 'commercial',
    exemption_description: 'Commercial properties (deactivated — no longer relevant)',
    citation_section: null,
    is_active: false,
  },
]

// ── Citations ─────────────────────────────────────────────────────────────────

const citations: CitationRow[] = [
  {
    id: IDS.CIT_LA,
    jurisdiction_id: IDS.LA,
    citation_type: 'municipal_code',
    code_name: 'Los Angeles Municipal Code',
    section: '49.99',
    subsection: null,
    full_citation_formatted: 'LAMC §49.99 – Security Deposit Interest',
    plain_english_summary:
      'Los Angeles landlords must pay annual interest on security deposits at the passbook savings rate set by the Los Angeles Housing Department.',
    official_url: 'https://clkrep.lacity.org/onlinedocs/2021/21-0016_misc_09-14-21.pdf',
    effective_date: '2015-07-01',
  },
  {
    id: IDS.CIT_SF,
    jurisdiction_id: IDS.SF,
    citation_type: 'municipal_code',
    code_name: 'San Francisco Administrative Code',
    section: '49.2',
    subsection: null,
    full_citation_formatted: 'SF Admin Code §49.2 – Interest on Security Deposits',
    plain_english_summary:
      'San Francisco landlords must pay annual interest on security deposits at a rate set by the SF Rent Board each year.',
    official_url: null,
    effective_date: '2019-03-01',
  },
]

// ── Full seed export ──────────────────────────────────────────────────────────

export const SEED: MockData = {
  jurisdictions,
  rules,
  rates,
  exemptions,
  citations,
  ruleTypes: [{ id: IDS.RT_SECURITY_DEPOSIT, slug: 'security_deposit_interest', name: 'Security Deposit Interest' }],
}
