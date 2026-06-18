export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const PLANS: Record<string, { label: string; price: number; days: number }> = {
  '7day':  { label: '7-Day Boost',  price: 1900,  days: 7  },
  '30day': { label: '30-Day Boost', price: 4900,  days: 30 },
  '90day': { label: '90-Day Boost', price: 9900,  days: 90 },
};

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { listingId, planId } = await req.json();

  const plan = PLANS[planId];
  if (!plan || !listingId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { createSupabaseWithToken } = await import('@/lib/supabase-server')
  const supabase = createSupabaseWithToken(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, address, landlord_id')
    .eq('id', listingId)
    .single();

  if (!listing || listing.landlord_id !== user.id) {
    return NextResponse.json({ error: 'Listing not found or unauthorized' }, { status: 403 });
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: plan.price,
          product_data: {
            name: `${plan.label} — ${listing.address}`,
            description: `Featured placement on Emlakie for ${plan.days} days`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      listing_id: listingId,
      plan_id: planId,
      days: plan.days,
      user_id: user.id,
    },
    success_url: `${origin}/landlord/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/landlord/payments`,
  });

  return NextResponse.json({ url: session.url });
}
