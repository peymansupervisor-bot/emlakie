import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { address, city, state, propertyType, bedrooms, bathrooms, sqft, price, amenities } =
    await req.json();

  if (!city || !propertyType) {
    return NextResponse.json({ error: 'Missing required listing details.' }, { status: 400 });
  }

  const bedroomLabel = bedrooms === '0' ? 'studio' : `${bedrooms}-bedroom`;
  const amenityList = amenities?.length ? amenities.join(', ') : 'none listed';

  const prompt = `You are a rental listing copywriter. Write a compelling, tenant-focused property description for the listing below. Write from the tenant's perspective — highlight lifestyle benefits, neighborhood appeal, and what makes this a great place to live. Be warm, specific, and persuasive. Do NOT use generic filler phrases like "don't miss out" or "schedule your tour today." Keep it between 80–150 words. Return only the description text with no preamble.

Property details:
- Type: ${propertyType}
- Location: ${city}, ${state}${address ? ` (${address})` : ''}
- Size: ${bedroomLabel}, ${bathrooms} bath${sqft ? `, ${sqft} sq ft` : ''}
- Rent: $${price}/month
- Amenities: ${amenityList}`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
  return NextResponse.json({ description: text });
}
