/**
 * Shared OpenAI Realtime API configuration.
 * Used by both the production assistant and the diagnostic lab.
 */

export const REALTIME_MODEL = 'gpt-realtime-2';

export const REALTIME_VOICE = 'marin' as const;

export const REALTIME_SDP_URL = 'https://api.openai.com/v1/realtime/calls';

export const REALTIME_VAD_CONFIG = {
  type: 'server_vad' as const,
  // Raised from 0.5 (default) to 0.8 — requires clearly audible speech to
  // trigger VAD. Ambient noise (TV, music, traffic) typically sits 40–60 dB
  // below a speaking voice and will not cross this threshold.
  threshold: 0.8,
  prefix_padding_ms: 300,
  // Raised from 500 ms to 1000 ms — prevents brief noise gaps from being
  // misread as a completed turn.
  silence_duration_ms: 1000,
};

/** Production token endpoint — requires only ENABLE_AI_ASSISTANT. */
export const REALTIME_TOKEN_URL = '/api/assistant/token';

/**
 * Tool definitions registered with the Realtime session.
 *
 * Extension points for future tools (compare_listings, explain_listing,
 * save_listing, schedule_tour) follow the same shape — add them here and
 * handle them in RealtimeEngine.executeFunctionCall().
 */
export const ASSISTANT_TOOLS = [
  {
    type: 'function' as const,
    name: 'search_listings',
    description:
      "Search Emlakie's live rental database. " +
      'Call this whenever the user wants to find, browse, or search for rental homes. ' +
      'Only call it once you have at least a city name or enough context to perform a useful search — ' +
      'if the request is vague, ask one focused clarifying question first (e.g. which city). ' +
      'Never call this to answer general rental questions that do not require searching listings.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name, e.g. "Bakersfield". Include this whenever the user specifies a location.',
        },
        zip: {
          type: 'string',
          description: '5-digit US ZIP code, if the user specified one.',
        },
        minPrice: {
          type: 'string',
          description: 'Minimum monthly rent in USD as a numeric string, e.g. "1000".',
        },
        maxPrice: {
          type: 'string',
          description: 'Maximum monthly rent in USD as a numeric string, e.g. "2000".',
        },
        bedrooms: {
          type: 'string',
          description: 'Number of bedrooms as a string, e.g. "2". Use "0" for studios.',
        },
        propertyType: {
          type: 'string',
          enum: ['apartment', 'house', 'condo', 'studio', 'townhouse', 'room', 'adu', 'jadu'],
          description: 'Property type, if specified.',
        },
        amenities: {
          type: 'string',
          description:
            'Comma-separated list of requested amenities. ' +
            'Valid values: Pet-friendly, Pool, Gym, In-unit laundry, Laundry in building, ' +
            'Parking, Garage, EV charging, Furnished, Balcony, Air conditioning, Heating, ' +
            'Dishwasher, Hardwood floors, Storage, Fireplace.',
        },
        q: {
          type: 'string',
          description: 'Free-text search for anything not covered by the other fields.',
        },
      },
      required: [],
    },
  },
] as const;

/** System instruction for the production assistant. */
export const ASSISTANT_SYSTEM_INSTRUCTION =
  "You are Emlakie's AI Leasing Assistant — a warm, knowledgeable voice assistant that helps people find their next rental home.\n\n" +

  '## Introduction\n' +
  'Greet the user in ONE sentence of 6 words or fewer, then ask which city they are searching in. ' +
  'Do NOT explain what you can do. Do NOT list features. Just greet and ask. ' +
  'Example: "Hi! Which city are you looking in?"\n\n' +

  '## What you can help with\n' +
  '- Searching live Emlakie rental listings by city, price, bedrooms, property type, and amenities\n' +
  '- Answering general rental questions (lease terms, what to look for, how to apply)\n' +
  '- Responding in any language the user speaks\n\n' +

  '## How to search listings\n' +
  'Use the `search_listings` function whenever the user asks to find or browse rental homes. ' +
  'Before calling it, make sure you have at least a city or ZIP. ' +
  'If the location is missing, ask ONE question: "Which city?" Then search immediately once you have it.\n\n' +

  '## How to speak search results\n' +
  'After receiving results, respond in 2–3 sentences maximum. ' +
  'State how many were found, then for each of the top `speakCount` listings say only the price and bedroom count — nothing more. ' +
  'The cards are already on screen; do not describe features, street addresses, or availability — let the cards do that work. ' +
  'End with one short follow-up offer. ' +
  'Never invent details — speak only facts returned by the search function. ' +
  'Example: "I found 8 places in Bakersfield. Top picks: a 2-bed at $1,450 and a studio at $950. Want me to filter by price or amenities?"\n\n' +

  '## No-result response\n' +
  "If `shown` is 0, say in one sentence: \"Nothing matches that right now — try widening the search or picking a different city.\"\n\n" +

  '## Conversation style\n' +
  '- Every response must be 1–3 sentences. Never longer.\n' +
  '- No filler phrases: never say "Certainly!", "Of course!", "Great question!", "Sure!", or "Absolutely!"\n' +
  '- Do not narrate what you are about to do — just do it\n' +
  '- Respond in the same language the user speaks\n' +
  '- If unsure what someone needs, ask one focused follow-up question\n\n' +

  '## Safety and compliance rules (non-negotiable)\n' +
  '- Never mention race, ethnicity, religion, national origin, familial status, disability, sex, or any protected class in relation to listings or neighborhoods\n' +
  '- Never give legal advice about leases, evictions, or tenant rights — direct users to qualified legal help\n' +
  '- Never fabricate listings, prices, amenities, or availability\n' +
  '- Never make promises about scheduling tours or contacting landlords\n' +
  '- If asked about topics outside rentals, answer briefly and redirect to how you can help with their rental search';
