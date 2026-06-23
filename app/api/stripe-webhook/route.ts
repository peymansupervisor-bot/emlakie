export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

import { logError } from '@/lib/log-error'
export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const body = await req.text();
    const sig  = req.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { listing_id, days } = session.metadata ?? {};

      if (listing_id && days) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_KEY!,
        );

        const boostedUntil = new Date();
        boostedUntil.setDate(boostedUntil.getDate() + Number(days));

        await supabase
          .from('listings')
          .update({ boosted_until: boostedUntil.toISOString() })
          .eq('id', listing_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Stripe-webhook', message: _msg, details: _stack, endpoint: 'POST /api/stripe-webhook', http_status: 500 });
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
