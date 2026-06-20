import Anthropic from '@anthropic-ai/sdk';

export interface CureResult {
  fixed: number;
  skipped: number;
  summary: string[];
}

const REPO = 'peymansupervisor-bot/emlakie';
const GITHUB_API = 'https://api.github.com';

// ─── GitHub API helpers ───────────────────────────────────────────────────────

async function ghGet(filePath: string, token: string): Promise<{ content: string; sha: string } | null> {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${filePath}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.type !== 'file') return null;
  return { content: Buffer.from(data.content, 'base64').toString('utf-8'), sha: data.sha };
}

async function ghPut(filePath: string, content: string, sha: string, message: string, token: string): Promise<boolean> {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, content: Buffer.from(content).toString('base64'), sha }),
  });
  return res.ok;
}

// ─── Tool definitions for Claude ─────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_file',
    description: 'Read a source file from the repository to understand the current code before making fixes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'File path relative to repo root, e.g. app/contact/page.tsx or components/Navbar.tsx' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write the fixed content back to a source file to resolve WCAG violations. Always read the file first.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'File path relative to repo root' },
        content: { type: 'string', description: 'The complete new file content with accessibility fixes applied' },
        description: { type: 'string', description: 'One-line description of what was fixed, e.g. "Added alt text to hero image"' },
      },
      required: ['path', 'content', 'description'],
    },
  },
];

// ─── Main cure function ───────────────────────────────────────────────────────

export async function cureViolations(
  records: Array<{ page_path: string; violations: unknown; violation_count: number }>
): Promise<CureResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { fixed: 0, skipped: 0, summary: ['GITHUB_TOKEN env var not set — cannot commit fixes.'] };

  const realViolations = records
    .filter((r) => r.violation_count > 0)
    .map((r) => ({
      page_path: r.page_path,
      violations: ((r.violations ?? []) as Array<{ id: string; impact: string | null; description: string; nodes: number }>)
        .filter((v) => v.id !== 'scan-error'),
    }))
    .filter((r) => r.violations.length > 0);

  if (realViolations.length === 0) {
    return { fixed: 0, skipped: 0, summary: ['No actionable violations found.'] };
  }

  const violationText = realViolations
    .map((r) =>
      `Page: ${r.page_path}\n` +
      r.violations.map((v) => `  - [${v.impact ?? 'unknown'}] ${v.id}: ${v.description} (${v.nodes} element${v.nodes !== 1 ? 's' : ''})`).join('\n')
    )
    .join('\n\n');

  const client = new Anthropic();
  const fileCache: Record<string, { content: string; sha: string }> = {};
  const summary: string[] = [];
  let fixed = 0;
  let skipped = 0;

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `You are fixing WCAG 2.1 AA violations in a Next.js 14 / TypeScript / Tailwind project.

For each page path like /contact, the source file is at app/contact/page.tsx.
Shared UI lives in components/. Layout in app/layout.tsx.

Steps:
1. Read the source files for the affected pages and relevant components
2. Identify the exact elements causing each violation
3. Write minimal fixes (alt text, aria-label, role, htmlFor/id pairing, etc.)
4. Skip color-contrast violations — those require design review
5. Skip violations in files you cannot identify

WCAG violations to fix:\n\n${violationText}`,
    },
  ];

  // Agentic loop — Claude reads files and writes fixes iteratively
  for (let turn = 0; turn < 20; turn++) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      tools: TOOLS,
      messages,
    });

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') break;
    if (response.stop_reason !== 'tool_use') break;

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      if (block.name === 'read_file') {
        const { path } = block.input as { path: string };
        const file = await ghGet(path, token);
        if (file) fileCache[path] = file;
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: file ? file.content : `File not found: ${path}`,
        });

      } else if (block.name === 'write_file') {
        const { path, content, description } = block.input as { path: string; content: string; description: string };
        const cached = fileCache[path] ?? (await ghGet(path, token));
        if (!cached) {
          skipped++;
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: `Error: ${path} not found in repo` });
          continue;
        }
        const ok = await ghPut(path, content, cached.sha, `fix(ada): ${description}`, token);
        if (ok) {
          fixed++;
          summary.push(`✓ ${path}: ${description}`);
          // Update cache sha so subsequent writes to same file use new sha
          const updated = await ghGet(path, token);
          if (updated) fileCache[path] = updated;
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: `Fixed: ${description}` });
        } else {
          skipped++;
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: `Error: GitHub commit failed for ${path}` });
        }
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  return { fixed, skipped, summary };
}
