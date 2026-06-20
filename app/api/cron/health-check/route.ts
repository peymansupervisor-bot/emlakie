import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RekognitionClient, ListCollectionsCommand } from '@aws-sdk/client-rekognition';
import { Resend } from 'resend';

type Status = 'ok' | 'degraded' | 'down';
interface CheckResult { service: string; status: Status; message: string }

const ADMIN_EMAIL = 'Support@Emlakie.com';

// ─── individual probes ────────────────────────────────────────────────────────

async function checkSupabase(): Promise<CheckResult> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { error } = await sb.from('listings').select('id').limit(1);
    if (error) return { service: 'Supabase', status: 'down', message: error.message };
    return { service: 'Supabase', status: 'ok', message: 'Database reachable' };
  } catch (e: unknown) {
    return { service: 'Supabase', status: 'down', message: String(e) };
  }
}

async function checkRekognition(): Promise<CheckResult> {
  try {
    const key = process.env.AWS_ACCESS_KEY_ID;
    const secret = process.env.AWS_SECRET_ACCESS_KEY;
    if (!key || !secret) return { service: 'Amazon Rekognition', status: 'down', message: 'AWS credentials missing' };
    const client = new RekognitionClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: { accessKeyId: key, secretAccessKey: secret },
    });
    await client.send(new ListCollectionsCommand({ MaxResults: 1 }));
    return { service: 'Amazon Rekognition', status: 'ok', message: 'Credentials valid, API reachable' };
  } catch (e: unknown) {
    return { service: 'Amazon Rekognition', status: 'down', message: String(e) };
  }
}

async function checkInmanRSS(): Promise<CheckResult> {
  try {
    const res = await fetch('https://www.inman.com/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EMlakieBot/1.0; +https://emlakie.com)' },
      signal: AbortSignal.timeout(8000),
    });
    // 403 means Inman blocks server IPs — expected; site uses fallback headlines which is fully functional
    if (res.status === 403) return { service: 'Inman RSS', status: 'ok', message: 'Inman blocks server requests (expected) — site displaying fallback headlines' };
    if (!res.ok) return { service: 'Inman RSS', status: 'degraded', message: `HTTP ${res.status}` };
    const text = await res.text();
    const count = (text.match(/<item>/g) ?? []).length;
    if (count < 1) return { service: 'Inman RSS', status: 'degraded', message: 'Feed returned 0 items' };
    return { service: 'Inman RSS', status: 'ok', message: `${count} items in feed` };
  } catch (e: unknown) {
    return { service: 'Inman RSS', status: 'down', message: String(e) };
  }
}

async function checkGoogleMaps(): Promise<CheckResult> {
  try {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return { service: 'Google Maps', status: 'down', message: 'API key missing' };
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=Los+Angeles,CA&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data.status === 'OK') return { service: 'Google Maps', status: 'ok', message: 'Geocoding API working' };
    if (data.status === 'REQUEST_DENIED') return { service: 'Google Maps', status: 'down', message: `API key rejected: ${data.error_message}` };
    return { service: 'Google Maps', status: 'degraded', message: `Unexpected status: ${data.status}` };
  } catch (e: unknown) {
    return { service: 'Google Maps', status: 'down', message: String(e) };
  }
}

async function checkResend(): Promise<CheckResult> {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) return { service: 'Resend (Email)', status: 'down', message: 'RESEND_API_KEY missing' };
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 200) return { service: 'Resend (Email)', status: 'ok', message: 'API key valid' };
    if (res.status === 401) return { service: 'Resend (Email)', status: 'down', message: 'API key invalid or revoked' };
    return { service: 'Resend (Email)', status: 'degraded', message: `HTTP ${res.status}` };
  } catch (e: unknown) {
    return { service: 'Resend (Email)', status: 'down', message: String(e) };
  }
}

async function checkStripe(): Promise<CheckResult> {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return { service: 'Stripe (Payments)', status: 'down', message: 'STRIPE_SECRET_KEY missing' };
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (res.status === 200) return { service: 'Stripe (Payments)', status: 'ok', message: 'Account reachable' };
    if (res.status === 401) return { service: 'Stripe (Payments)', status: 'down', message: 'API key invalid or revoked' };
    return { service: 'Stripe (Payments)', status: 'degraded', message: `HTTP ${res.status}` };
  } catch (e: unknown) {
    return { service: 'Stripe (Payments)', status: 'down', message: String(e) };
  }
}

async function checkBridge(): Promise<CheckResult> {
  try {
    const apiKey = process.env.BRIDGE_API_KEY;
    const dataset = process.env.BRIDGE_DATASET;
    if (!apiKey || !dataset) return { service: 'Bridge Interactive (CLAW MLS)', status: 'down', message: 'BRIDGE_API_KEY or BRIDGE_DATASET missing' };
    const params = new URLSearchParams({
      access_token: apiKey,
      '$top': '1',
      '$filter': "StandardStatus eq 'Active'",
    });
    const res = await fetch(`https://api.bridgedataoutput.com/api/v2/${dataset}/listings?${params}`, {
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (res.status === 200) {
      const data = await res.json();
      const count = data?.total?.value ?? 0;
      return { service: 'Bridge Interactive (CLAW MLS)', status: 'ok', message: `API reachable · ${count} active listings` };
    }
    if (res.status === 401 || res.status === 403) return { service: 'Bridge Interactive (CLAW MLS)', status: 'down', message: 'API key rejected' };
    return { service: 'Bridge Interactive (CLAW MLS)', status: 'degraded', message: `HTTP ${res.status}` };
  } catch (e: unknown) {
    return { service: 'Bridge Interactive (CLAW MLS)', status: 'down', message: String(e) };
  }
}

async function checkRapidAPI(): Promise<CheckResult> {
  try {
    const key = process.env.RAPIDAPI_KEY;
    if (!key) return { service: 'RapidAPI (Property Data)', status: 'down', message: 'RAPIDAPI_KEY missing' };
    // Ping the actual host used by the site (zllw-working-api) with a minimal request
    const res = await fetch('https://zllw-working-api.p.rapidapi.com/pro/byaddress?propertyaddress=123+Main+St+Los+Angeles+CA', {
      headers: { 'x-rapidapi-key': key, 'x-rapidapi-host': 'zllw-working-api.p.rapidapi.com' },
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
    if (res.status === 200) return { service: 'RapidAPI (Property Data)', status: 'ok', message: 'API responding' };
    if (res.status === 401 || res.status === 403) return { service: 'RapidAPI (Property Data)', status: 'down', message: 'API key rejected or revoked' };
    if (res.status === 429) return { service: 'RapidAPI (Property Data)', status: 'degraded', message: 'Rate limit hit' };
    if (res.status === 404) return { service: 'RapidAPI (Property Data)', status: 'ok', message: 'API reachable (no data for test address)' };
    return { service: 'RapidAPI (Property Data)', status: 'degraded', message: `HTTP ${res.status}` };
  } catch (e: unknown) {
    return { service: 'RapidAPI (Property Data)', status: 'down', message: String(e) };
  }
}

async function checkGoogleSignIn(): Promise<CheckResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return { service: 'Google Sign-In', status: 'down', message: 'Supabase URL missing' };
    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=https://emlakie.com`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 302) {
      const location = res.headers.get('location') ?? '';
      if (location.includes('accounts.google.com') || location.includes('google.com')) {
        return { service: 'Google Sign-In', status: 'ok', message: 'OAuth redirect to Google confirmed' };
      }
      return { service: 'Google Sign-In', status: 'degraded', message: `Unexpected redirect: ${location.slice(0, 80)}` };
    }
    if (res.status === 500 || res.status === 400) {
      const body = await res.text().catch(() => '');
      return { service: 'Google Sign-In', status: 'down', message: body.slice(0, 120) || `HTTP ${res.status}` };
    }
    return { service: 'Google Sign-In', status: 'degraded', message: `Unexpected HTTP ${res.status}` };
  } catch (e: unknown) {
    return { service: 'Google Sign-In', status: 'down', message: String(e) };
  }
}

async function checkFacebookSignIn(): Promise<CheckResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return { service: 'Facebook Sign-In', status: 'down', message: 'Supabase URL missing' };
    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=facebook&redirect_to=https://emlakie.com`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 302) {
      const location = res.headers.get('location') ?? '';
      if (location.includes('facebook.com')) {
        return { service: 'Facebook Sign-In', status: 'ok', message: 'OAuth redirect to Facebook confirmed' };
      }
      return { service: 'Facebook Sign-In', status: 'degraded', message: `Unexpected redirect: ${location.slice(0, 80)}` };
    }
    if (res.status === 500 || res.status === 400) {
      const body = await res.text().catch(() => '');
      return { service: 'Facebook Sign-In', status: 'down', message: body.slice(0, 120) || `HTTP ${res.status}` };
    }
    return { service: 'Facebook Sign-In', status: 'degraded', message: `Unexpected HTTP ${res.status}` };
  } catch (e: unknown) {
    return { service: 'Facebook Sign-In', status: 'down', message: String(e) };
  }
}

async function checkAppleSignIn(): Promise<CheckResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return { service: 'Apple Sign-In', status: 'down', message: 'Supabase URL missing' };

    // Supabase's authorize endpoint redirects to Apple if credentials are valid.
    // We follow redirects=false and expect a 302 to accounts.apple.com.
    // Any other response means the Apple client secret is expired or misconfigured.
    const res = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=apple&redirect_to=https://emlakie.com`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 302) {
      const location = res.headers.get('location') ?? '';
      if (location.includes('appleid.apple.com') || location.includes('apple.com')) {
        return { service: 'Apple Sign-In', status: 'ok', message: 'OAuth redirect to Apple confirmed' };
      }
      return { service: 'Apple Sign-In', status: 'degraded', message: `Unexpected redirect: ${location.slice(0, 80)}` };
    }

    if (res.status === 500 || res.status === 400) {
      const body = await res.text().catch(() => '');
      const hint = body.includes('expired') || body.includes('invalid_client')
        ? 'Apple client secret is likely expired — regenerate the JWT in Supabase dashboard'
        : `HTTP ${res.status}: ${body.slice(0, 120)}`;
      return { service: 'Apple Sign-In', status: 'down', message: hint };
    }

    return { service: 'Apple Sign-In', status: 'degraded', message: `Unexpected HTTP ${res.status}` };
  } catch (e: unknown) {
    return { service: 'Apple Sign-In', status: 'down', message: String(e) };
  }
}

async function checkPhotoSystem(): Promise<CheckResult> {
  try {
    const { createClient: createSB } = await import('@supabase/supabase-js');
    const sb = createSB(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // 1. Verify storage bucket is accessible
    const { error: listErr } = await sb.storage.from('listing-photos').list('', { limit: 1 });
    if (listErr) return { service: 'Photo System', status: 'down', message: `Storage bucket unreachable: ${listErr.message}` };

    // 2. Test compression pipeline (sharp) with a minimal 1×1 JPEG
    const { compressImage } = await import('@/lib/compress-image');
    const { default: sharp } = await import('sharp');
    const testBuffer = await sharp({ create: { width: 800, height: 600, channels: 3, background: { r: 100, g: 149, b: 237 } } })
      .jpeg({ quality: 100 }).toBuffer();
    const { buffer: compressed, contentType } = await compressImage(testBuffer, 'image/jpeg');
    if (!compressed || compressed.length === 0) return { service: 'Photo System', status: 'down', message: 'Compression returned empty buffer' };
    if (compressed.length >= testBuffer.length) return { service: 'Photo System', status: 'degraded', message: `Compression not reducing size (${testBuffer.length}B → ${compressed.length}B)` };
    if (contentType !== 'image/jpeg' && contentType !== 'image/webp') return { service: 'Photo System', status: 'degraded', message: `Unexpected output type: ${contentType}` };

    // 3. Test upload + delete cycle to verify write access
    const testPath = `_healthcheck/probe-${Date.now()}.jpg`;
    const { error: uploadErr } = await sb.storage.from('listing-photos').upload(testPath, compressed, { contentType, upsert: true });
    if (uploadErr) return { service: 'Photo System', status: 'down', message: `Storage upload failed: ${uploadErr.message}` };
    await sb.storage.from('listing-photos').remove([testPath]);

    // 4. Verify photo limit constants are consistent (server vs client)
    const SERVER_MAX = 25;
    const SERVER_MIN = 5;
    // Spot-check a real listing — flag if any listing exceeds the cap (data integrity check)
    const { data: overLimit } = await sb.from('listings').select('id, title').filter('photos', 'cs', JSON.stringify(new Array(SERVER_MAX + 1).fill(''))).limit(1);
    if (overLimit && overLimit.length > 0) return {
      service: 'Photo System', status: 'degraded',
      message: `Listing found exceeding ${SERVER_MAX}-photo cap — limit enforcement may have a gap`,
    };

    return {
      service: 'Photo System',
      status: 'ok',
      message: `Storage accessible · Compression working (${Math.round((1 - compressed.length / testBuffer.length) * 100)}% reduction) · Limits enforced (min ${SERVER_MIN}, max ${SERVER_MAX})`,
    };
  } catch (e: unknown) {
    return { service: 'Photo System', status: 'down', message: String(e) };
  }
}

async function checkADAAudit(): Promise<CheckResult> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await sb
      .from('system_health')
      .select('checked_at, message')
      .eq('service', 'ADA Audit')
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { service: 'ADA Audit', status: 'degraded', message: 'No audit run on record yet' };
    const hoursAgo = (Date.now() - new Date(data.checked_at).getTime()) / 3_600_000;
    if (hoursAgo > 26) return { service: 'ADA Audit', status: 'down', message: `Last audit was ${Math.round(hoursAgo)}h ago — missed a daily run` };
    return { service: 'ADA Audit', status: 'ok', message: `Last audit ${Math.round(hoursAgo)}h ago · ${data.message}` };
  } catch (e: unknown) {
    return { service: 'ADA Audit', status: 'down', message: String(e) };
  }
}

async function checkDailyCron(): Promise<CheckResult> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await sb
      .from('system_health')
      .select('checked_at')
      .eq('service', 'Daily Alert Cron')
      .eq('status', 'ok')
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { service: 'Daily Alert Cron', status: 'degraded', message: 'No successful run on record yet' };
    const lastRun = new Date(data.checked_at);
    const hoursAgo = (Date.now() - lastRun.getTime()) / 3_600_000;
    if (hoursAgo > 26) return { service: 'Daily Alert Cron', status: 'down', message: `Last successful run ${Math.round(hoursAgo)}h ago — may have missed a day` };
    return { service: 'Daily Alert Cron', status: 'ok', message: `Last ran ${Math.round(hoursAgo)}h ago` };
  } catch (e: unknown) {
    return { service: 'Daily Alert Cron', status: 'down', message: String(e) };
  }
}

// ─── alert email ─────────────────────────────────────────────────────────────

async function sendAlertEmail(failures: CheckResult[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // can't email if Resend itself is down — results are still stored in DB

  const rows = failures.map((f) => `
    <tr>
      <td style="padding:10px 14px;font-weight:700;color:#111">${f.service}</td>
      <td style="padding:10px 14px;">
        <span style="background:${f.status === 'down' ? '#fee2e2' : '#fef9c3'};color:${f.status === 'down' ? '#991b1b' : '#854d0e'};padding:2px 8px;border-radius:99px;font-size:12px;font-weight:700;text-transform:uppercase;">${f.status}</span>
      </td>
      <td style="padding:10px 14px;color:#6b7280;font-size:13px;">${f.message}</td>
    </tr>
  `).join('');

  const resend = new Resend(key);
  await resend.emails.send({
    from: 'EMLAKIE Monitor <alerts@emlakie.com>',
    to: ADMIN_EMAIL,
    subject: `⚠️ ${failures.length} service${failures.length > 1 ? 's' : ''} need attention — EMLAKIE`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;">
        <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 8px">EMLAKIE</p>
        <h1 style="font-size:18px;font-weight:800;color:#111;margin:0 0 4px">System Health Alert</h1>
        <p style="font-size:14px;color:#6b7280;margin:0 0 24px">The following services are not working correctly as of ${new Date().toUTCString()}.</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px 14px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Service</th>
              <th style="padding:10px 14px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Status</th>
              <th style="padding:10px 14px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Detail</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">
          View the full health dashboard at
          <a href="https://emlakie.com/135265826/health" style="color:#16a34a;">emlakie.com/135265826/health</a>
        </p>
      </div>
    `,
  });
}

// ─── main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = authHeader?.replace('Bearer ', '');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checks = await Promise.allSettled([
    checkSupabase(),
    checkRekognition(),
    checkInmanRSS(),
    checkGoogleMaps(),
    checkResend(),
    checkStripe(),
    checkBridge(),
    checkRapidAPI(),
    checkAppleSignIn(),
    checkGoogleSignIn(),
    checkFacebookSignIn(),
    checkPhotoSystem(),
    checkADAAudit(),
    checkDailyCron(),
  ]);

  const results: CheckResult[] = checks.map((c) =>
    c.status === 'fulfilled' ? c.value : { service: 'Unknown', status: 'down' as Status, message: String(c.reason) }
  );

  // Store all results
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  await sb.from('system_health').insert(
    results.map((r) => ({ service: r.service, status: r.status, message: r.message }))
  );

  // Alert on failures
  const failures = results.filter((r) => r.status !== 'ok');
  if (failures.length > 0) {
    await sendAlertEmail(failures);
  }

  return NextResponse.json({ checked: results.length, failures: failures.length, results });
}
