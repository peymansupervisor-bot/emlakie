import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export interface ErrorLogEntry {
  source: string;
  message: string;
  details?: string;
  user_id?: string;
  endpoint?: string;
  http_status?: number;
  context?: Record<string, unknown>;
}

// Sources that represent the three revenue-critical user flows.
// Any error here gets an immediate email alert (deduplicated per 2 hours).
const CRITICAL_SOURCES = [
  'Listing Create',
  'AI Assistant',
  'Landlord Auth',
  'Photo Upload',
  'Critical Check:',
];

function isCritical(source: string): boolean {
  return CRITICAL_SOURCES.some((s) => source.startsWith(s));
}

async function maybeSendCriticalAlert(source: string, message: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  try {
    const sb = adminClient();
    // Only alert if this is the first occurrence from this source in the last 2 hours
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { count } = await sb
      .from('system_error_log')
      .select('id', { count: 'exact', head: true })
      .eq('source', source)
      .gte('created_at', since);

    // count includes the row we just inserted — only email on the very first occurrence
    if ((count ?? 0) > 1) return;

    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: 'EMLAKIE Error Alert <alerts@emlakie.com>',
      to: 'peymansupervisor@gmail.com',
      subject: `🚨 Critical error: ${source} — EMLAKIE`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;">
          <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 8px">EMLAKIE</p>
          <h1 style="font-size:18px;font-weight:800;color:#dc2626;margin:0 0 4px">Critical Flow Error</h1>
          <p style="font-size:13px;color:#6b7280;margin:0 0 16px">First occurrence detected at ${new Date().toUTCString()}</p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;">
            <p style="margin:0 0 6px;font-size:12px;color:#991b1b;font-weight:700;text-transform:uppercase;">Source</p>
            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#111;">${source}</p>
            <p style="margin:0 0 6px;font-size:12px;color:#991b1b;font-weight:700;text-transform:uppercase;">Error</p>
            <p style="margin:0;font-size:13px;color:#374151;">${message}</p>
          </div>
          <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">
            You will not receive another alert for this source for 2 hours unless the error clears and recurs.
          </p>
        </div>
      `,
    });
  } catch {
    // Never throw from error alerting
  }
}

export async function logError(entry: ErrorLogEntry | string, message?: string, details?: string): Promise<void> {
  try {
    const sb = adminClient();
    const row = typeof entry === 'string'
      ? { source: entry, message: message ?? '', details: details ?? null }
      : {
          source: entry.source,
          message: entry.message,
          details: entry.details ?? null,
          user_id: entry.user_id ?? null,
          endpoint: entry.endpoint ?? null,
          http_status: entry.http_status ?? null,
          context: entry.context ?? null,
        };
    await sb.from('system_error_log').insert(row as never);

    const source = typeof entry === 'string' ? entry : entry.source;
    const msg = typeof entry === 'string' ? (message ?? '') : entry.message;
    if (isCritical(source)) {
      // Fire-and-forget — never block the caller
      maybeSendCriticalAlert(source, msg).catch(() => {});
    }
  } catch {
    // Never throw from error logger
  }
}

type RouteHandler = (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;

/**
 * Wraps a Next.js App Router route handler to catch unhandled exceptions,
 * log them to system_error_log, and return a clean 500 response.
 */
export function withDiagnostics(source: string, handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const stack = e instanceof Error ? e.stack : undefined;

      // Best-effort user extraction from Authorization header
      let userId: string | undefined;
      try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (token) {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          userId = payload.sub;
        }
      } catch {}

      await logError({
        source,
        message: msg,
        details: stack,
        user_id: userId,
        endpoint: `${req.method} ${new URL(req.url).pathname}`,
        http_status: 500,
      });

      return NextResponse.json({ error: msg }, { status: 500 });
    }
  };
}
