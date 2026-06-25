import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const KNOWN_PROPERTY_TYPES = ['apartment', 'house', 'condo', 'studio', 'townhouse', 'room', 'adu'];
const KNOWN_AMENITIES = [
  'Air conditioning', 'Heating', 'In-unit laundry', 'Laundry in building',
  'Dishwasher', 'Parking', 'Garage', 'Pet-friendly', 'Pool', 'Gym',
  'Balcony', 'Furnished', 'Hardwood floors', 'EV charging', 'Storage',
];

export interface InterpretedSearch {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string;
  propertyType?: string;
  amenities?: string[];
  originalQuery: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const prompt = `You are a rental search parser for the EMLAKIE rental platform. A user typed a natural language rental search query. Extract structured search parameters from it.

Query: "${query}"

Return a JSON object with ONLY these fields (omit any you are not confident about):
- city: string (city name only, no state)
- state: string (2-letter US state abbreviation)
- minPrice: number (monthly rent minimum in USD, no $ sign)
- maxPrice: number (monthly rent maximum in USD, no $ sign)
- bedrooms: string ("0" for studio, "1", "2", "3", "4", "5+")
- propertyType: one of ${KNOWN_PROPERTY_TYPES.join(', ')}
- amenities: array of matching strings from this exact list: ${KNOWN_AMENITIES.join(', ')}

Rules:
- "studio" sets bedrooms to "0" and propertyType to "studio"
- "under $X" or "less than $X" → maxPrice
- "above $X" or "at least $X" → minPrice
- "1BR", "1 bed", "one bedroom" → bedrooms "1"
- Only include amenities from the exact list above
- If the query mentions "pet" → include "Pet-friendly"
- If the query mentions "EV" or "electric vehicle" → include "EV charging"
- Return ONLY valid JSON, no explanation, no markdown

JSON:`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}';
    const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    const result: InterpretedSearch = { originalQuery: query };
    if (parsed.city && typeof parsed.city === 'string') result.city = parsed.city;
    if (parsed.state && typeof parsed.state === 'string') result.state = parsed.state.toUpperCase().slice(0, 2);
    if (typeof parsed.minPrice === 'number' && parsed.minPrice > 0) result.minPrice = parsed.minPrice;
    if (typeof parsed.maxPrice === 'number' && parsed.maxPrice > 0) result.maxPrice = parsed.maxPrice;
    if (parsed.bedrooms && ['0','1','2','3','4','5+'].includes(String(parsed.bedrooms))) result.bedrooms = String(parsed.bedrooms);
    if (parsed.propertyType && KNOWN_PROPERTY_TYPES.includes(parsed.propertyType)) result.propertyType = parsed.propertyType;
    if (Array.isArray(parsed.amenities)) {
      result.amenities = parsed.amenities.filter((a: string) => KNOWN_AMENITIES.includes(a));
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Could not interpret search' }, { status: 500 });
  }
}
