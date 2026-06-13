export interface FilterResult {
  allowed: boolean
  violations: Violation[]
}

export interface Violation {
  term: string
  law: string
  reason: string
}

// Fair Housing Act (42 U.S.C. § 3604), ADA, FEHA (CA Gov. Code § 12955)
const PROHIBITED_PATTERNS: { pattern: RegExp; law: string; reason: string }[] = [
  // Race & Color
  { pattern: /\b(whites?[ -]only|no blacks?|blacks? not welcome|no minorities|minority[ -]free|caucasian[s]? only|no asians?|no hispanics?|no latinos?)\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on race or color' },
  { pattern: /\b(perfect for (white|black|asian|hispanic|latino|caucasian))\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on race or color' },

  // National Origin
  { pattern: /\b(americans? only|english[ -]speaking only|no immigrants?|us citizens? only|no foreigners?)\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on national origin' },

  // Religion
  { pattern: /\b(christians? only|muslims? (not welcome|only)|jews? (not welcome|only)|no muslims?|no jews?|no christians?|religious community only)\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on religion' },

  // Sex & Gender
  { pattern: /\b(males? only|females? only|men only|women only|no (males?|females?|men|women)|single (male|female|man|woman) (preferred|only))\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on sex' },

  // Familial Status (children)
  { pattern: /\b(no children|no kids|adults?[ -]only|child[ -]free|no families|no family|couples? only|single(s)? only|no minors)\b/i, law: 'Fair Housing Act §3604(f)', reason: 'Discriminates based on familial status — cannot exclude children or families' },
  { pattern: /\b(perfect for (singles?|couples?|adults?)( only)?)\b/i, law: 'Fair Housing Act §3604(f)', reason: 'May imply exclusion of families with children' },

  // Disability / ADA
  { pattern: /\b(no (disabled|handicapped|wheelchair)|able[ -]bodied only|no mental illness|no (physical|mental) disability)\b/i, law: 'Fair Housing Act §3604 / ADA', reason: 'Discriminates based on disability' },

  // Age
  { pattern: /\b(no seniors?|no elderly|no retirees?|young (professionals?|people) (preferred|only)|no old(er)? (people|tenants?|residents?))\b/i, law: 'Fair Housing Act / FEHA CA §12955', reason: 'Discriminates based on age' },

  // Sexual Orientation & Gender Identity (CA protected class)
  { pattern: /\b(no (gay|lesbian|lgbt|lgbtq|transgender)|straight (only|preferred)|no (homosexual|queer))\b/i, law: 'FEHA CA §12955', reason: 'Discriminates based on sexual orientation or gender identity (CA law)' },

  // Source of Income (CA protected class)
  { pattern: /\b(no (section 8|housing vouchers?|government assistance)|section 8 (not accepted|not welcome)|must (have|earn) (own )?income)\b/i, law: 'FEHA CA §12955 / SB 329', reason: 'Cannot refuse Section 8 or housing vouchers in California' },

  // Marital Status (CA protected class)
  { pattern: /\b(married (couples?|only)|no (single|divorced|unmarried)|must be married)\b/i, law: 'FEHA CA §12955', reason: 'Discriminates based on marital status (CA law)' },

  // Immigration Status (CA protected class)
  { pattern: /\b(must (have|show) (green card|citizenship|visa)|citizens? only|no undocumented)\b/i, law: 'FEHA CA §12955', reason: 'Discriminates based on immigration status (CA law)' },
]

// Steering language — subtly discourages protected classes
const STEERING_PATTERNS: { pattern: RegExp; law: string; reason: string }[] = [
  { pattern: /\b(great (for|neighborhood for)|ideal (for|neighborhood for)|perfect (for|neighborhood for)) (families|seniors?|young professionals?|christians?|muslims?|jewish)\b/i, law: 'Fair Housing Act §3604', reason: 'Steering language that targets or excludes protected groups' },
  { pattern: /\b(safe (neighborhood|area|community)|quiet (neighborhood|community))\b/i, law: 'Fair Housing Act §3604', reason: 'Coded language sometimes used for racial steering — use neutral descriptions instead' },
]

export function filterListingContent(text: string): FilterResult {
  const violations: Violation[] = []

  for (const { pattern, law, reason } of [...PROHIBITED_PATTERNS, ...STEERING_PATTERNS]) {
    const match = text.match(pattern)
    if (match) {
      violations.push({ term: match[0], law, reason })
    }
  }

  return {
    allowed: violations.length === 0,
    violations,
  }
}

export function getViolationMessage(violations: Violation[]): string {
  if (violations.length === 0) return ''
  const lines = violations.map(v => `• "${v.term}" — ${v.reason} (${v.law})`)
  return `This listing contains language that may violate federal or California fair housing laws:\n\n${lines.join('\n')}\n\nPlease remove or rephrase the flagged text before submitting.`
}
