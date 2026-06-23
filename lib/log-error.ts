import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
