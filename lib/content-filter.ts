export interface FilterResult {
  allowed: boolean
  violations: Violation[]
}

export interface Violation {
  term: string
  law: string
  reason: string
  suggestion: string
}

// Fair Housing Act (42 U.S.C. § 3604), ADA, FEHA (CA Gov. Code § 12955)
const PROHIBITED_PATTERNS: { pattern: RegExp; law: string; reason: string; suggestion: string }[] = [
  // Race & Color
  { pattern: /\b(whites?[ -]only|no blacks?|blacks? not welcome|no minorities|minority[ -]free|caucasian[s]? only|no asians?|no hispanics?|no latinos?)\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on race or color', suggestion: 'Describe the property features instead. Example: "Spacious home in a vibrant neighborhood."' },
  { pattern: /\b(perfect for (white|black|asian|hispanic|latino|caucasian))\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on race or color', suggestion: 'Focus on the property itself. Example: "Perfect for anyone who loves open spaces and natural light."' },

  // National Origin
  { pattern: /\b(americans? only|english[ -]speaking only|no immigrants?|us citizens? only|no foreigners?)\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on national origin', suggestion: 'Remove nationality requirements. You may require proof of income or rental history instead.' },

  // Religion
  { pattern: /\b(christians? only|muslims? (not welcome|only)|jews? (not welcome|only)|no muslims?|no jews?|no christians?|religious community only)\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on religion', suggestion: 'Remove all religious references. Describe the home\'s features instead.' },

  // Sex & Gender
  { pattern: /\b(males? only|females? only|men only|women only|no (males?|females?|men|women)|single (male|female|man|woman) (preferred|only))\b/i, law: 'Fair Housing Act §3604', reason: 'Discriminates based on sex', suggestion: 'Remove gender preferences. Example: "Available to all qualified applicants."' },

  // Familial Status (children)
  { pattern: /\b(no children|no kids|adults?[ -]only|child[ -]free|no families|no family|couples? only|single(s)? only|no minors)\b/i, law: 'Fair Housing Act §3604(f)', reason: 'Discriminates based on familial status — cannot exclude children or families', suggestion: 'Remove references to children or family status. Instead describe the home: "Cozy 2-bedroom with a fenced backyard."' },
  { pattern: /\b(perfect for (singles?|couples?|adults?)( only)?)\b/i, law: 'Fair Housing Act §3604(f)', reason: 'May imply exclusion of families with children', suggestion: 'Try: "Great for anyone looking for a quiet, comfortable home." Avoid implying who should or shouldn\'t apply.' },

  // Disability / ADA
  { pattern: /\b(no (disabled|handicapped|wheelchair)|able[ -]bodied only|no mental illness|no (physical|mental) disability)\b/i, law: 'Fair Housing Act §3604 / ADA', reason: 'Discriminates based on disability', suggestion: 'Remove disability-related restrictions. You are required to allow reasonable accommodations under the ADA.' },

  // Age
  { pattern: /\b(no seniors?|no elderly|no retirees?|young (professionals?|people) (preferred|only)|no old(er)? (people|tenants?|residents?))\b/i, law: 'Fair Housing Act / FEHA CA §12955', reason: 'Discriminates based on age', suggestion: 'Remove age preferences. Example: "Great for professionals or anyone seeking a peaceful home."' },

  // Sexual Orientation & Gender Identity (CA protected class)
  { pattern: /\b(no (gay|lesbian|lgbt|lgbtq|transgender)|straight (only|preferred)|no (homosexual|queer))\b/i, law: 'FEHA CA §12955', reason: 'Discriminates based on sexual orientation or gender identity (CA law)', suggestion: 'Remove all references to sexual orientation. All qualified applicants are welcome under California law.' },

  // Source of Income (CA protected class)
  { pattern: /\b(no (section 8|housing vouchers?|government assistance)|section 8 (not accepted|not welcome)|must (have|earn) (own )?income)\b/i, law: 'FEHA CA §12955 / SB 329', reason: 'Cannot refuse Section 8 or housing vouchers in California', suggestion: 'Remove Section 8 restrictions — they are illegal in California. Try: "All income sources considered."' },

  // Marital Status (CA protected class)
  { pattern: /\b(married (couples?|only)|no (single|divorced|unmarried)|must be married)\b/i, law: 'FEHA CA §12955', reason: 'Discriminates based on marital status (CA law)', suggestion: 'Remove marital status requirements. Example: "Open to all qualified applicants."' },

  // Immigration Status (CA protected class)
  { pattern: /\b(must (have|show) (green card|citizenship|visa)|citizens? only|no undocumented)\b/i, law: 'FEHA CA §12955', reason: 'Discriminates based on immigration status (CA law)', suggestion: 'Remove immigration status requirements. You may verify income and rental history instead.' },
]

// Steering language — subtly discourages protected classes
const STEERING_PATTERNS: { pattern: RegExp; law: string; reason: string; suggestion: string }[] = [
  { pattern: /\b(great (for|neighborhood for)|ideal (for|neighborhood for)|perfect (for|neighborhood for)) (families|seniors?|young professionals?|christians?|muslims?|jewish)\b/i, law: 'Fair Housing Act §3604', reason: 'Steering language that targets or excludes protected groups', suggestion: 'Describe the property instead. Example: "Great location near parks, schools, and transit."' },
  { pattern: /\b(safe (neighborhood|area|community)|quiet (neighborhood|community))\b/i, law: 'Fair Housing Act §3604', reason: 'Coded language sometimes used for racial steering', suggestion: 'Use specific, factual descriptions instead. Example: "Low-traffic street" or "Near well-lit walking paths."' },
]

export function filterListingContent(text: string): FilterResult {
  const violations: Violation[] = []

  for (const { pattern, law, reason, suggestion } of [...PROHIBITED_PATTERNS, ...STEERING_PATTERNS]) {
    const match = text.match(pattern)
    if (match) {
      violations.push({ term: match[0], law, reason, suggestion })
    }
  }

  return {
    allowed: violations.length === 0,
    violations,
  }
}

export function getViolationMessage(violations: Violation[]): string {
  if (violations.length === 0) return ''
  const lines = violations.map(v => `• "${v.term}" — ${v.reason} (${v.law})\n  💡 ${v.suggestion}`)
  return `This listing contains language that may violate federal or California fair housing laws:\n\n${lines.join('\n\n')}\n\nPlease remove or rephrase the flagged text before submitting.`
}
