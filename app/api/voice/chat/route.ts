import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getStats, getMarketPulse, getTrendingCities, getListings } from '@/lib/api';

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Cache base context for 5 minutes — avoids 3 DB queries on every voice turn
let baseContextCache: { text: string; expiresAt: number } | null = null;

async function getBaseContext(): Promise<string> {
  if (baseContextCache && Date.now() < baseContextCache.expiresAt) {
    return baseContextCache.text;
  }
  const [stats, pulse, trending] = await Promise.all([
    getStats(),
    getMarketPulse(),
    getTrendingCities(6),
  ]);
  const text = `LIVE EMLAKIE INVENTORY:
- Total active listings: ${stats.listings}
- Cities covered: ${stats.cities}

MARKET RATES (avg monthly rent):
${pulse.map(p => `- ${p.label}: $${p.avgRent.toLocaleString()}/mo (${p.count} listings)`).join('\n')}

TRENDING CITIES:
${trending.map(c => `- ${c.city}, ${c.state}: avg $${Math.round(c.avgRent).toLocaleString()}/mo`).join('\n')}`;
  baseContextCache = { text, expiresAt: Date.now() + 5 * 60 * 1000 };
  return text;
}

async function buildContext(mentionedCity?: string): Promise<string> {
  try {
    const base = await getBaseContext();
    if (!mentionedCity) return base;

    const cityListings = await getListings({ city: mentionedCity });
    if (cityListings.listings.length > 0) {
      const rents = cityListings.listings.map(l => l.price).filter(Boolean) as number[];
      const avgRent = rents.length ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : null;
      const minRent = rents.length ? Math.min(...rents) : null;
      return base + `\n\nLISTINGS IN ${mentionedCity.toUpperCase()} RIGHT NOW:
- Total available: ${cityListings.total}${avgRent ? `\n- Average rent: $${avgRent.toLocaleString()}/mo` : ''}${minRent ? `\n- Starting from: $${minRent.toLocaleString()}/mo` : ''}
- Sample: ${cityListings.listings.slice(0, 3).map(l => `${l.bedrooms ?? '?'}BR at $${l.price?.toLocaleString() ?? '?'}/mo`).join(', ')}`;
    } else {
      return base + `\n\nNOTE: No listings in ${mentionedCity} right now. Suggest nearby cities from trending list.`;
    }
  } catch {
    return 'Live inventory data temporarily unavailable.';
  }
}

function buildSystem(context: string): string {
  return `You are Emlakie, a friendly voice rental assistant for emlakie.com. Help renters find homes through quick natural conversation.

${context}

RULES:
1. 1–2 short sentences max. No lists, no markdown — this is voice.
2. After learning location, ask ONE follow-up (budget? bedrooms? pets?).
3. After 2–3 exchanges, trigger the search — don't over-question.
4. Reference real numbers from inventory above when helpful.
5. If a city has no listings, suggest a trending city nearby.

RESPONSE FORMAT — always output valid complete JSON, nothing else:
No search: {"speak": "your response here"}
Search ready: {"speak": "your response here", "action": {"type": "search", "params": {"city": "Austin", "state": "TX"}}}

Available params: city, state (2-letter code), bedrooms ("studio"/"1"/"2"/"3"/"4+"), maxPrice (number), minPrice (number), propertyType ("apartment"/"house"/"condo"/"studio"/"townhome"), amenities (array of: "Pet-friendly","Pool","Gym","Garage","In-unit laundry","Furnished","EV charging","Balcony")

EXAMPLES:
User: "Los Angeles" → {"speak": "LA is popular! We have listings there. What's your budget?"}
User: "under 2000" → {"speak": "On it!", "action": {"type": "search", "params": {"city": "Los Angeles", "state": "CA", "maxPrice": 2000}}}
User: "pet friendly Austin" → {"speak": "Finding pet-friendly homes in Austin now!", "action": {"type": "search", "params": {"city": "Austin", "state": "TX", "amenities": ["Pet-friendly"]}}}`;
}

function extractCity(messages: Array<{ role: string; content: string }>): string | undefined {
  const allText = messages.map(m => m.content).join(' ');
  const known = allText.match(/\b(los angeles|new york|san francisco|austin|houston|dallas|miami|chicago|seattle|denver|phoenix|san diego|bakersfield|fresno|sacramento|las vegas|portland|atlanta|boston|nashville)\b/i);
  if (known) return known[1];
  const inCity = allText.match(/\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (inCity && inCity[1].length > 2) return inCity[1];
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
      max_tokens: 250,
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
