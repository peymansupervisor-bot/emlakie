import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { getAllSlugs } from '@/lib/blog';
import { getAllCitySlugs } from '@/lib/city-content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';
const ADMIN_EMAIL = 'peymansupervisor@gmail.com';

const STATIC_PAGES = [
  '/',
  '/rentals',
  '/contact',
  '/how-it-works',
  '/landlords',
  '/support',
  '/cities',
  '/rent-check',
  '/rent-estimate',
  '/app',
  '/blog',
  '/rentals/furnished',
  '/rentals/pet-friendly',
  '/rentals/section-8',
  '/rentals/short-term',
  '/rentals/state/california',
];

function buildPageList(): string[] {
  const blogPages = getAllSlugs().map((slug) => `/blog/${slug}`);
  const cityPages = getAllCitySlugs().map((slug) => `/rentals/city/${slug}`);
  return [...STATIC_PAGES, ...cityPages, ...blogPages];
}

export interface SeoIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface SeoPageResult {
  path: string;
  url: string;
  title: string | null;
  titleLength: number;
  description: string | null;
  descriptionLength: number;
  hasCanonical: boolean;
  canonicalUrl: string | null;
  canonicalMatches: boolean;
  ogTitle: boolean;
  ogDescription: boolean;
  ogImage: boolean;
  h1Count: number;
  hasNoindex: boolean;
  hasJsonLd: boolean;
  jsonLdTypes: string[];
  responseTimeMs: number;
  issues: SeoIssue[];
  errorCount: number;
  warningCount: number;
  error?: string;
}

function extractMeta(html: string, name: string): string | null {
  const m =
    html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'));
  return m ? m[1].trim() : null;
}

function extractOgProp(html: string, prop: string): string | null {
  const m =
    html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'));
  return m ? m[1].trim() : null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function extractCanonical(html: string): string | null {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
            html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return m ? m[1].trim() : null;
}

function countH1(html: string): number {
  return (html.match(/<h1[\s>]/gi) ?? []).length;
}

function hasNoindex(html: string): boolean {
  return /<meta[^>]+content=["'][^"']*noindex[^"']*["']/i.test(html);
}

function extractJsonLdTypes(html: string): string[] {
  const types: string[] = [];
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const graphs = data['@graph'] ?? [data];
      for (const node of graphs) {
        if (node['@type']) types.push(String(node['@type']));
      }
    } catch {
      types.push('invalid-json');
    }
  }
  return types;
}

async function auditPage(path: string): Promise<SeoPageResult> {
  const url = `${SITE_URL}${path}`;
  const t0 = Date.now();
  const res = await fetch(url, {
    headers: { 'User-Agent': 'EMLAKIE-SEO-Auditor/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  const responseTimeMs = Date.now() - t0;

  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const html = await res.text();

  const title = extractTitle(html);
  const titleLength = title?.length ?? 0;
  const description = extractMeta(html, 'description');
  const descriptionLength = description?.length ?? 0;
  const canonicalUrl = extractCanonical(html);
  const hasCanonical = canonicalUrl !== null;
  const expectedCanonical = `${SITE_URL}${path}`;
  const canonicalMatches = canonicalUrl !== null && (canonicalUrl === expectedCanonical || canonicalUrl === expectedCanonical + '/');
  const ogTitle = extractOgProp(html, 'title') !== null;
  const ogDescription = extractOgProp(html, 'description') !== null;
  const ogImage = extractOgProp(html, 'image') !== null;
  const h1Count = countH1(html);
  const noindex = hasNoindex(html);
  const jsonLdTypes = extractJsonLdTypes(html);
  const hasJsonLd = jsonLdTypes.length > 0;

  const issues: SeoIssue[] = [];

  // Critical errors
  if (!title) {
    issues.push({ code: 'missing-title', severity: 'error', message: 'Page is missing a <title> tag' });
  } else if (titleLength < 10) {
    issues.push({ code: 'title-too-short', severity: 'warning', message: `Title is only ${titleLength} chars (min recommended: 10)` });
  } else if (titleLength > 60) {
    issues.push({ code: 'title-too-long', severity: 'warning', message: `Title is ${titleLength} chars (max recommended: 60) — may be truncated in SERPs` });
  }

  if (!description) {
    issues.push({ code: 'missing-description', severity: 'error', message: 'Page is missing a meta description' });
  } else if (descriptionLength < 70) {
    issues.push({ code: 'description-too-short', severity: 'warning', message: `Meta description is only ${descriptionLength} chars (min recommended: 70)` });
  } else if (descriptionLength > 160) {
    issues.push({ code: 'description-too-long', severity: 'warning', message: `Meta description is ${descriptionLength} chars (max recommended: 160) — may be truncated` });
  }

  if (!hasCanonical) {
    issues.push({ code: 'missing-canonical', severity: 'error', message: 'Page is missing a canonical URL tag' });
  } else if (!canonicalMatches) {
    issues.push({ code: 'canonical-mismatch', severity: 'warning', message: `Canonical "${canonicalUrl}" does not match expected "${expectedCanonical}"` });
  }

  if (h1Count === 0) {
    issues.push({ code: 'missing-h1', severity: 'error', message: 'Page has no H1 heading — required for SEO' });
  } else if (h1Count > 1) {
    issues.push({ code: 'multiple-h1', severity: 'warning', message: `Page has ${h1Count} H1 headings — only one is recommended` });
  }

  if (noindex) {
    issues.push({ code: 'noindex-public-page', severity: 'error', message: 'Public page has a noindex directive — it will be excluded from search engines' });
  }

  // Warnings
  if (!ogTitle) issues.push({ code: 'missing-og-title', severity: 'warning', message: 'Missing og:title (Open Graph) — affects social sharing previews' });
  if (!ogDescription) issues.push({ code: 'missing-og-description', severity: 'warning', message: 'Missing og:description (Open Graph)' });
  if (!ogImage) issues.push({ code: 'missing-og-image', severity: 'warning', message: 'Missing og:image (Open Graph) — social shares will have no preview image' });
  if (!hasJsonLd) issues.push({ code: 'missing-json-ld', severity: 'warning', message: 'No JSON-LD structured data found — structured data improves rich results in Google' });
  if (jsonLdTypes.includes('invalid-json')) issues.push({ code: 'invalid-json-ld', severity: 'error', message: 'JSON-LD structured data contains invalid JSON' });
  if (responseTimeMs > 3000) issues.push({ code: 'slow-response', severity: 'warning', message: `Page responded in ${responseTimeMs}ms — Google recommends under 3s` });

  return {
    path,
    url,
    title,
    titleLength,
    description,
    descriptionLength,
    hasCanonical,
    canonicalUrl,
    canonicalMatches,
    ogTitle,
    ogDescription,
    ogImage,
    h1Count,
    hasNoindex: noindex,
    hasJsonLd,
    jsonLdTypes,
    responseTimeMs,
    issues,
    errorCount: issues.filter((i) => i.severity === 'error').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
  };
}

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function sendAlertEmail(newIssues: SeoPageResult[], totalErrors: number) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const rows = newIssues.flatMap(({ path, issues }) =>
    issues.filter((i) => i.severity === 'error' || i.severity === 'warning').map((i) => `
      <tr>
        <td style="padding:8px 12px;color:#374151;font-size:13px;">${path}</td>
        <td style="padding:8px 12px;">
          <span style="background:${i.severity === 'error' ? '#fee2e2' : '#fef3c7'};
            color:${i.severity === 'error' ? '#991b1b' : '#92400e'};
            padding:2px 7px;border-radius:99px;font-size:11px;font-weight:700;text-transform:uppercase;">
            ${i.severity}
          </span>
        </td>
        <td style="padding:8px 12px;color:#374151;font-size:13px;">${i.message}</td>
        <td style="padding:8px 12px;font-size:12px;color:#6b7280;">${i.code}</td>
      </tr>
    `)
  ).join('');

  const resend = new Resend(key);
  await resend.emails.send({
    from: 'EMLAKIE SEO Monitor <alerts@emlakie.com>',
    to: ADMIN_EMAIL,
    subject: `🔍 SEO issues detected — ${totalErrors} errors — EMLAKIE`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;padding:32px 16px;">
        <p style="font-size:22px;font-weight:900;color:#16a34a;margin:0 0 8px">EMLAKIE</p>
        <h1 style="font-size:18px;font-weight:800;color:#111;margin:0 0 4px">SEO Audit Alert</h1>
        <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
          Automated SEO audit completed ${new Date().toUTCString()}.
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Page</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Severity</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Issue</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Code</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">
          View full SEO audit at
          <a href="https://emlakie.com/135265826/seo" style="color:#16a34a;">emlakie.com/135265826/seo</a>
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
  const pagesToAudit = buildPageList();
  const database = sb();
  const results: SeoPageResult[] = [];

  for (const path of pagesToAudit) {
    try {
      const result = await auditPage(path);
      results.push(result);

      await database.from('seo_audit_log').insert({
        run_id: runId,
        page_path: path,
        page_url: result.url,
        title: result.title,
        title_length: result.titleLength,
        description: result.description,
        description_length: result.descriptionLength,
        has_canonical: result.hasCanonical,
        canonical_url: result.canonicalUrl,
        canonical_matches: result.canonicalMatches,
        og_title: result.ogTitle,
        og_description: result.ogDescription,
        og_image: result.ogImage,
        h1_count: result.h1Count,
        has_noindex: result.hasNoindex,
        has_json_ld: result.hasJsonLd,
        json_ld_types: result.jsonLdTypes,
        response_time_ms: result.responseTimeMs,
        issues: result.issues,
        issue_count: result.issues.length,
        error_count: result.errorCount,
        warning_count: result.warningCount,
        scanned_at: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const errResult: SeoPageResult = {
        path,
        url: `${SITE_URL}${path}`,
        title: null,
        titleLength: 0,
        description: null,
        descriptionLength: 0,
        hasCanonical: false,
        canonicalUrl: null,
        canonicalMatches: false,
        ogTitle: false,
        ogDescription: false,
        ogImage: false,
        h1Count: 0,
        hasNoindex: false,
        hasJsonLd: false,
        jsonLdTypes: [],
        responseTimeMs: 0,
        issues: [{ code: 'scan-error', severity: 'error', message: String(err) }],
        errorCount: 1,
        warningCount: 0,
        error: String(err),
      };
      results.push(errResult);

      await database.from('seo_audit_log').insert({
        run_id: runId,
        page_path: path,
        page_url: `${SITE_URL}${path}`,
        issues: errResult.issues,
        issue_count: 1,
        error_count: 1,
        warning_count: 0,
        scanned_at: new Date().toISOString(),
      });
    }
  }

  // Check for duplicate titles and descriptions (site-wide issue)
  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();
  for (const r of results) {
    if (r.title) {
      const pages = titleMap.get(r.title) ?? [];
      pages.push(r.path);
      titleMap.set(r.title, pages);
    }
    if (r.description) {
      const pages = descMap.get(r.description) ?? [];
      pages.push(r.path);
      descMap.set(r.description, pages);
    }
  }

  // Store duplicate warnings as a separate summary record
  const dupIssues: SeoIssue[] = [];
  for (const [title, pages] of Array.from(titleMap.entries())) {
    if (pages.length > 1) {
      dupIssues.push({ code: 'duplicate-title', severity: 'warning', message: `Duplicate title "${title.slice(0, 60)}…" used on ${pages.length} pages: ${pages.join(', ')}` });
    }
  }
  for (const [desc, pages] of Array.from(descMap.entries())) {
    if (pages.length > 1) {
      dupIssues.push({ code: 'duplicate-description', severity: 'warning', message: `Duplicate meta description used on ${pages.length} pages: ${pages.join(', ')}` });
    }
  }

  if (dupIssues.length > 0) {
    await database.from('seo_audit_log').insert({
      run_id: runId,
      page_path: '/_site_wide',
      page_url: SITE_URL,
      issues: dupIssues,
      issue_count: dupIssues.length,
      error_count: 0,
      warning_count: dupIssues.length,
      scanned_at: new Date().toISOString(),
    });
  }

  // Record run in system_health
  const totalErrors = results.reduce((n, r) => n + r.errorCount, 0);
  const totalWarnings = results.reduce((n, r) => n + r.warningCount, 0);
  const scanErrors = results.filter((r) => r.error).length;

  await database.from('system_health').insert({
    service: 'SEO Audit',
    status: totalErrors > 0 || scanErrors > 0 ? 'degraded' : 'ok',
    message: `Run ${runId} — ${pagesToAudit.length} pages — ${totalErrors} errors, ${totalWarnings} warnings`,
  });

  // Email alert only for new issues (compare against previous run)
  const withIssues = results.filter((r) => r.issues.length > 0 && !r.error);
  if (totalErrors > 0 || totalWarnings > 0) {
    const { data: prevRows } = await database
      .from('seo_audit_log')
      .select('page_path, issues')
      .neq('run_id', runId)
      .gt('issue_count', 0)
      .order('scanned_at', { ascending: false })
      .limit(pagesToAudit.length + 1);

    const prevKeys = new Set<string>();
    for (const row of prevRows ?? []) {
      for (const issue of (row.issues ?? []) as SeoIssue[]) {
        prevKeys.add(`${row.page_path}:${issue.code}`);
      }
    }

    const newIssues = withIssues
      .map((r) => ({ ...r, issues: r.issues.filter((i) => !prevKeys.has(`${r.path}:${i.code}`)) }))
      .filter((r) => r.issues.length > 0);

    const newErrors = newIssues.reduce((n, r) => n + r.errorCount, 0);
    if (newIssues.length > 0) {
      await sendAlertEmail(newIssues, newErrors);
    }
  }

  return NextResponse.json({
    run_id: runId,
    pages: results.length,
    total_errors: totalErrors,
    total_warnings: totalWarnings,
    duplicate_issues: dupIssues.length,
    scan_errors: scanErrors,
  });
}
