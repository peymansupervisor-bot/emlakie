import { adminClient } from '@/lib/moderator';
import RunSEOAuditButton from '../RunSEOAuditButton';

export const dynamic = 'force-dynamic';

const severityStyle: Record<string, string> = {
  error:   'bg-red-900 text-red-300',
  warning: 'bg-yellow-900 text-yellow-300',
  info:    'bg-gray-700 text-gray-300',
};

interface SeoIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

type AuditRow = {
  id: string;
  run_id: string;
  page_path: string;
  title: string | null;
  title_length: number | null;
  description: string | null;
  h1_count: number | null;
  has_canonical: boolean | null;
  canonical_matches: boolean | null;
  og_title: boolean | null;
  og_description: boolean | null;
  og_image: boolean | null;
  has_json_ld: boolean | null;
  response_time_ms: number | null;
  issues: SeoIssue[];
  error_count: number;
  warning_count: number;
  scanned_at: string;
};

export default async function SEOPage() {
  const sb = adminClient();

  const { data: records } = await sb
    .from('seo_audit_log')
    .select('id, run_id, page_path, title, title_length, description, h1_count, has_canonical, canonical_matches, og_title, og_description, og_image, has_json_ld, response_time_ms, issues, error_count, warning_count, scanned_at')
    .order('scanned_at', { ascending: false })
    .limit(300);

  // Group by run_id
  const runMap = new Map<string, AuditRow[]>();
  for (const row of (records ?? []) as AuditRow[]) {
    if (!runMap.has(row.run_id)) runMap.set(row.run_id, []);
    runMap.get(row.run_id)!.push(row);
  }
  const runs = Array.from(runMap.entries()).slice(0, 10);

  const latestRun = runs[0];
  const latestRecords = latestRun?.[1] ?? [];
  const latestErrors = latestRecords.reduce((n, r) => n + r.error_count, 0);
  const latestWarnings = latestRecords.reduce((n, r) => n + r.warning_count, 0);
  const latestClean = latestRecords.filter((r) => r.error_count === 0 && r.warning_count === 0 && r.page_path !== '/_site_wide').length;
  const latestDate = latestRecords[0]?.scanned_at
    ? new Date(latestRecords[0].scanned_at).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short',
      })
    : 'Never';

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-white">SEO Audit Log</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Checks title, description, canonical, OG tags, H1, JSON-LD, and more across all public pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RunSEOAuditButton />
          <div className={`rounded-2xl px-5 py-3 text-center ${latestErrors > 0 ? 'bg-red-900' : latestWarnings > 0 ? 'bg-yellow-900' : 'bg-green-900'}`}>
            <p className={`font-bold text-sm ${latestErrors > 0 ? 'text-red-300' : latestWarnings > 0 ? 'text-yellow-300' : 'text-green-300'}`}>
              {latestErrors > 0
                ? `${latestErrors} error${latestErrors !== 1 ? 's' : ''}, ${latestWarnings} warning${latestWarnings !== 1 ? 's' : ''}`
                : latestWarnings > 0
                ? `${latestWarnings} warning${latestWarnings !== 1 ? 's' : ''}`
                : 'All pages passing'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Last scan: {latestDate}</p>
          </div>
        </div>
      </div>

      {runs.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 py-16 text-center text-gray-500">
          No SEO audit runs yet. Click &quot;Run SEO Audit Now&quot; or wait for the scheduled run.
        </div>
      ) : (
        <div className="space-y-8">
          {runs.map(([runId, pages]) => {
            const runDate = new Date(pages[0].scanned_at).toLocaleString('en-US', {
              timeZone: 'America/Los_Angeles', dateStyle: 'full', timeStyle: 'short',
            });
            const runErrors = pages.reduce((n, p) => n + p.error_count, 0);
            const runWarnings = pages.reduce((n, p) => n + p.warning_count, 0);
            const runClean = pages.filter((p) => p.error_count === 0 && p.warning_count === 0 && p.page_path !== '/_site_wide').length;
            const pageCount = pages.filter((p) => p.page_path !== '/_site_wide').length;
            const siteWide = pages.find((p) => p.page_path === '/_site_wide');
            const pagesWithIssues = pages.filter((p) => (p.error_count > 0 || p.warning_count > 0) && p.page_path !== '/_site_wide');

            return (
              <div key={runId} className="rounded-2xl border border-gray-800 overflow-hidden">
                {/* Run header */}
                <div className="flex items-center justify-between bg-gray-900 px-5 py-3">
                  <div>
                    <p className="text-sm font-bold text-white">{runDate}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">Run: {runId}</p>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className={`text-lg font-extrabold ${runErrors > 0 ? 'text-red-400' : 'text-green-400'}`}>{runErrors}</p>
                      <p className="text-xs text-gray-500">errors</p>
                    </div>
                    <div>
                      <p className={`text-lg font-extrabold ${runWarnings > 0 ? 'text-yellow-400' : 'text-green-400'}`}>{runWarnings}</p>
                      <p className="text-xs text-gray-500">warnings</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-green-400">{runClean}</p>
                      <p className="text-xs text-gray-500">clean</p>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-gray-400">{pageCount}</p>
                      <p className="text-xs text-gray-500">pages</p>
                    </div>
                  </div>
                </div>

                {/* Site-wide duplicate issues */}
                {siteWide && siteWide.issues.length > 0 && (
                  <div className="border-b border-gray-800 px-5 py-3 bg-gray-950">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Site-Wide Issues</p>
                    <div className="space-y-1">
                      {siteWide.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${severityStyle[issue.severity] ?? severityStyle.info}`}>
                            {issue.severity}
                          </span>
                          <p className="text-xs text-gray-300">{issue.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pages with issues */}
                {pagesWithIssues.length === 0 ? (
                  <div className="px-5 py-6 text-center text-gray-500 text-sm">
                    ✅ All {pageCount} pages passed with no errors or warnings this run.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-left">
                        <th className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase">Page</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Issues</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Title</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">H1</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Can.</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">OG</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">LD</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">ms</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {pagesWithIssues.map((page) => (
                        <>
                          <tr key={page.id} className="hover:bg-gray-900/40">
                            <td className="px-5 py-2 font-mono text-xs text-gray-300 max-w-[200px] truncate">{page.page_path}</td>
                            <td className="px-4 py-2">
                              <div className="flex gap-1">
                                {page.error_count > 0 && (
                                  <span className="rounded-full bg-red-900 px-2 py-0.5 text-xs font-bold text-red-300">{page.error_count}E</span>
                                )}
                                {page.warning_count > 0 && (
                                  <span className="rounded-full bg-yellow-900 px-2 py-0.5 text-xs font-bold text-yellow-300">{page.warning_count}W</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-400 max-w-[180px]">
                              <span className={page.title ? 'text-gray-300' : 'text-red-400'}>
                                {page.title ? `${page.title.slice(0, 30)}${page.title.length > 30 ? '…' : ''} (${page.title_length})` : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center text-xs">
                              <span className={(page.h1_count ?? 0) === 1 ? 'text-green-400' : 'text-red-400'}>
                                {page.h1_count ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center text-xs">
                              {page.has_canonical
                                ? <span className={page.canonical_matches ? 'text-green-400' : 'text-yellow-400'}>✓</span>
                                : <span className="text-red-400">✗</span>}
                            </td>
                            <td className="px-4 py-2 text-center text-xs">
                              <span className={(page.og_title && page.og_description && page.og_image) ? 'text-green-400' : 'text-yellow-400'}>
                                {[page.og_title, page.og_description, page.og_image].filter(Boolean).length}/3
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center text-xs">
                              <span className={page.has_json_ld ? 'text-green-400' : 'text-yellow-400'}>
                                {page.has_json_ld ? '✓' : '✗'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-500">
                              <span className={(page.response_time_ms ?? 0) > 3000 ? 'text-red-400' : 'text-gray-400'}>
                                {page.response_time_ms ?? '—'}
                              </span>
                            </td>
                          </tr>
                          {/* Issue details row */}
                          <tr key={`${page.id}-issues`} className="border-b border-gray-800 bg-gray-950">
                            <td colSpan={8} className="px-5 pb-3 pt-1">
                              <div className="space-y-1">
                                {(page.issues as SeoIssue[]).map((issue, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase ${severityStyle[issue.severity] ?? severityStyle.info}`}>
                                      {issue.severity}
                                    </span>
                                    <span className="text-xs text-gray-400">[{issue.code}]</span>
                                    <p className="text-xs text-gray-300">{issue.message}</p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        </>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Clean pages summary */}
                {runClean > 0 && pagesWithIssues.length > 0 && (
                  <div className="px-5 py-2 text-xs text-gray-500 border-t border-gray-800">
                    + {runClean} page{runClean !== 1 ? 's' : ''} with no issues (hidden)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
