import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface Violation {
  id: string;
  impact: string | null;
  description: string;
  helpUrl: string;
  nodes: number;
}

export interface CureResult {
  fixed: number;
  skipped: number;
  summary: string[];
}

const PROJECT_ROOT = path.resolve(process.cwd());
const SKIP_IDS = new Set(['scan-error']);

export async function cureViolations(
  records: Array<{ page_path: string; violations: unknown; violation_count: number }>
): Promise<CureResult> {
  const realViolations = records
    .filter((r) => r.violation_count !== 0)
    .map((r) => ({
      page_path: r.page_path,
      violations: ((r.violations ?? []) as Violation[]).filter(
        (v) => !SKIP_IDS.has(v.id) && !v.description.includes('ERR_REQUIRE_ESM')
      ),
    }))
    .filter((r) => r.violations.length > 0);

  if (realViolations.length === 0) {
    return {
      fixed: 0,
      skipped: 0,
      summary: ['No actionable violations — all issues are scanner errors.'],
    };
  }

  const violationText = realViolations
    .map((r) =>
      `Page: ${r.page_path}\n` +
      r.violations
        .map((v) => `  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes} element${v.nodes !== 1 ? 's' : ''})`)
        .join('\n')
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
    return { fixed: 0, skipped: 0, summary: ['AI response could not be parsed.'] };
  }

  const summary: string[] = [];
  let fixed = 0;

  for (const fix of parsed.fixes ?? []) {
    try {
      const filePath = path.join(PROJECT_ROOT, fix.file);
      if (!filePath.startsWith(PROJECT_ROOT)) continue;
      if (!fs.existsSync(filePath)) continue;
      fs.writeFileSync(filePath, fix.patch, 'utf8');
      summary.push(`${fix.file}: ${fix.description}`);
      fixed++;
    } catch {
      // skip unwritable files
    }
  }

  for (const reason of parsed.skipped ?? []) {
    summary.push(`Skipped: ${reason}`);
  }

  if (fixed > 0) {
    try {
      execSync('git add -A', { cwd: PROJECT_ROOT });
      execSync(`git commit -m "fix: auto-cure ADA/WCAG violations (${fixed} fix${fixed !== 1 ? 'es' : ''})"`, { cwd: PROJECT_ROOT });
      execSync('git push', { cwd: PROJECT_ROOT });
    } catch {
      // commit failure is non-fatal
    }
  }

  return { fixed, skipped: parsed.skipped?.length ?? 0, summary };
}
