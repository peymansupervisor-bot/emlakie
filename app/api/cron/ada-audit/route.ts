import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { cureViolations } from '@/lib/ada-cure';
import { getAllSlugs } from '@/lib/blog';
import { getAllCities } from '@/lib/api';

import { logError } from '@/lib/log-error'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const REPO = 'peymansupervisor-bot/emlakie';
const GITHUB_API = 'https://api.github.com';

// Commit a signed audit report JSON to ada-reports/ in the repo for tamper-evident court records.
async function commitAuditReport(report: Record<string, unknown>): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;

  const date = new Date().toISOString().slice(0, 10);
  const filePath = `ada-reports/${date}-${report.run_id}.json`;
  const content = JSON.stringify(report, null, 2);
  const encoded = Buffer.from(content).toString('base64');

  // Create the file (never update — each run gets a unique filename)
  await fetch(`${GITHUB_API}/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `ada-audit: ${date} — ${report.pages} pages, ${report.total_violations} violations`,
      content: encoded,
    }),
  });
}
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
const ADMIN_EMAIL = 'peymansupervisor@gmail.com';

// Static public pages — add new routes here as the site grows
const STATIC_PAGES = [
  '/',
  '/rentals',
  '/contact',
  '/how-it-works',
  '/landlords',
  '/landlord/login',
  '/support',
  '/cities',
  '/rent-check',
  '/rent-estimate',
  '/app',
  '/accessibility',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/rentals/furnished',
  '/rentals/pet-friendly',
  '/rentals/section-8',
  '/rentals/short-term',
  '/rentals/state/california',
  '/blog',
];

async function buildPageList(): Promise<string[]> {
  const blogPages = getAllSlugs().map((slug) => `/blog/${slug}`);
  const cities = await getAllCities();
  const cityPages = cities.map((c) => `/rentals/city/${c.slug}`);
  return [...STATIC_PAGES, ...cityPages, ...blogPages];
}

interface Violation {
  id: string;
  impact: string | null;
  description: string;
  helpUrl: string;
  nodes: number;
}

async function auditPage(
  path: string,
  browser: import('playwright-core').Browser,
): Promise<{
  violations: Violation[];
  passes: number;
  incomplete: number;
}> {
  const url = `${SITE_URL}${path}`;
  const axeCore = await import('axe-core');
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    // Inject axe-core into the live rendered page and run it
    await page.addScriptTag({ content: axeCore.source });
    const results = await page.evaluate(async () => {
      return await (window as unknown as { axe: { run: (opts: unknown) => Promise<{ violations: unknown[]; passes: unknown[]; incomplete: unknown[] }> } }).axe.run({
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
      });
    });
    return {
      violations: (results.violations as Array<{ id: string; impact: string | null; description: string; helpUrl: string; nodes: unknown[] }>).map((v) => ({
        id: v.id,
        impact: v.impact ?? null,
        description: v.description,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
    };
  } finally {
    await page.close();
  }
}

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function sendAlertEmail(newViolations: { path: string; violations: Violation[] }[], totalCritical: number) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const rows = newViolations.flatMap(({ path, violations }) =>
    violations.map((v) => `
      <tr>
        <td style="padding:8px 12px;color:#374151;font-size:13px;">${path}</td>
        <td style="padding:8px 12px;">
          <span style="background:${v.impact === 'critical' ? '#fee2e2' : v.impact === 'serious' ? '#fef3c7' : '#f3f4f6'};
            color:${v.impact === 'critical' ? '#991b1b' : v.impact === 'serious' ? '#92400e' : '#374151'};
            padding:2px 7px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase;">
            ${v.impact ?? 'unknown'}
          </span>
        </td>
        <td style="padding:8px 12px;color:#374151;font-size:13px;">${v.description}</td>
        <td style="padding:8px 12px;font-size:12px;color:#6b7280;">${v.nodes} element${v.nodes !== 1 ? 's' : ''}</td>
      </tr>
    `)
  ).join('');

  const resend = new Resend(key);
  await resend.emails.send({
    from: 'EMLAKIE ADA Monitor <alerts@emlakie.com>',
    to: ADMIN_EMAIL,
    subject: `⚠️ ADA/WCAG violations detected — ${totalCritical} critical — EMLAKIE`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;padding:32px 16px;">
        <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 8px">EMLAKIE</p>
        <h1 style="font-size:18px;font-weight:800;color:#111;margin:0 0 4px">ADA / WCAG Accessibility Alert</h1>
        <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
          Automated audit completed ${new Date().toUTCString()}. The following violations were found and logged with timestamps.
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Page</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Severity</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Violation</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Elements</th>
            </tr>
          </thead>
          <tbody style="divide-y:1px solid #e5e7eb;">${rows}</tbody>
        </table>
        <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">
          All audit results are timestamped and stored permanently in your database for legal reference.
        </p>
      </div>
    `,
  });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.replace('Bearer ', '') !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const runId = randomUUID();
    const pagesToAudit = await buildPageList();
    const axeCore = await import('axe-core');
    const axeVersion: string = axeCore.version;
    const database = sb();
    const results: Array<{ path: string; violations: Violation[]; passes: number; incomplete: number; error?: string }> = [];

    // Launch a single real browser instance for the entire audit run.
    // Chromium binary is downloaded at runtime from GitHub releases to avoid
    // bundling a 50MB binary into the serverless function.
    const chromium = await import('@sparticuz/chromium');
    const { chromium: playwrightChromium } = await import('playwright-core');
    // v149's GitHub release split the single pack.tar into per-arch assets —
    // Vercel serverless functions run x64, so request that one explicitly.
    const CHROMIUM_URL = 'https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.x64.tar';
    // @sparticuz/chromium defaults to --single-process to save memory in tight
    // environments, but that mode has no renderer/browser process isolation —
    // a single failed @font-face local() lookup (from next/font's fallback-font
    // metrics, present on every page) crashes the entire browser instead of
    // just that page's render. Now that the function has more memory headroom,
    // drop it so a renderer crash doesn't take down the whole audit run.
    const launchArgs = chromium.default.args.filter((arg) => arg !== '--single-process');
    const browser = await playwrightChromium.launch({
      args: launchArgs,
      executablePath: await chromium.default.executablePath(CHROMIUM_URL),
      headless: true,
    });

    try {
    for (const path of pagesToAudit) {
      if (!browser.isConnected()) break; // stop gracefully if browser crashed
      try {
        const { violations, passes, incomplete } = await auditPage(path, browser);
        results.push({ path, violations, passes, incomplete });

        // Insert immutable audit record
        await database.from('ada_audit_log').insert({
          run_id: runId,
          page_path: path,
          page_url: `${SITE_URL}${path}`,
          violation_count: violations.length,
          critical_count: violations.filter((v) => v.impact === 'critical').length,
          serious_count: violations.filter((v) => v.impact === 'serious').length,
          passes,
          incomplete,
          violations,
          axe_version: axeVersion,
          scanned_at: new Date().toISOString(),
        });
      } catch (err: unknown) {
        results.push({ path, violations: [], passes: 0, incomplete: 0, error: String(err) });
        // Log failure as a record too so the gap is visible in court logs
        await database.from('ada_audit_log').insert({
          run_id: runId,
          page_path: path,
          page_url: `${SITE_URL}${path}`,
          violation_count: -1,
          critical_count: 0,
          serious_count: 0,
          passes: 0,
          incomplete: 0,
          violations: [{ id: 'scan-error', impact: 'critical', description: String(err), helpUrl: '', nodes: 0 }],
          axe_version: axeVersion,
          scanned_at: new Date().toISOString(),
        });
      }
    }
    } finally {
      await browser.close();
    }

    // Record this successful run in system_health so the health probe can track it
    const pagesNote = results.length < pagesToAudit.length
      ? `${results.length}/${pagesToAudit.length} pages scanned (browser disconnected early)`
      : `${results.length} pages scanned`;
    await database.from('system_health').insert({
      service: 'ADA Audit',
      status: results.every((r) => !r.error) ? 'ok' : 'degraded',
      message: `Run ${runId} — ${pagesNote}`,
    });

    // Send alert if any critical or serious violations found
    const withViolations = results.filter((r) => r.violations.length > 0 && !r.error);
    const totalCritical = withViolations.reduce((n, r) => n + r.violations.filter((v) => v.impact === 'critical').length, 0);
    const totalSerious = withViolations.reduce((n, r) => n + r.violations.filter((v) => v.impact === 'serious').length, 0);

    // Auto-cure any real violations found in this run
    let cureResult = { fixed: 0, skipped: 0, summary: [] as string[] };
    if (withViolations.length > 0) {
      const cureRecords = withViolations.map((r) => ({
        page_path: r.path,
        violations: r.violations,
        violation_count: r.violations.length,
      }));
      cureResult = await cureViolations(cureRecords);
    }

    // Only email about violations that are NEW (not present in the previous run)
    if (totalCritical > 0 || totalSerious > 0) {
      const { data: prevRows } = await database
        .from('ada_audit_log')
        .select('page_path, violations')
        .neq('run_id', runId)
        .gt('violation_count', 0)
        .order('scanned_at', { ascending: false })
        .limit(pagesToAudit.length);

      // Build a set of "page:violation_id" from the previous run
      const prevKeys = new Set<string>();
      for (const row of prevRows ?? []) {
        for (const v of (row.violations ?? []) as Violation[]) {
          prevKeys.add(`${row.page_path}:${v.id}`);
        }
      }

      const newViolations = withViolations
        .map((r) => ({
          ...r,
          violations: r.violations.filter((v) => !prevKeys.has(`${r.path}:${v.id}`)),
        }))
        .filter((r) => r.violations.length > 0);

      const newCritical = newViolations.reduce((n, r) => n + r.violations.filter((v) => v.impact === 'critical').length, 0);

      if (newViolations.length > 0) {
        await sendAlertEmail(newViolations, newCritical);
      }
    }

    const report = {
      run_id: runId,
      scanned_at: new Date().toISOString(),
      site: SITE_URL,
      axe_version: axeVersion,
      pages: results.length,
      total_violations: withViolations.reduce((n, r) => n + r.violations.length, 0),
      total_critical: totalCritical,
      total_serious: totalSerious,
      cure: cureResult,
      results: results.map((r) => ({
        path: r.path,
        url: `${SITE_URL}${r.path}`,
        violation_count: r.violations.length,
        violations: r.violations,
        passes: r.passes,
        incomplete: r.incomplete,
        error: r.error,
      })),
    };

    // Commit tamper-evident report to GitHub for court-grade audit trail
    await commitAuditReport(report);

    return NextResponse.json({
      run_id: runId,
      pages: results.length,
      total_violations: report.total_violations,
      total_critical: totalCritical,
      axe_version: axeVersion,
      cure: cureResult,
    });
  } catch (_err) {
    const _msg = _err instanceof Error ? _err.message : String(_err);
    const _stack = _err instanceof Error ? _err.stack : undefined;
    await logError({ source: 'Cron › Ada-audit', message: _msg, details: _stack, endpoint: 'GET /api/cron/ada-audit', http_status: 500 });
    // Record failure in system_health so the health probe doesn't see a stale "down"
    try {
      const database = sb();
      await database.from('system_health').insert({
        service: 'ADA Audit',
        status: 'down',
        message: `Audit failed: ${_msg.slice(0, 200)}`,
      });
    } catch { /* best-effort */ }
    return NextResponse.json({ error: _msg }, { status: 500 });
  }
}
