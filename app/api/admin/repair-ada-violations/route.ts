import { NextRequest, NextResponse } from 'next/server';
import { getModeratorSession } from '@/lib/moderator';
import { adminClient } from '@/lib/moderator';
import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(process.cwd());

// Violations that are scanner errors, not real a11y issues
const SKIP_IDS = new Set(['scan-error', 'ERR_REQUIRE_ESM']);

interface Violation {
  id: string;
  impact: string | null;
  description: string;
  helpUrl: string;
  nodes: number;
}

interface AuditRecord {
  page_path: string;
  violations: Violation[];
  violation_count: number;
}

export async function POST(req: NextRequest) {
  const session = await getModeratorSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = adminClient();

  // Get the latest run's violations
  const { data: latestRecord } = await sb
    .from('ada_audit_log')
    .select('run_id')
    .order('scanned_at', { ascending: false })
    .limit(1)
    .single();

  if (!latestRecord) {
    return NextResponse.json({ error: 'No audit runs found' }, { status: 404 });
  }

  const { data: records } = await sb
    .from('ada_audit_log')
    .select('page_path, violations, violation_count')
    .eq('run_id', latestRecord.run_id);

  const realViolations: AuditRecord[] = (records ?? [])
    .filter((r) => r.violation_count > 0)
    .map((r) => ({
      ...r,
      violations: ((r.violations ?? []) as Violation[]).filter(
        (v) => !SKIP_IDS.has(v.id) && !v.description.includes('ERR_REQUIRE_ESM')
      ),
    }))
    .filter((r) => r.violations.length > 0);

  if (realViolations.length === 0) {
    return NextResponse.json({
      fixed: 0,
      skipped: 0,
      summary: ['No actionable violations found. All issues may be scanner errors (ERR_REQUIRE_ESM).'],
    });
  }

  // Build violation summary for Claude
  const violationText = realViolations
    .map((r) =>
      `Page: ${r.page_path}\n` +
      r.violations.map((v) => `  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes} element${v.nodes !== 1 ? 's' : ''})`).join('\n')
    )
    .join('\n\n');

  const client = new Anthropic();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: `You are an accessibility engineer fixing WCAG 2.1 AA violations in a Next.js 14 project.
The project uses TypeScript, Tailwind CSS, and App Router.
Project root: ${PROJECT_ROOT}
You must read the relevant source files and produce specific, minimal fixes.
Return a JSON object: { "fixes": [{ "file": "relative/path", "description": "what was fixed", "patch": "the exact new file content" }], "skipped": ["reason for skipping if any"] }
Only return the JSON object, nothing else.`,
    messages: [
      {
        role: 'user',
        content: `The following WCAG violations were found. Read the relevant source files and fix them.\n\n${violationText}\n\nFor each violation, find the responsible source file under app/ or components/, read it, and return the fixed content. Focus on the most impactful fixes (missing alt text, aria-labels, role attributes, color contrast issues). Skip violations that require design changes or cannot be fixed in source code alone.`,
      },
    ],
  });

  let parsed: { fixes: Array<{ file: string; description: string; patch: string }>; skipped: string[] };
  try {
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
  }

  const summary: string[] = [];
  let fixed = 0;

  for (const fix of parsed.fixes ?? []) {
    try {
      const filePath = path.join(PROJECT_ROOT, fix.file);
      if (!filePath.startsWith(PROJECT_ROOT)) continue; // safety check
      if (!fs.existsSync(filePath)) continue;

      fs.writeFileSync(filePath, fix.patch, 'utf8');
      summary.push(`${fix.file}: ${fix.description}`);
      fixed++;
    } catch {
      // skip files that can't be written
    }
  }

  for (const reason of parsed.skipped ?? []) {
    summary.push(`Skipped: ${reason}`);
  }

  // Commit if any files were changed
  if (fixed > 0) {
    try {
      execSync('git add -A', { cwd: PROJECT_ROOT });
      execSync(`git commit -m "fix: auto-repair ADA/WCAG violations (${fixed} fix${fixed !== 1 ? 'es' : ''})"`, {
        cwd: PROJECT_ROOT,
      });
      execSync('git push', { cwd: PROJECT_ROOT });
    } catch {
      // commit failure is non-fatal; changes are still on disk
    }
  }

  return NextResponse.json({ fixed, skipped: parsed.skipped?.length ?? 0, summary });
}
