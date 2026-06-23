import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function logError(
  source: string,
  message: string,
  details?: string,
): Promise<void> {
  try {
    const sb = adminClient();
    await sb.from('system_error_log').insert({ source, message, details: details ?? null });
  } catch {
    // Never throw from error logger
  }
}
