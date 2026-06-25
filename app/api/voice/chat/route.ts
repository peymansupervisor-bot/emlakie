import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getStats, getMarketPulse, getTrendingCities, getListings } from '@/lib/api';

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function buildContext(mentionedCity?: string): Promise<string> {
  try {
    const [stats, pulse, trending] = await Promise.all([
      getStats(),
      getMarketPulse(),
      getTrendingCities(6),
    ]);

    let ctx = `LIVE EMLAKIE INVENTORY (fetched right now):
- Total active listings: ${stats.listings}
- Cities covered: ${stats.cities}
- Landlords on platform: ${stats.landlords}

MARKET RATES (current avg monthly rent):
${pulse.map(p => `- ${p.label}: $${p.avgRent.toLocaleString()}/mo (${p.count} listings)`).join('\n')}

TRENDING CITIES RIGHT NOW:
${trending.map(c => `- ${c.city}, ${c.state}: avg $${Math.round(c.avgRent).toLocaleString()}/mo`).join('\n')}`;

    if (mentionedCity) {
      const cityListings = await getListings({ city: mentionedCity });
      if (cityListings.listings.length > 0) {
        const rents = cityListings.listings.map(l => l.price).filter(Boolean) as number[];
        const avgRent = rents.length ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : null;
        const minRent = rents.length ? Math.min(...rents) : null;
        ctx += `\n\nLISTINGS IN ${mentionedCity.toUpperCase()} RIGHT NOW:
- Total available: ${cityListings.total}
${avgRent ? `- Average rent: $${avgRent.toLocaleString()}/mo` : ''}
${minRent ? `- Starting from: $${minRent.toLocaleString()}/mo` : ''}
- Sample listings: ${cityListings.listings.slice(0, 3).map(l => `${l.bedrooms ?? '?'}BR at $${l.price?.toLocaleString() ?? '?'}/mo`).join(', ')}`;
      } else {
        ctx += `\n\nNOTE: No listings currently in ${mentionedCity}. Suggest nearby cities from trending list.`;
      }
    }

    return ctx;
  } catch {
    return 'Live inventory data temporarily unavailable.';
  }
}

function buildSystem(context: string): string {
  return `You are Emlakie, a friendly and knowledgeable voice rental assistant for emlakie.com. You have real-time access to the listing database and help renters find their perfect home through natural conversation.

${context}

YOUR PERSONALITY:
- Warm, enthusiastic, and genuinely helpful — like a friend who knows the rental market inside out
- Reference real data from the inventory above when relevant ("We actually have 12 listings there right now!")
- Ask smart follow-up questions to narrow down the search ("Do you have pets?" "Need parking?" "Working from home — need a home office?")
- If a city has no listings, proactively suggest the closest trending city with inventory

CONVERSATION RULES:
1. Keep responses to 1–2 short sentences max. Voice interface — no lists, no markdown.
2. After learning the location, ask ONE follow-up question (budget, bedrooms, pets, must-haves).
3. After 2–3 exchanges, run the search — don't over-question.
4. Reference actual inventory: "Great news, we have listings there!" or "That city's a bit sparse — have you considered Austin?"
5. Never make up prices not in the data above.

RESPONSE FORMAT — always return valid JSON only, nothing else:

No search yet: {"speak": "your response"}
Ready to search: {"speak": "your response", "action": {"type": "search", "params": {...}}}

Search params: city (string), state (2-letter code), bedrooms ("studio","1","2","3","4+"), maxPrice (number), minPrice (number), propertyType ("apartment"|"house"|"condo"|"studio"|"townhome"), amenities (array from: "Pet-friendly","Pool","Gym","Garage","In-unit laundry","Furnished","EV charging","Balcony")

EXAMPLES:
User: "Hi"
→ {"speak": "Hey! I'm Emlakie, your personal rental guide. We have hundreds of homes available right now — where are you looking to move?"}

User: "Los Angeles"
→ {"speak": "Los Angeles is popular! We have listings there. Are you looking for something furnished, or do you have your own furniture?"}

User: "2 bedrooms, under $2500, unfurnished"
→ {"speak": "Perfect, pulling up 2-bedroom homes in LA under $2,500 for you now!", "action": {"type": "search", "params": {"city": "Los Angeles", "state": "CA", "bedrooms": "2", "maxPrice": 2500}}}

User: "Do you have anything pet friendly in Austin?"
→ {"speak": "Austin is one of our hottest markets! I'll find you pet-friendly homes there.", "action": {"type": "search", "params": {"city": "Austin", "state": "TX", "amenities": ["Pet-friendly"]}}}`;
}

function extractCity(messages: Array<{ role: string; content: string }>): string | undefined {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  const cityPatterns = [
    /\bin\s+([a-z\s]+?)(?:\s*,|\s+area|\s+ca|\s+tx|\s+ny|\s+fl|\s+az|\s+wa|\s+co|$)/i,
    /(?:los angeles|la\b|new york|nyc|san francisco|sf\b|austin|houston|dallas|miami|chicago|seattle|denver|phoenix|san diego|bakersfield|fresno|sacramento)/i,
  ];
  for (const pat of cityPatterns) {
    const m = allText.match(pat);
    if (m) {
      const city = (m[1] || m[0]).trim().replace(/\b(ca|tx|ny|fl|az|wa|co)\b/gi, '').trim();
      if (city.length > 2) return city;
    }
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ speak: "Hey! I'm Emlakie, your rental guide. Where are you looking to move?" });
    }

    const mentionedCity = extractCity(messages);
    const context = await buildContext(mentionedCity);
    const system = buildSystem(context);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system,
      messages,
    });

    const raw = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';

    let parsed: { speak: string; action?: { type: string; params: Record<string, unknown> } };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { speak: raw };
    } catch {
      parsed = { speak: raw || "Sorry, I didn't catch that. Could you say it again?" };
    }

    if (!parsed.speak) parsed.speak = "Sorry, something went wrong. Try again!";

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[voice/chat]', err);
    return NextResponse.json({ speak: "Sorry, I had a hiccup. Could you try again?" });
  }
}
