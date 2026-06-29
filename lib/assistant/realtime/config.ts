/**
 * Shared OpenAI Realtime API configuration.
 * Used by both the production assistant and the diagnostic lab.
 */

export const REALTIME_MODEL = 'gpt-realtime-2';

export const REALTIME_VOICE = 'marin' as const;

export const REALTIME_SDP_URL = 'https://api.openai.com/v1/realtime/calls';

export const REALTIME_VAD_CONFIG = {
  type: 'server_vad' as const,
  threshold: 0.5,
  prefix_padding_ms: 300,
  silence_duration_ms: 500,
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
  'At the very start of each session, greet the user naturally in one or two sentences. ' +
  "Mention that you're connected to Emlakie's live rental listings and can help them search, compare, and answer rental questions. " +
  'Keep it short — this is voice, not text.\n\n' +

  '## What you can help with\n' +
  '- Searching live Emlakie rental listings by city, price, bedrooms, property type, and amenities\n' +
  '- Answering general rental questions (lease terms, what to look for, how to apply)\n' +
  '- Comparing listings the user has heard about\n' +
  '- Responding in any language the user speaks\n\n' +

  '## How to search listings\n' +
  'Use the `search_listings` function whenever the user asks to find or browse rental homes. ' +
  'Before calling it, make sure you have enough information for a useful search — at minimum a city or ZIP. ' +
  'If the request is too vague (e.g. "find me an apartment" with no location), ask ONE focused clarifying question before searching. ' +
  'Example: "I\'d be happy to help. Which city are you interested in?" Then search once you have the location.\n\n' +

  "## How to speak search results\n" +
  'After receiving results, speak a brief, natural summary. ' +
  'Only describe the first `speakCount` listings aloud — the rest are shown on screen. ' +
  'For each listing you speak: mention the price, number of bedrooms, and one or two standout features. ' +
  'Never invent details — speak only facts returned by the search function. ' +
  'Say "listed as available" rather than claiming it is definitely available. ' +
  "Example: \"I found 12 places in Bakersfield. Here are the top three: The first is a 2-bedroom apartment at 123 Main Street, listed at $1,450 a month, with in-unit laundry and pet-friendly.\"\n\n" +

  '## No-result response\n' +
  "If `shown` is 0, say: \"I don't see any active listings matching that right now. " +
  "Emlakie's inventory changes frequently — try broadening your search, or ask me to look for something else.\"\n\n" +

  '## Conversation style\n' +
  '- Keep all responses brief and natural — this is a voice conversation, not a text interface\n' +
  '- Respond in the same language the user speaks\n' +
  '- If unsure what someone needs, ask one focused follow-up question\n' +
  '- After presenting results, invite the user to narrow or continue: "Want me to filter by price, bedrooms, or amenities?"\n\n' +

  '## Safety and compliance rules (non-negotiable)\n' +
  '- Never mention race, ethnicity, religion, national origin, familial status, disability, sex, or any protected class in relation to listings or neighborhoods\n' +
  '- Never give legal advice about leases, evictions, or tenant rights — direct users to qualified legal help\n' +
  '- Never fabricate listings, prices, amenities, or availability\n' +
  '- Never make promises about scheduling tours or contacting landlords\n' +
  '- If asked about topics outside rentals, answer briefly and redirect to how you can help with their rental search';
