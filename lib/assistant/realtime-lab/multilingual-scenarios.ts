/**
 * Multilingual testing scenarios for the Emlakie AI Leasing Assistant lab.
 *
 * Each scenario specifies:
 *   - The language(s) being tested
 *   - An exact utterance to say (or type in the demo input)
 *   - What a correct assistant response looks like
 *   - What to record in the lab report
 *
 * These are test definitions only — no runtime logic, no API calls.
 * Import this file in the lab UI to drive the test guidance panel.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * MULTILINGUAL PRINCIPLES UNDER TEST
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Language is detected automatically — users never select it.
 * 2. Mid-conversation switches must be followed naturally.
 * 3. Mixed-language sessions are first-class, not edge cases.
 * 4. Property addresses, prices, listing IDs, and landlord-provided text
 *    must NEVER be translated or paraphrased — reproduced verbatim only.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface LabScenario {
  id: string;
  /** Display label for the scenario card */
  label: string;
  /** BCP-47 codes of languages exercised */
  languages: string[];
  /** Whether this is a mid-conversation language switch test */
  isMixed: boolean;
  /** Ordered list of utterances for this scenario */
  turns: ScenarioTurn[];
  /** What passing looks like */
  passCondition: string;
  /** What to record in the lab report */
  record: string;
}

export interface ScenarioTurn {
  /** The exact text to say or type */
  utterance: string;
  /** Expected response language */
  expectedResponseLanguage: string;
  /** Optional note for the tester */
  note?: string;
}

// ---------------------------------------------------------------------------
// Monolingual scenarios
// ---------------------------------------------------------------------------

export const MONOLINGUAL_SCENARIOS: LabScenario[] = [
  {
    id: 'en-01',
    label: 'English',
    languages: ['en'],
    isMixed: false,
    turns: [
      {
        utterance: "Hi, I'm looking for a two-bedroom apartment in Los Angeles for under two thousand dollars a month. Do you have any suggestions?",
        expectedResponseLanguage: 'English',
        note: 'Standard opening query. Assistant should acknowledge the city, price, and bedroom count.',
      },
      {
        utterance: 'Does it need to allow pets?',
        expectedResponseLanguage: 'English',
        note: 'Follow-up. Assistant should ask a clarifying question.',
      },
    ],
    passCondition: 'Assistant responds in English, understands budget and location, asks a reasonable follow-up.',
    record: 'Response latency (ms) · Did it understand the request? · Follow-up question quality',
  },

  {
    id: 'es-01',
    label: 'Spanish',
    languages: ['es'],
    isMixed: false,
    turns: [
      {
        utterance: 'Hola, estoy buscando un apartamento de dos recámaras en Los Ángeles por menos de dos mil dólares al mes.',
        expectedResponseLanguage: 'Spanish',
        note: 'Standard opening query in Spanish.',
      },
      {
        utterance: '¿Necesito que acepte mascotas?',
        expectedResponseLanguage: 'Spanish',
        note: 'Follow-up in Spanish.',
      },
    ],
    passCondition: 'Assistant responds fully in Spanish throughout. Does not switch to English.',
    record: 'Response latency (ms) · Spanish maintained across both turns? Y/N',
  },

  {
    id: 'fa-01',
    label: 'Persian / Farsi',
    languages: ['fa'],
    isMixed: false,
    turns: [
      {
        utterance: 'سلام، دنبال یک آپارتمان دو خوابه در لس‌آنجلس می‌گردم، زیر دو هزار دلار در ماه.',
        expectedResponseLanguage: 'Persian',
        note: 'Standard opening query in Persian/Farsi.',
      },
      {
        utterance: 'آیا حیوانات خانگی مجاز هستند؟',
        expectedResponseLanguage: 'Persian',
      },
    ],
    passCondition: 'Assistant responds in Persian (Farsi). City name "Los Angeles" must appear verbatim — never transliterated as لس آنجلس unless that is how it is stored.',
    record: 'Response latency (ms) · Persian maintained? Y/N · "Los Angeles" preserved verbatim? Y/N',
  },

  {
    id: 'hy-01',
    label: 'Armenian',
    languages: ['hy'],
    isMixed: false,
    turns: [
      {
        utterance: 'Բարև, ես երկու ննջասենյակ բնակարան եմ փնտրում Լոս Անջելեսում, ամսեկան երկու հազար դոլարից պակաս։',
        expectedResponseLanguage: 'Armenian',
        note: 'Standard opening query in Armenian.',
      },
    ],
    passCondition: 'Assistant responds in Armenian. "Los Angeles" or "Լոս Անջելես" preserved as-is.',
    record: 'Response latency (ms) · Armenian detected? Y/N · City name preserved? Y/N',
  },

  {
    id: 'ru-01',
    label: 'Russian',
    languages: ['ru'],
    isMixed: false,
    turns: [
      {
        utterance: 'Здравствуйте, я ищу двухкомнатную квартиру в Лос-Анджелесе за менее чем две тысячи долларов в месяц.',
        expectedResponseLanguage: 'Russian',
      },
    ],
    passCondition: 'Assistant responds in Russian. Dollar amount and city name preserved.',
    record: 'Response latency (ms) · Russian detected? Y/N',
  },

  {
    id: 'ar-01',
    label: 'Arabic',
    languages: ['ar'],
    isMixed: false,
    turns: [
      {
        utterance: 'مرحباً، أبحث عن شقة بغرفتين في لوس أنجلوس بأقل من ألفي دولار شهرياً.',
        expectedResponseLanguage: 'Arabic',
        note: 'Arabic is RTL. The assistant panel should ideally align content correctly.',
      },
    ],
    passCondition: 'Assistant responds in Arabic. Price and city name preserved verbatim.',
    record: 'Response latency (ms) · Arabic detected? Y/N · RTL rendering correct? Y/N',
  },

  {
    id: 'zh-hans-01',
    label: 'Chinese (Simplified)',
    languages: ['zh-Hans'],
    isMixed: false,
    turns: [
      {
        utterance: '你好，我在洛杉矶找一套两居室公寓，每月租金不超过两千美元。',
        expectedResponseLanguage: 'Chinese (Simplified)',
        note: 'Mainland China users typically use Simplified characters.',
      },
    ],
    passCondition: 'Assistant responds in Simplified Chinese. City name "Los Angeles" or "洛杉矶" preserved correctly.',
    record: 'Response latency (ms) · Simplified Chinese detected? Y/N · City name correct? Y/N',
  },

  {
    id: 'zh-hant-01',
    label: 'Chinese (Traditional)',
    languages: ['zh-Hant'],
    isMixed: false,
    turns: [
      {
        utterance: '你好，我在洛杉磯找一套兩房公寓，每月租金不超過兩千美元。',
        expectedResponseLanguage: 'Chinese (Traditional)',
        note: 'Taiwan/Hong Kong users typically use Traditional characters.',
      },
    ],
    passCondition: 'Assistant responds in Traditional Chinese (繁體). Correct character set used.',
    record: 'Response latency (ms) · Traditional Chinese detected? Y/N · Correct character set? Y/N',
  },

  {
    id: 'ko-01',
    label: 'Korean',
    languages: ['ko'],
    isMixed: false,
    turns: [
      {
        utterance: '안녕하세요, 로스앤젤레스에서 방 두 개짜리 아파트를 찾고 있어요. 월세 2,000달러 이하로요.',
        expectedResponseLanguage: 'Korean',
      },
    ],
    passCondition: 'Assistant responds in Korean. Price in dollars preserved.',
    record: 'Response latency (ms) · Korean detected? Y/N',
  },

  {
    id: 'vi-01',
    label: 'Vietnamese',
    languages: ['vi'],
    isMixed: false,
    turns: [
      {
        utterance: 'Xin chào, tôi đang tìm căn hộ hai phòng ngủ ở Los Angeles với giá thuê dưới 2.000 đô mỗi tháng.',
        expectedResponseLanguage: 'Vietnamese',
      },
    ],
    passCondition: 'Assistant responds in Vietnamese. "Los Angeles" and price preserved.',
    record: 'Response latency (ms) · Vietnamese detected? Y/N',
  },

  {
    id: 'tr-01',
    label: 'Turkish',
    languages: ['tr'],
    isMixed: false,
    turns: [
      {
        utterance: 'Merhaba, Los Angeles\'ta iki yatak odalı bir daire arıyorum, aylık iki bin dolardan az.',
        expectedResponseLanguage: 'Turkish',
        note: 'Standard opening query in Turkish.',
      },
      {
        utterance: 'Evcil hayvan kabul ediyor mu?',
        expectedResponseLanguage: 'Turkish',
        note: 'Follow-up in Turkish.',
      },
    ],
    passCondition: 'Assistant responds in Turkish throughout. "Los Angeles" and price preserved verbatim.',
    record: 'Response latency (ms) · Turkish detected? Y/N · Language maintained across turns? Y/N',
  },
];

// ---------------------------------------------------------------------------
// Mixed-language scenarios
// ---------------------------------------------------------------------------

export const MIXED_LANGUAGE_SCENARIOS: LabScenario[] = [
  {
    id: 'mix-en-es-01',
    label: 'English → Spanish switch',
    languages: ['en', 'es'],
    isMixed: true,
    turns: [
      {
        utterance: "Hi, I'm looking for an apartment in Los Angeles.",
        expectedResponseLanguage: 'English',
        note: 'Turn 1: Start in English.',
      },
      {
        utterance: 'Prefiero hablar en español. ¿Puedes ayudarme en español?',
        expectedResponseLanguage: 'Spanish',
        note: 'Turn 2: Switch to Spanish mid-conversation.',
      },
      {
        utterance: '¿Cuánto cuesta un apartamento de dos recámaras en Hollywood?',
        expectedResponseLanguage: 'Spanish',
        note: 'Turn 3: Continue in Spanish. "Hollywood" must be preserved verbatim.',
      },
    ],
    passCondition: 'Assistant follows the language switch in turn 2 and stays in Spanish for turn 3 without reverting to English.',
    record: 'Did it switch in turn 2? Y/N · Did it stay in Spanish for turn 3? Y/N · "Hollywood" preserved? Y/N',
  },

  {
    id: 'mix-en-fa-01',
    label: 'English → Persian switch',
    languages: ['en', 'fa'],
    isMixed: true,
    turns: [
      {
        utterance: "Hello, I need a two-bedroom apartment.",
        expectedResponseLanguage: 'English',
        note: 'Turn 1: Start in English.',
      },
      {
        utterance: 'ممنون. الان می‌خوام فارسی صحبت کنم. می‌تونی کمکم کنی؟',
        expectedResponseLanguage: 'Persian',
        note: 'Turn 2: Switch to Persian.',
      },
      {
        utterance: 'قیمت اجاره در منطقه Koreatown چقدره؟',
        expectedResponseLanguage: 'Persian',
        note: 'Turn 3: Persian + English proper noun. "Koreatown" must be preserved exactly.',
      },
    ],
    passCondition: 'Assistant switches to Persian in turn 2, stays in Persian in turn 3, preserves "Koreatown" verbatim.',
    record: 'Switch in turn 2? Y/N · Persian in turn 3? Y/N · "Koreatown" verbatim? Y/N',
  },

  {
    id: 'mix-en-tr-01',
    label: 'English → Turkish switch',
    languages: ['en', 'tr'],
    isMixed: true,
    turns: [
      {
        utterance: "Hi, I'm looking for an apartment in Los Angeles.",
        expectedResponseLanguage: 'English',
        note: 'Turn 1: Start in English.',
      },
      {
        utterance: 'Türkçe konuşabilir misiniz? Türkçe devam etmek istiyorum.',
        expectedResponseLanguage: 'Turkish',
        note: 'Turn 2: Switch to Turkish mid-conversation.',
      },
      {
        utterance: 'Hollywood bölgesinde iki yatak odalı daireler ne kadar?',
        expectedResponseLanguage: 'Turkish',
        note: 'Turn 3: Continue in Turkish. "Hollywood" must be preserved verbatim.',
      },
    ],
    passCondition: 'Assistant switches to Turkish in turn 2, stays in Turkish for turn 3, preserves "Hollywood" verbatim.',
    record: 'Switch in turn 2? Y/N · Turkish in turn 3? Y/N · "Hollywood" preserved? Y/N',
  },

  {
    id: 'mix-en-zh-01',
    label: 'English → Chinese (Simplified) switch',
    languages: ['en', 'zh-Hans'],
    isMixed: true,
    turns: [
      {
        utterance: 'Hi, I want to find a rental in the San Fernando Valley.',
        expectedResponseLanguage: 'English',
        note: 'Turn 1: Start in English. "San Fernando Valley" must be preserved.',
      },
      {
        utterance: '我想用中文交流。你可以帮我找一个两居室吗？',
        expectedResponseLanguage: 'Chinese (Simplified)',
        note: 'Turn 2: Switch to Simplified Chinese.',
      },
    ],
    passCondition: 'Assistant switches to Simplified Chinese in turn 2. "San Fernando Valley" preserved if referenced.',
    record: 'Switch in turn 2? Y/N · Correct Chinese character set (simplified)? Y/N',
  },
];

// ---------------------------------------------------------------------------
// Complete scenario list
// ---------------------------------------------------------------------------

export const ALL_SCENARIOS: LabScenario[] = [
  ...MONOLINGUAL_SCENARIOS,
  ...MIXED_LANGUAGE_SCENARIOS,
];
