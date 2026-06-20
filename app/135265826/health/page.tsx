import { adminClient } from '@/lib/moderator';

export const dynamic = 'force-dynamic';

const SERVICE_ORDER = [
  'Supabase',
  'Amazon Rekognition',
  'Google Maps',
  'Resend (Email)',
  'Stripe (Payments)',
  'ListHub (MLS)',
  'RapidAPI (Property Data)',
  'Inman RSS',
  'Daily Alert Cron',
];

export default async function HealthPage() {
  const sb = adminClient();

  // Latest result per service
  const { data: rows } = await sb
    .from('system_health')
    .select('service, status, message, checked_at')
    .order('checked_at', { ascending: false })
    .limit(200);

  // Deduplicate — keep only the most recent per service
  type HealthRow = { service: string; status: string; message: string; checked_at: string };
  const latest: Record<string, HealthRow> = {};
  for (const row of rows ?? []) {
    if (!latest[row.service]) latest[row.service] = row;
  }

  const services = SERVICE_ORDER.map((name) => latest[name] ?? null).filter(Boolean) as HealthRow[];

  const allOk = services.every((s) => s.status === 'ok');
  const downCount = services.filter((s) => s.status === 'down').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;

  const statusStyles: Record<string, { dot: string; badge: string; row: string }> = {
    ok:       { dot: 'bg-green-400', badge: 'bg-green-900 text-green-300', row: '' },
    degraded: { dot: 'bg-yellow-400 animate-pulse', badge: 'bg-yellow-900 text-yellow-300', row: 'border-l-2 border-yellow-500' },
    down:     { dot: 'bg-red-500 animate-pulse', badge: 'bg-red-900 text-red-300', row: 'border-l-2 border-red-500' },
  };

  const lastChecked = services[0]?.checked_at
    ? new Date(services[0].checked_at).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' })
    : 'Never';

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">System Health</h1>
          <p className="text-sm text-gray-400 mt-0.5">Last checked: {lastChecked} PT · Runs every 6 hours</p>
        </div>
        <div className={`rounded-2xl px-5 py-3 text-center ${allOk ? 'bg-green-900' : downCount > 0 ? 'bg-red-900' : 'bg-yellow-900'}`}>
          {allOk ? (
            <p className="text-green-300 font-bold text-sm">All systems operational</p>
          ) : (
            <>
              {downCount > 0 && <p className="text-red-300 font-bold text-sm">{downCount} service{downCount > 1 ? 's' : ''} down</p>}
              {degradedCount > 0 && <p className="text-yellow-300 font-bold text-sm">{degradedCount} degraded</p>}
            </>
          )}
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-16 text-center text-gray-500">
          No health data yet. The monitor runs every 6 hours automatically.
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800 overflow-hidden divide-y divide-gray-800">
          {services.map((s) => {
            const style = statusStyles[s.status] ?? statusStyles.ok;
            return (
              <div key={s.service} className={`flex items-center gap-4 px-5 py-4 bg-gray-900/30 ${style.row}`}>
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{s.service}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{s.message}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${style.badge}`}>
                  {s.status}
                </span>
                <span className="text-xs text-gray-600 shrink-0">
                  {new Date(s.checked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs text-gray-600">
        You receive an email at <span className="text-gray-400">peymansupervisor@gmail.com</span> immediately when any service goes down or becomes degraded.
      </p>
    </div>
  );
}
