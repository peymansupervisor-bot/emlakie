/**
 * Language roster for the Emlakie AI Leasing Assistant.
 *
 * This is the single source of truth for every language the assistant
 * understands, displays, or responds in.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW TO ADD A LANGUAGE
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Add its LanguageCode to types/assistant/index.ts.
 * 2. Add a LanguageDefinition entry in LANGUAGE_ROSTER below.
 * 3. Set enabled: true when ready to activate.
 * 4. Run tsc --noEmit and npm run build.
 *
 * No assistant logic, no state machine, no components, and no hooks
 * need to be modified when a language is added or enabled.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * MULTILINGUAL DESIGN PRINCIPLES
 * ─────────────────────────────────────────────────────────────────────────
 * • Language is DETECTED, not selected. Users never choose a language.
 *   GPT-4o Realtime detects the user's spoken language automatically.
 *
 * • Mid-conversation switching is a FIRST-CLASS scenario. If a user
 *   starts in English and moves to Persian, the assistant follows without
 *   any special signal from the application layer.
 *
 * • Mixed-language conversations are SUPPORTED, not edge cases. The
 *   assistant responds in whichever language the user most recently used.
 *
 * • Proper nouns are NEVER translated: property addresses, city names,
 *   ZIP codes, prices, listing IDs, and landlord-provided text are always
 *   reproduced verbatim as stored in the database. Only conversational
 *   prose is adapted to the user's language.
 *
 * • RTL languages (Arabic, Persian) require dir="rtl" on the assistant
 *   panel container. The `direction` field drives this.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type { LanguageCode, TextDirection } from '@/types/assistant';

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

export interface LanguageDefinition {
  /** BCP-47 / ISO 639-1 code. Must match a LanguageCode in types/assistant/index.ts. */
  code: LanguageCode;

  /** Human-readable name in English. Used in admin UIs, logs, and error messages. */
  nameEn: string;

  /**
   * Language name written in the language itself.
   * Displayed in the assistant panel language strip.
   * Must use the correct Unicode script — no transliteration, no Latin mixing.
   */
  nameSelf: string;

  /** Text direction. Drives dir="rtl" on the assistant panel when active. */
  direction: TextDirection;

  /**
   * Whether this language is currently active.
   * When false: the language is excluded from ACTIVE_LANGUAGES and will not
   * appear in the panel strip or be used as a fallback. The assistant can
   * still receive speech in this language (GPT-4o detects it regardless),
   * but the application layer treats it as unsupported for display purposes.
   *
   * Set to true when:
   *   - The normalisation bridge has been tested for this language
   *   - The assistant panel UI has been verified for RTL/LTR rendering
   *   - At least one round of QA has been completed
   */
  enabled: boolean;

  /**
   * Display priority. Lower number = displayed earlier in the language strip.
   * Languages with the same priority are displayed in roster order.
   */
  priority: number;

  /**
   * Optional notes for the engineering team about this language's status,
   * known quirks, or planned activation date. Never shown to users.
   */
  notes?: string;
}

// ---------------------------------------------------------------------------
// Roster
// ---------------------------------------------------------------------------

/**
 * The complete language roster.
 *
 * Enabled languages appear in the assistant panel strip and are treated as
 * first-class by the normalisation bridge.
 *
 * Disabled languages are defined here so their configuration is ready the
 * moment QA passes — no code changes needed to activate them.
 */
export const LANGUAGE_ROSTER: Readonly<LanguageDefinition[]> = [
  {
    code: 'en',
    nameEn: 'English',
    nameSelf: 'English',
    direction: 'ltr',
    enabled: true,
    priority: 1,
  },
  {
    code: 'es',
    nameEn: 'Spanish',
    nameSelf: 'Español',
    direction: 'ltr',
    enabled: true,
    priority: 2,
  },
  {
    code: 'fa',
    nameEn: 'Persian / Farsi',
    nameSelf: 'فارسی',
    direction: 'rtl',
    enabled: true,
    priority: 3,
    notes: 'RTL — panel must use dir="rtl" when this language is active.',
  },
  {
    code: 'hy',
    nameEn: 'Armenian',
    // U+0540 U+0561 U+0575 U+0565 U+0580 U+0565 U+0576 — pure Armenian script
    nameSelf: 'Հայերեն',
    direction: 'ltr',
    enabled: true,
    priority: 4,
  },
  {
    code: 'ru',
    nameEn: 'Russian',
    nameSelf: 'Русский',
    direction: 'ltr',
    enabled: true,
    priority: 5,
  },
  {
    code: 'ar',
    nameEn: 'Arabic',
    nameSelf: 'العربية',
    direction: 'rtl',
    enabled: true,
    priority: 6,
    notes: 'RTL — panel must use dir="rtl" when this language is active.',
  },
  {
    code: 'zh-Hans',
    nameEn: 'Chinese (Simplified)',
    nameSelf: '中文（简体）',
    direction: 'ltr',
    enabled: true,
    priority: 7,
    notes: 'Used primarily by mainland China users. BCP-47 code is zh-Hans.',
  },
  {
    code: 'zh-Hant',
    nameEn: 'Chinese (Traditional)',
    nameSelf: '中文（繁體）',
    direction: 'ltr',
    enabled: true,
    priority: 8,
    notes: 'Used primarily by Taiwan / Hong Kong users. BCP-47 code is zh-Hant.',
  },
  {
    code: 'ko',
    nameEn: 'Korean',
    nameSelf: '한국어',
    direction: 'ltr',
    enabled: true,
    priority: 9,
  },
  {
    code: 'vi',
    nameEn: 'Vietnamese',
    nameSelf: 'Tiếng Việt',
    direction: 'ltr',
    enabled: true,
    priority: 10,
  },
  {
    code: 'tr',
    nameEn: 'Turkish',
    nameSelf: 'Türkçe',
    direction: 'ltr',
    enabled: true,
    priority: 11,
  },
] as const;

// ---------------------------------------------------------------------------
// Derived constants — all other files import from here, never hard-code
// ---------------------------------------------------------------------------

/** All enabled languages, sorted by priority. */
export const ACTIVE_LANGUAGES: Readonly<LanguageDefinition[]> = LANGUAGE_ROSTER
  .filter((l) => l.enabled)
  .sort((a, b) => a.priority - b.priority);

/** BCP-47 codes of all enabled languages. */
export const ACTIVE_LANGUAGE_CODES: LanguageCode[] = ACTIVE_LANGUAGES.map((l) => l.code);

/** BCP-47 codes of all RTL-enabled languages. */
export const RTL_LANGUAGE_CODES: LanguageCode[] = ACTIVE_LANGUAGES
  .filter((l) => l.direction === 'rtl')
  .map((l) => l.code);

/** Fallback language when detection fails. */
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * Returns true if the given code is a supported RTL language.
 * Safe to call with any string — returns false for unknown codes.
 */
export function isRTL(code: string): boolean {
  return (RTL_LANGUAGE_CODES as string[]).includes(code);
}

/**
 * Returns the LanguageDefinition for a given code, or undefined if not found.
 * Works for both enabled and disabled languages.
 */
export function getLanguage(code: LanguageCode): LanguageDefinition | undefined {
  return LANGUAGE_ROSTER.find((l) => l.code === code);
}

/**
 * Returns the text direction for a given code.
 * Falls back to 'ltr' for unknown or disabled languages.
 */
export function getDirection(code: string): TextDirection {
  const lang = LANGUAGE_ROSTER.find((l) => l.code === code);
  return lang?.direction ?? 'ltr';
}
