import { adminClient } from '@/lib/moderator';
import RunHealthCheckButton from '../RunHealthCheckButton';

export const dynamic = 'force-dynamic';

const SERVICE_ORDER = [
  { name: 'Supabase', icon: '🗄️', desc: 'Database & Auth' },
  { name: 'Amazon Rekognition', icon: '📸', desc: 'Photo moderation AI' },
  { name: 'Google Maps', icon: '🗺️', desc: 'Geocoding & map embeds' },
  { name: 'Resend (Email)', icon: '📧', desc: 'Transactional email' },
  { name: 'Stripe (Payments)', icon: '💳', desc: 'Payment processing' },
  { name: 'Bridge Interactive (CLAW MLS)', icon: '🏘️', desc: 'CLAW MLS listing feed via Bridge' },
  { name: 'RapidAPI (Property Data)', icon: '📊', desc: 'Property data provider' },
  { name: 'Apple Sign-In', icon: '🍎', desc: 'Apple OAuth credentials' },
  { name: 'Google Sign-In', icon: '🔵', desc: 'Google OAuth credentials' },
  { name: 'Facebook Sign-In', icon: '📘', desc: 'Facebook OAuth credentials' },
  { name: 'Photo System', icon: '🖼️', desc: 'Upload, compress & storage' },
  { name: 'ADA Audit', icon: '♿', desc: 'WCAG accessibility logger' },
  { name: 'SEO Audit', icon: '🔍', desc: 'SEO meta tags, headings & structured data' },
  { name: 'Inman RSS', icon: '📰', desc: 'Real estate news feed' },
  { name: 'Daily Alert Cron', icon: '⏰', desc: 'Morning renter alerts' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' PT';
}

export default async function HealthPage() {
  const sb = adminClient();

  const { data: rows } = await sb
    .from('system_health')
    .select('service, status, message, checked_at')
    .order('checked_at', { ascending: false })
    .limit(200);

  type HealthRow = { service: string; status: string; message: string; checked_at: string };
  const latest: Record<string, HealthRow> = {};
  for (const row of rows ?? []) {
    if (!latest[row.service]) latest[row.service] = row;
  }

  const downCount = Object.values(latest).filter((s) => s.status === 'down').length;
  const degradedCount = Object.values(latest).filter((s) => s.status === 'degraded').length;
  const hasData = Object.keys(latest).length > 0;
  const allOk = hasData && downCount === 0 && degradedCount === 0;

  const statusStyles: Record<string, { dot: string; badge: string; badgeLabel: string; border: string }> = {
    ok:       { dot: 'bg-green-400', badge: 'bg-green-900/60 text-green-300 ring-1 ring-green-700', badgeLabel: 'Operational', border: 'border-gray-800' },
    degraded: { dot: 'bg-yellow-400 animate-pulse', badge: 'bg-yellow-900/60 text-yellow-300 ring-1 ring-yellow-700', badgeLabel: 'Degraded', border: 'border-l-2 border-l-yellow-500 border-gray-800' },
    down:     { dot: 'bg-red-500 animate-pulse', badge: 'bg-red-900/60 text-red-300 ring-1 ring-red-700', badgeLabel: 'Down', border: 'border-l-2 border-l-red-500 border-gray-800' },
    unknown:  { dot: 'bg-gray-600', badge: 'bg-gray-800 text-gray-500 ring-1 ring-gray-700', badgeLabel: 'Not checked', border: 'border-gray-800' },
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-extrabold text-white">System Health</h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitors all background services automatically once daily at 8 AM PT.
          </p>
        </div>
        <RunHealthCheckButton />
        <div className={`rounded-2xl px-5 py-3 text-center min-w-[160px] ${
          !hasData ? 'bg-gray-800' : allOk ? 'bg-green-900/50 ring-1 ring-green-700' : downCount > 0 ? 'bg-red-900/50 ring-1 ring-red-700' : 'bg-yellow-900/50 ring-1 ring-yellow-700'
        }`}>
          {!hasData ? (
            <p className="text-gray-400 font-bold text-sm">Awaiting first run</p>
          ) : allOk ? (
            <>
              <div className="text-2xl mb-1">✅</div>
              <p className="text-green-300 font-bold text-sm">All systems operational</p>
            </>
          ) : (
            <>
              <div className="text-2xl mb-1">{downCount > 0 ? '🚨' : '⚠️'}</div>
              {downCount > 0 && <p className="text-red-300 font-bold text-sm">{downCount} service{downCount > 1 ? 's' : ''} down</p>}
              {degradedCount > 0 && <p className="text-yellow-300 font-bold text-sm">{degradedCount} degraded</p>}
            </>
          )}
        </div>
      </div>

      {/* Service grid */}
      <div className="grid grid-cols-1 gap-3">
        {SERVICE_ORDER.map(({ name, icon, desc }) => {
          const row = latest[name];
          const style = row ? (statusStyles[row.status] ?? statusStyles.ok) : statusStyles.unknown;
          return (
            <div key={name} className={`rounded-xl bg-gray-900 border ${style.border} px-5 py-4 flex items-center gap-4`}>
              {/* Icon + dot */}
              <div className="relative shrink-0">
                <span className="text-2xl">{icon}</span>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-gray-900 ${style.dot}`} />
              </div>

              {/* Name + desc + message */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{name}</p>
                <p className="text-xs text-gray-500">{desc}</p>
                {row?.message && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{row.message}</p>
                )}
              </div>

              {/* Right: badge + date */}
              <div className="shrink-0 text-right">
                <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold ${style.badge}`}>
                  {style.badgeLabel}
                </span>
                <p className="text-xs text-gray-600 mt-1.5">
                  {row ? formatDate(row.checked_at) : 'Never checked'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-gray-600">
        Email alerts go to <span className="text-gray-400">support@emlakie.com</span> immediately on any failure or degradation.
      </p>
    </div>
  );
}
