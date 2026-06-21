import { adminClient } from '@/lib/moderator';
import RunADAAuditButton from '../RunADAAuditButton';
import RepairViolationsButton from '../RepairViolationsButton';
import ADAExportButtons from '../ADAExportButtons';

export const dynamic = 'force-dynamic';

const impactColor: Record<string, string> = {
  critical: 'bg-red-900 text-red-300',
  serious:  'bg-orange-900 text-orange-300',
  moderate: 'bg-yellow-900 text-yellow-300',
  minor:    'bg-gray-700 text-gray-300',
};

export default async function ADAPage() {
  const sb = adminClient();

  // Last 30 audit records (most recent runs across all pages)
  const { data: records } = await sb
    .from('ada_audit_log')
    .select('id, run_id, page_path, violation_count, critical_count, serious_count, passes, incomplete, violations, axe_version, scanned_at')
    .order('scanned_at', { ascending: false })
    .limit(200);

  // Group by run_id — show the most recent 10 runs
  const runMap = new Map<string, typeof records>();
  for (const row of records ?? []) {
    if (!runMap.has(row.run_id)) runMap.set(row.run_id, []);
    runMap.get(row.run_id)!.push(row);
  }
  type AuditRecord = NonNullable<typeof records>[0];
  const runs = Array.from(runMap.entries() as IterableIterator<[string, AuditRecord[]]>).slice(0, 10);

  const latestRun = runs[0];
  const latestRecords = latestRun?.[1] ?? [];
  const scanErrors = latestRecords.filter((r) => r.violation_count === -1).length;
  const latestTotal = latestRecords.filter((r) => r.violation_count > 0).reduce((n, r) => n + r.violation_count, 0);
  const hasIssues = latestRecords.some((r) => r.violation_count !== 0);
  const latestCritical = latestRecords.reduce((n, r) => n + r.critical_count, 0);
  const latestDate = latestRecords[0]?.scanned_at
    ? new Date(latestRecords[0].scanned_at).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' })
    : 'Never';

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">ADA / WCAG Audit Log</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Runs daily at 2 AM · axe-core {latestRecords[0]?.axe_version ?? '—'} · WCAG 2.1 AA
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <ADAExportButtons records={(records ?? []) as never} />
          <RepairViolationsButton hasViolations={hasIssues} />
          <RunADAAuditButton />
        <div className={`rounded-2xl px-5 py-3 text-center ${latestCritical > 0 || scanErrors > 0 ? 'bg-red-900' : latestTotal > 0 ? 'bg-yellow-900' : 'bg-green-900'}`}>
          <p className={`font-bold text-sm ${latestCritical > 0 || scanErrors > 0 ? 'text-red-300' : latestTotal > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
            {latestCritical > 0
              ? `${latestCritical} critical violation${latestCritical > 1 ? 's' : ''}`
              : scanErrors > 0
              ? `${scanErrors} scan error${scanErrors > 1 ? 's' : ''}`
              : latestTotal > 0
              ? `${latestTotal} violation${latestTotal > 1 ? 's' : ''}`
              : 'No violations'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Last scan: {latestDate}</p>
        </div>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-16 text-center text-gray-500">
          No audit runs yet. The scanner runs daily at 2 AM automatically.
        </div>
      ) : (
        <div className="space-y-8">
          {runs.map(([runId, pages]) => {
            const runDate = new Date(pages[0].scanned_at).toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'short',
            });
            const runViolations = pages.reduce((n, p) => n + p.violation_count, 0);
            const runCritical = pages.reduce((n, p) => n + p.critical_count, 0);
            const runPasses = pages.reduce((n, p) => n + p.passes, 0);

            return (
              <div key={runId} className="rounded-2xl border border-gray-800 overflow-hidden">
                {/* Run header */}
                <div className="flex items-center justify-between bg-gray-900 px-5 py-3">
                  <div>
                    <p className="text-sm font-bold text-white">{runDate}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">Run ID: {runId}</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div>
                      <p className={`text-lg font-extrabold ${runCritical > 0 ? 'text-red-400' : 'text-green-400'}`}>{runViolations}</p>
                      <p className="text-xs text-gray-500">violations</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-green-400">{runPasses}</p>
                      <p className="text-xs text-gray-500">passes</p>
                    </div>
                  </div>
                </div>

                {/* Per-page results */}
                <div className="divide-y divide-gray-800">
                  {pages.map((page) => {
                    const violations = (page.violations ?? []) as Array<{ id: string; impact: string | null; description: string; helpUrl: string; nodes: number }>;
                    return (
                      <div key={page.id} className="px-5 py-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`h-2 w-2 rounded-full shrink-0 ${page.violation_count > 0 ? page.critical_count > 0 ? 'bg-red-500' : 'bg-yellow-400' : 'bg-green-400'}`} />
                          <span className="text-sm font-semibold text-white">{page.page_path}</span>
                          <span className="text-xs text-gray-500 ml-auto">{page.passes} passes · {page.incomplete} incomplete</span>
                        </div>
                        {violations.length > 0 && (
                          <div className="ml-5 space-y-1.5 mt-2">
                            {violations.map((v, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0 ${impactColor[v.impact ?? 'minor'] ?? impactColor.minor}`}>
                                  {v.impact ?? 'minor'}
                                </span>
                                <p className="text-xs text-gray-400 leading-snug">{v.description} <span className="text-gray-600">({v.nodes} element{v.nodes !== 1 ? 's' : ''})</span></p>
                              </div>
                            ))}
                          </div>
                        )}
                        {violations.length === 0 && (
                          <p className="ml-5 text-xs text-green-500">No violations found</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/40 px-5 py-4">
        <p className="text-xs font-bold text-gray-300 mb-1">Legal notice</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          All audit records are stored permanently and cannot be edited or deleted. Each record includes a unique Run ID,
          timestamp (UTC), page URL, axe-core version, and full violation detail. These records constitute a continuous
          accessibility compliance log suitable for production in U.S. federal court proceedings under ADA Title III.
        </p>
      </div>
    </div>
  );
}
