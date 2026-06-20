import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> on scheduled invocations
  const authHeader = req.headers.get('authorization');
  const secret = authHeader?.replace('Bearer ', '');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = supabase();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get all verified saved searches
  const { data: searches } = await sb
    .from('saved_searches')
    .select('*')
    .eq('verified', true);

  if (!searches?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const search of searches) {
    const filters = search.filters as Record<string, string>;

    // Find new listings since last notification (or last 24h)
    const cutoff = search.last_notified_at ?? since;
    let query = sb
      .from('listings')
      .select('id, title, address, city, state, price, bedrooms, bathrooms, sqft, photos, slug')
      .eq('status', 'active')
      .gt('created_at', cutoff);

    if (filters.city) {
      if (/^\d{5}$/.test(filters.city)) query = query.eq('zip', filters.city);
      else query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters.minPrice) query = query.gte('price', Number(filters.minPrice));
    if (filters.maxPrice) query = query.lte('price', Number(filters.maxPrice));
    if (filters.bedrooms) query = query.eq('bedrooms', Number(filters.bedrooms));
    if (filters.propertyType) query = query.eq('property_type', filters.propertyType);

    const { data: listings } = await query.limit(10);
    if (!listings?.length) continue;

    const unsubUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com'}/api/saved-searches/unsubscribe?token=${search.unsubscribe_token}`;
    const searchUrl = `https://emlakie.com/rentals${filters.city ? `?city=${encodeURIComponent(filters.city)}` : ''}`;

    const listingCards = listings.map((l: any) => {
      const slug = l.slug ?? l.id;
      const photo = l.photos?.[0];
      const price = `$${Number(l.price).toLocaleString()}/mo`;
      const beds = l.bedrooms === 0 ? 'Studio' : `${l.bedrooms} bed`;
      const baths = `${l.bathrooms} bath`;
      return `
        <a href="https://emlakie.com/rentals/${slug}" style="display:block;text-decoration:none;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:12px;">
          ${photo ? `<img src="${photo}" alt="${l.title}" style="width:100%;height:160px;object-fit:cover;display:block;">` : ''}
          <div style="padding:14px 16px;">
            <p style="margin:0;font-size:18px;font-weight:800;color:#111827;">${price}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#374151;">${beds} · ${baths} · ${l.address}, ${l.city}</p>
          </div>
        </a>
      `;
    }).join('');

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'EMLAKIE Alerts <alerts@emlakie.com>',
      to: search.email,
      subject: `${listings.length} new home${listings.length > 1 ? 's' : ''} matching "${search.label}"`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
          <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 24px">EMLAKIE</p>
          <h1 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 4px">
            ${listings.length} new home${listings.length > 1 ? 's' : ''} for you
          </h1>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px">Matching your alert: <strong>${search.label}</strong></p>
          ${listingCards}
          <a href="${searchUrl}" style="display:block;text-align:center;margin:24px 0 0;background:#16a34a;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px;border-radius:10px;">
            View all results
          </a>
          <p style="margin:24px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
            <a href="${unsubUrl}" style="color:#9ca3af;">Unsubscribe from this alert</a>
          </p>
        </div>
      `,
    });

    // Update last_notified_at
    await sb.from('saved_searches').update({ last_notified_at: new Date().toISOString() }).eq('id', search.id);
    sent++;
  }

  // Record successful run so health monitor can track it
  await sb.from('system_health').insert({
    service: 'Daily Alert Cron',
    status: 'ok',
    message: `Sent ${sent} alert email${sent !== 1 ? 's' : ''} to subscribers`,
  });

  return NextResponse.json({ sent });
}
