import { adminClient } from '@/lib/moderator';
import ClearButton from './ClearButton';

export const dynamic = 'force-dynamic';

interface SearchParams { source?: string; q?: string }

type ErrorRow = {
  id: string;
  source: string;
  message: string;
  details: string | null;
  user_id: string | null;
  endpoint: string | null;
  http_status: number | null;
  context: Record<string, unknown> | null;
  created_at: string;
};

const SOURCE_COLORS: Record<string, string> = {
  'SEO Cure':     'bg-purple-900/50 text-purple-300 border-purple-700',
  'SEO Audit':    'bg-blue-900/50 text-blue-300 border-blue-700',
  'ADA Cure':     'bg-orange-900/50 text-orange-300 border-orange-700',
  'ADA Audit':    'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  'Health Check': 'bg-teal-900/50 text-teal-300 border-teal-700',
  'Client JS':    'bg-red-900/50 text-red-300 border-red-700',
};

function sourceColor(source: string) {
  if (SOURCE_COLORS[source]) return SOURCE_COLORS[source];
  if (source.startsWith('Photo')) return 'bg-pink-900/50 text-pink-300 border-pink-700';
  if (source.startsWith('Listing')) return 'bg-cyan-900/50 text-cyan-300 border-cyan-700';
  return 'bg-gray-800 text-gray-300 border-gray-600';
}

function statusColor(code: number) {
  if (code >= 500) return 'text-red-400';
  if (code >= 400) return 'text-yellow-400';
  return 'text-gray-400';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }) + ' PT';
}

export default async function DiagnosticsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { source: filterSource, q } = await searchParams;
  const sb = adminClient();

  const { data: errors, error: fetchError } = await sb
    .from('system_error_log')
    .select('id, source, message, details, user_id, endpoint, http_status, context, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (fetchError) {
    return (
      <div className="rounded-2xl border border-red-700 bg-red-950/30 p-6 text-red-300 text-sm">
        <p className="font-bold mb-1">Could not load error log</p>
        <p className="font-mono text-xs">{fetchError.message}</p>
        <p className="text-xs text-red-400 mt-3">
          Run this SQL in Supabase to create the table:
        </p>
        <pre className="mt-2 text-xs bg-gray-900 rounded p-3 overflow-x-auto whitespace-pre-wrap border border-gray-700">{MIGRATION_SQL}</pre>
      </div>
    );
  }

  let rows = (errors ?? []) as ErrorRow[];

  // Filter
  if (filterSource) rows = rows.filter((r) => r.source === filterSource);
  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter((r) =>
      r.message.toLowerCase().includes(lower) ||
      r.source.toLowerCase().includes(lower) ||
      r.endpoint?.toLowerCase().includes(lower) ||
      r.user_id?.toLowerCase().includes(lower) ||
      r.details?.toLowerCase().includes(lower)
    );
  }

  // Source counts from full set
  const allRows = (errors ?? []) as ErrorRow[];
  const sourceCounts: Record<string, number> = {};
  for (const r of allRows) sourceCounts[r.source] = (sourceCounts[r.source] ?? 0) + 1;
  const sources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">Diagnostics</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Platform-wide error log — API failures, client errors, and system operations.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <ClearButton source={filterSource} count={rows.length} />
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search errors…"
            className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-green-500 w-52"
          />
          {filterSource && <input type="hidden" name="source" value={filterSource} />}
          <button type="submit" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition">
            Search
          </button>
        </form>
        </div>
      </div>

      {/* Source filter chips */}
      {sources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href="/135265826/diagnostics"
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${!filterSource ? 'bg-white text-gray-900 border-white' : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-400'}`}
          >
            All ({allRows.length})
          </a>
          {sources.map(([src, count]) => (
            <a
              key={src}
              href={`/135265826/diagnostics?source=${encodeURIComponent(src)}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${filterSource === src ? sourceColor(src) : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-gray-500'}`}
            >
              {src} ({count})
            </a>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-20 text-center">
          <p className="text-green-400 text-lg font-bold">✓ No errors found</p>
          <p className="text-gray-500 text-sm mt-1">
            {filterSource || q ? 'Try clearing the filters.' : 'Errors from all platform operations will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((err) => (
            <div key={err.id} className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
              {/* Main row */}
              <div className="flex flex-wrap items-start gap-3 px-5 py-3">
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${sourceColor(err.source)}`}>
                  {err.source}
                </span>
                {err.http_status && (
                  <span className={`shrink-0 rounded-full bg-gray-800 border border-gray-700 px-2 py-0.5 text-xs font-mono font-bold ${statusColor(err.http_status)}`}>
                    {err.http_status}
                  </span>
                )}
                <p className="flex-1 text-sm text-white font-medium break-words min-w-0">{err.message}</p>
                <p className="shrink-0 text-xs text-gray-500 whitespace-nowrap">{formatDate(err.created_at)}</p>
              </div>

              {/* Meta row */}
              {(err.endpoint || err.user_id || err.context) && (
                <div className="border-t border-gray-800/60 px-5 py-2 flex flex-wrap gap-x-6 gap-y-1">
                  {err.endpoint && (
                    <span className="text-xs text-gray-400 font-mono">
                      <span className="text-gray-600 mr-1">endpoint</span>{err.endpoint}
                    </span>
                  )}
                  {err.user_id && (
                    <span className="text-xs text-gray-400 font-mono">
                      <span className="text-gray-600 mr-1">user</span>{err.user_id}
                    </span>
                  )}
                  {err.context && Object.entries(err.context).map(([k, v]) => (
                    <span key={k} className="text-xs text-gray-400 font-mono">
                      <span className="text-gray-600 mr-1">{k}</span>{String(v)}
                    </span>
                  ))}
                </div>
              )}

              {/* Stack trace */}
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

const MIGRATION_SQL = `-- Run in Supabase SQL editor
alter table public.system_error_log
  add column if not exists user_id uuid,
  add column if not exists endpoint text,
  add column if not exists http_status int,
  add column if not exists context jsonb;

create index if not exists system_error_log_created_at_idx on public.system_error_log (created_at desc);
create index if not exists system_error_log_source_idx on public.system_error_log (source);
create index if not exists system_error_log_user_id_idx on public.system_error_log (user_id);`;
