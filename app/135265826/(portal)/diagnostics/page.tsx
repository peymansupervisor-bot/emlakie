import { adminClient } from '@/lib/moderator';

export const dynamic = 'force-dynamic';

type ErrorRow = {
  id: string;
  source: string;
  message: string;
  details: string | null;
  created_at: string;
};

const SOURCE_COLORS: Record<string, string> = {
  'SEO Cure':     'bg-purple-900/50 text-purple-300 border-purple-700',
  'SEO Audit':    'bg-blue-900/50 text-blue-300 border-blue-700',
  'ADA Cure':     'bg-orange-900/50 text-orange-300 border-orange-700',
  'ADA Audit':    'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  'Health Check': 'bg-teal-900/50 text-teal-300 border-teal-700',
};

function sourceColor(source: string) {
  return SOURCE_COLORS[source] ?? 'bg-gray-800 text-gray-300 border-gray-600';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }) + ' PT';
}

export default async function DiagnosticsPage() {
  const sb = adminClient();

  const { data: errors, error: fetchError } = await sb
    .from('system_error_log')
    .select('id, source, message, details, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-700 bg-red-950/30 p-6 text-red-300 text-sm">
        <p className="font-bold mb-1">Could not load error log</p>
        <p className="font-mono text-xs">{fetchError.message}</p>
        <p className="text-xs text-red-400 mt-3">
          Make sure the <code>system_error_log</code> table exists. Run the SQL migration in Supabase:
        </p>
        <pre className="mt-2 text-xs bg-gray-900 rounded p-3 overflow-x-auto whitespace-pre-wrap border border-gray-700">{MIGRATION_SQL}</pre>
      </div>
    );
  }

  const rows = (errors ?? []) as ErrorRow[];

  // Source summary counts
  const sourceCounts: Record<string, number> = {};
  for (const r of rows) sourceCounts[r.source] = (sourceCounts[r.source] ?? 0) + 1;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">Diagnostics</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Error log from system operations — SEO cure, ADA cure, health checks, and more.
          </p>
        </div>
        {rows.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(sourceCounts).map(([src, count]) => (
              <span key={src} className={`rounded-full border px-3 py-1 text-xs font-semibold ${sourceColor(src)}`}>
                {src}: {count}
              </span>
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-20 text-center">
          <p className="text-green-400 text-lg font-bold">✓ No errors logged</p>
          <p className="text-gray-500 text-sm mt-1">
            Errors from SEO cure, ADA cure, health checks, and audits will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((err) => (
            <div key={err.id} className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
              <div className="flex items-start justify-between px-5 py-3 gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${sourceColor(err.source)}`}>
                    {err.source}
                  </span>
                  <p className="text-sm text-white font-medium break-words">{err.message}</p>
                </div>
                <p className="shrink-0 text-xs text-gray-500 whitespace-nowrap">{formatDate(err.created_at)}</p>
              </div>
              {err.details && (
                <div className="border-t border-gray-800 px-5 py-3 bg-gray-950">
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap break-words font-mono leading-relaxed max-h-48 overflow-y-auto">
                    {err.details}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const MIGRATION_SQL = `create table if not exists public.system_error_log (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  details text,
  created_at timestamptz not null default now()
);

alter table public.system_error_log enable row level security;

-- Service role (used by adminClient) bypasses RLS automatically.
-- Optionally keep old entries from piling up:
-- create index on public.system_error_log (created_at desc);`;
