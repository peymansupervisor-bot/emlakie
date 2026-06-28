import { createClient } from '@supabase/supabase-js';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Wraps a cron handler so that a system_health record is ALWAYS written —
 * whether the job succeeds, returns early, or throws. Pass a human-readable
 * `service` name (must match what the health-check reads from system_health).
 *
 * Usage:
 *   return cronRun('Daily Alert Cron', async (record) => {
 *     if (!data) { record('No searches — nothing to send'); return NextResponse.json({ sent: 0 }); }
 *     ...
 *     record(`Sent ${n} emails`);
 *     return NextResponse.json({ sent: n });
 *   });
 */
export async function cronRun<T>(
  service: string,
  fn: (record: (msg: string, status?: 'ok' | 'degraded') => void) => Promise<T>,
): Promise<T> {
  let recordedMessage: string | null = null;
  let recordedStatus: 'ok' | 'degraded' = 'ok';

  function record(msg: string, status: 'ok' | 'degraded' = 'ok') {
    recordedMessage = msg;
    recordedStatus = status;
  }

  try {
    const result = await fn(record);

    await sb().from('system_health').insert({
      service,
      status: recordedStatus,
      message: recordedMessage ?? 'Completed',
    });

    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sb().from('system_health').insert({
      service,
      status: 'down',
      message: msg.slice(0, 500),
    }).then(undefined, () => {}); // never throw from the recorder itself
    throw e;
  }
}
