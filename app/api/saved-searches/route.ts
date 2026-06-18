import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function buildLabel(filters: Record<string, string>): string {
  const parts: string[] = [];
  if (filters.bedrooms) parts.push(filters.bedrooms === '0' ? 'Studio' : `${filters.bedrooms}BR`);
  if (filters.propertyType) parts.push(filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1));
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.minPrice && filters.maxPrice) parts.push(`$${Number(filters.minPrice).toLocaleString()}–$${Number(filters.maxPrice).toLocaleString()}/mo`);
  else if (filters.maxPrice) parts.push(`under $${Number(filters.maxPrice).toLocaleString()}/mo`);
  else if (filters.minPrice) parts.push(`$${Number(filters.minPrice).toLocaleString()}+/mo`);
  return parts.length > 0 ? parts.join(' ') : 'All rentals';
}

export async function POST(req: NextRequest) {
  const { email, filters } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  const sb = supabase();
  const label = buildLabel(filters ?? {});
  const safeLabel = escapeHtml(label);

  // Check for existing unverified duplicate
  const { data: existing } = await sb
    .from('saved_searches')
    .select('id, verified')
    .eq('email', email)
    .eq('filters', JSON.stringify(filters))
    .single();

  if (existing?.verified) {
    return NextResponse.json({ error: 'You already have this search saved.' }, { status: 409 });
  }

  // Upsert — resend verification if already exists but unverified
  const { data, error } = existing
    ? await sb.from('saved_searches').select('verify_token').eq('id', existing.id).single()
    : await sb.from('saved_searches').insert({ email, filters, label }).select('verify_token').single();

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 });
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com'}/api/saved-searches/verify?token=${data.verify_token}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'EMLAKIE Alerts <alerts@emlakie.com>',
    to: email,
    subject: `Confirm your rental alert: ${safeLabel}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 16px">
        <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 24px">EMLAKIE</p>
        <h1 style="font-size:20px;font-weight:800;color:#111827;margin:0 0 8px">Confirm your alert</h1>
        <p style="font-size:15px;color:#374151;margin:0 0 8px">You're one click away from getting notified when new homes matching <strong>${safeLabel}</strong> are listed.</p>
        <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;background:#16a34a;color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px">
          Confirm Alert
        </a>
        <p style="font-size:12px;color:#9ca3af;margin:24px 0 0">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
