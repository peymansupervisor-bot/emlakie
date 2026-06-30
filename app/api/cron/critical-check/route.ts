/**
 * GET /api/cron/critical-check
 *
 * Runs every 30 minutes. Tests the three revenue-critical flows:
 *   1. Landlord signup  — Supabase auth pipeline alive
 *   2. Listing creation — /api/listings route alive (expects 401)
 *   3. AI assistant     — /api/assistant/token alive (if enabled)
 *
 * Emails immediately on any failure and writes to system_health.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { logError } from '@/lib/log-error';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
const ADMIN_EMAIL = 'peymansupervisor@gmail.com';

type Status = 'ok' | 'down';
interface Check { name: string; status: Status; detail: string }

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 1. Landlord signup ────────────────────────────────────────────────────────
// Pings the Supabase auth OTP endpoint — confirms auth pipeline is alive without
// creating any user accounts (create_user: false; canary email never gets email).
async function checkSignup(): Promise<Check> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { name: 'Landlord Signup', status: 'down', detail: 'Supabase config missing' };
  try {
    const res = await fetch(`${url}/auth/v1/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key },
      body: JSON.stringify({ email: 'canary@emlakie.com', create_user: false }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.status >= 500) return { name: 'Landlord Signup', status: 'down', detail: `Supabase auth returned HTTP ${res.status}` };
    return { name: 'Landlord Signup', status: 'ok', detail: `Auth pipeline alive (HTTP ${res.status})` };
  } catch (e) {
    return { name: 'Landlord Signup', status: 'down', detail: String(e) };
  }
}

// ── 2. Listing creation ───────────────────────────────────────────────────────
// GET /api/listings without auth — a healthy route returns 401, not 500.
async function checkListings(): Promise<Check> {
  try {
    const res = await fetch(`${SITE_URL}/api/listings`, {
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    if (res.status >= 500) return { name: 'Listing Creation', status: 'down', detail: `API route returned HTTP ${res.status}` };
    return { name: 'Listing Creation', status: 'ok', detail: `Route alive (HTTP ${res.status})` };
  } catch (e) {
    return { name: 'Listing Creation', status: 'down', detail: String(e) };
  }
}

// ── 3. AI leasing assistant ───────────────────────────────────────────────────
// If enabled, POST /api/assistant/token without auth — healthy route returns 403
// (disabled) or 4xx, never 500. If OPENAI_API_KEY is missing, alerts even when
// the assistant is not yet enabled so the key is ready before launch.
async function checkAIAssistant(): Promise<Check> {
  const hasKey = !!process.env.OPENAI_API_KEY;
  const enabled = process.env.ENABLE_AI_ASSISTANT === 'true';

  if (!hasKey) {
    return { name: 'AI Leasing Assistant', status: 'down', detail: 'OPENAI_API_KEY not configured — assistant cannot start when enabled' };
  }
  if (!enabled) {
    return { name: 'AI Leasing Assistant', status: 'ok', detail: 'Intentionally disabled (ENABLE_AI_ASSISTANT not set) — key is configured and ready' };
  }
  try {
    const res = await fetch(`${SITE_URL}/api/assistant/token`, {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    });
    if (res.status >= 500) return { name: 'AI Leasing Assistant', status: 'down', detail: `Token endpoint returned HTTP ${res.status}` };
    return { name: 'AI Leasing Assistant', status: 'ok', detail: `Token endpoint alive (HTTP ${res.status})` };
  } catch (e) {
    return { name: 'AI Leasing Assistant', status: 'down', detail: String(e) };
  }
}

// ── Alert email ───────────────────────────────────────────────────────────────

async function sendAlert(failures: Check[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key || failures.length === 0) return;

  const rows = failures.map((f) => `
    <tr>
      <td style="padding:10px 14px;font-weight:700;color:#111;font-size:14px;">${f.name}</td>
      <td style="padding:10px 14px;color:#dc2626;font-size:13px;">${f.detail}</td>
    </tr>
  `).join('');

  const resend = new Resend(key);
  await resend.emails.send({
    from: 'EMLAKIE Critical Alert <alerts@emlakie.com>',
    to: ADMIN_EMAIL,
    subject: `🚨 CRITICAL: ${failures.map((f) => f.name).join(', ')} — EMLAKIE`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;">
        <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 8px">EMLAKIE</p>
        <h1 style="font-size:18px;font-weight:800;color:#dc2626;margin:0 0 4px">Critical Flow Down</h1>
        <p style="font-size:13px;color:#6b7280;margin:0 0 20px">Detected at ${new Date().toUTCString()}. Landlords or renters may be affected right now.</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #fee2e2;border-radius:8px;overflow:hidden;">
          <thead><tr style="background:#fef2f2;">
            <th style="padding:8px 14px;text-align:left;font-size:11px;color:#991b1b;text-transform:uppercase;letter-spacing:.05em;">Flow</th>
            <th style="padding:8px 14px;text-align:left;font-size:11px;color:#991b1b;text-transform:uppercase;letter-spacing:.05em;">Error</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">This check runs every 30 minutes. You will receive another alert if the issue persists.</p>
      </div>
    `,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '');
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [signup, listings, ai] = await Promise.all([
      checkSignup(),
      checkListings(),
      checkAIAssistant(),
    ]);

    const checks = [signup, listings, ai];
    const database = sb();

    await database.from('system_health').insert(
      checks.map((c) => ({
        service: `Critical: ${c.name}`,
        status: c.status,
        message: c.detail,
      }))
    );

    const failures = checks.filter((c) => c.status === 'down');
    if (failures.length > 0) {
      await Promise.all([
        sendAlert(failures),
        ...failures.map((f) =>
          logError({ source: `Critical Check: ${f.name}`, message: f.detail, endpoint: 'GET /api/cron/critical-check' })
        ),
      ]);
    }

    return NextResponse.json({ ok: failures.length === 0, checks });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logError({ source: 'Cron › Critical-check', message: msg, endpoint: 'GET /api/cron/critical-check', http_status: 500 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
