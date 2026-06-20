import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
const ADMIN_EMAIL = 'peymansupervisor@gmail.com';

// Pages to audit on every run
const PAGES_TO_AUDIT = [
  '/',
  '/rentals',
  '/landlord/login',
  '/contact',
  '/accessibility',
  '/how-it-works',
  '/landlords',
];

interface Violation {
  id: string;
  impact: string | null;
  description: string;
  helpUrl: string;
  nodes: number;
}

async function auditPage(path: string): Promise<{
  violations: Violation[];
  passes: number;
  incomplete: number;
}> {
  const url = `${SITE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EMLAKIE-ADA-Auditor/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const html = await res.text();

  const dom = new JSDOM(html, {
    url,
    runScripts: 'outside-only',
    resources: 'usable',
  });

  // Inject axe-core into the JSDOM window
  const axeSource = require('axe-core').source;
  dom.window.eval(axeSource);

  const results: axe.AxeResults = await (dom.window as unknown as { axe: typeof axe }).axe.run(
    dom.window.document,
    {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
    }
  );

  const violations: Violation[] = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? null,
    description: v.description,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
  }));

  return {
    violations,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
  };
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
        <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
          View full audit history at
          <a href="https://emlakie.com/135265826/ada" style="color:#16a34a;">emlakie.com/135265826/ada</a>
        </p>
        <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">
          All audit results are timestamped and stored permanently in your database for legal reference.
        </p>
      </div>
    `,
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.replace('Bearer ', '') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const runId = randomUUID();
  const axeVersion: string = require('axe-core').version;
  const database = sb();
  const results: Array<{ path: string; violations: Violation[]; passes: number; incomplete: number; error?: string }> = [];

  for (const path of PAGES_TO_AUDIT) {
    try {
      const { violations, passes, incomplete } = await auditPage(path);
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

  // Record this successful run in system_health so the health probe can track it
  await database.from('system_health').insert({
    service: 'ADA Audit',
    status: results.every((r) => !r.error) ? 'ok' : 'degraded',
    message: `Run ${runId} — ${PAGES_TO_AUDIT.length} pages scanned`,
  });

  // Send alert if any critical or serious violations found
  const withViolations = results.filter((r) => r.violations.length > 0 && !r.error);
  const totalCritical = withViolations.reduce((n, r) => n + r.violations.filter((v) => v.impact === 'critical').length, 0);
  const totalSerious = withViolations.reduce((n, r) => n + r.violations.filter((v) => v.impact === 'serious').length, 0);

  if (totalCritical > 0 || totalSerious > 0) {
    await sendAlertEmail(withViolations, totalCritical);
  }

  return NextResponse.json({
    run_id: runId,
    pages: results.length,
    total_violations: withViolations.reduce((n, r) => n + r.violations.length, 0),
    total_critical: totalCritical,
    axe_version: axeVersion,
  });
}
