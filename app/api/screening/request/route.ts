import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken, createSupabaseAdmin } from '@/lib/supabase-server';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';

const PACKAGE_LABELS: Record<string, string> = {
  premium: 'SmartCheck Premium',
  standard: 'SmartCheck Non-Criminal Standard',
};

const PACKAGE_PRICES: Record<string, number> = {
  premium: 48,
  standard: 38,
};

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createSupabaseWithToken(token);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { application_id, listing_id, tenant_name, tenant_email, packages, paid_by = 'applicant' } = body;

    if (!listing_id || !tenant_name || !tenant_email || !packages?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const admin = createSupabaseAdmin();

    // Save tenant_email back to application if provided
    if (application_id && tenant_email) {
      await admin.from('applications').update({ tenant_email }).eq('id', application_id);
    }

    // Create screening request
    const { data: request, error: insertErr } = await admin
      .from('screening_requests')
      .insert({
        application_id: application_id ?? null,
        listing_id,
        landlord_id: user.id,
        tenant_name,
        tenant_email,
        packages,
        paid_by,
        status: 'invited',
      })
      .select('id')
      .single();

    if (insertErr || !request) {
      await logError({ source: 'Screening Request', message: insertErr?.message ?? 'Insert failed', endpoint: 'POST /api/screening/request', http_status: 500 });
      return NextResponse.json({ error: 'Could not create screening request' }, { status: 500 });
    }

    // Fetch listing address for the email
    const { data: listing } = await admin
      .from('listings')
      .select('address, city, state')
      .eq('id', listing_id)
      .single();

    const address = listing ? `${listing.address}, ${listing.city}, ${listing.state}` : 'the property';
    const packageList = packages.map((p: string) => `• ${PACKAGE_LABELS[p] ?? p} — $${PACKAGE_PRICES[p] ?? '?'}`).join('\n');
    const totalCost = packages.reduce((sum: number, p: string) => sum + (PACKAGE_PRICES[p] ?? 0), 0);
    const screeningUrl = `https://rentals-secure.mysmartmove.com/landlord/firstscreening/step-one`;

    // Send email to tenant via Supabase email function (or fallback to a simple fetch)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          to: tenant_email,
          subject: `Tenant Screening Request — ${address}`,
          html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <div style="background:#16a34a;padding:24px;border-radius:12px 12px 0 0;">
    <h1 style="color:white;margin:0;font-size:22px;">EMLAKIE — Tenant Screening Request</h1>
  </div>
  <div style="padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;">
    <p>Hi <strong>${tenant_name}</strong>,</p>
    <p>Your prospective landlord has requested a tenant screening for:</p>
    <p style="font-size:16px;font-weight:bold;color:#16a34a;">${address}</p>
    <p><strong>Reports requested:</strong></p>
    <pre style="font-family:sans-serif;color:#374151;">${packageList}</pre>
    <p style="color:#6b7280;">Total cost paid by ${paid_by === 'applicant' ? 'you (the applicant)' : 'the landlord'}: <strong>$${totalCost}</strong></p>
    <p>Your landlord will initiate the screening through TransUnion SmartMove — a trusted, secure service used by landlords nationwide. You will receive a separate email from TransUnion SmartMove with a link to complete your screening. Your landlord will receive the report directly.</p>
    <p style="color:#6b7280;font-size:13px;">Your personal information and SSN are entered directly on TransUnion's secure site — EMLAKIE never sees or stores them.</p>
    <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;"/>
    <p style="color:#9ca3af;font-size:12px;">EMLAKIE · emlakie.com · Questions? Contact us at support@emlakie.com</p>
  </div>
</div>`,
        }),
      });
    } catch {
      // Email failure is non-fatal — screening request was created
    }

    return NextResponse.json({ ok: true, id: request.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logError({ source: 'Screening Request', message: msg, endpoint: 'POST /api/screening/request', http_status: 500 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
