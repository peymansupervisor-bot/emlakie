import Anthropic from '@anthropic-ai/sdk';

export interface SeoCureResult {
  fixed: number;
  skipped: number;
  summary: string[];
}

const REPO = 'peymansupervisor-bot/emlakie';
const GITHUB_API = 'https://api.github.com';

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

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'read_file',
    description: 'Read a source file from the repository to understand the current metadata before making fixes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'File path relative to repo root, e.g. app/contact/page.tsx or app/layout.tsx' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write the fixed content back to a source file to resolve SEO issues. Always read the file first.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'File path relative to repo root' },
        content: { type: 'string', description: 'The complete new file content with SEO fixes applied' },
        description: { type: 'string', description: 'One-line description of what was fixed, e.g. "Added meta description to /contact page"' },
      },
      required: ['path', 'content', 'description'],
    },
  },
];

export async function cureSeoIssues(
  records: Array<{ page_path: string; issues: unknown; issue_count: number }>
): Promise<SeoCureResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { fixed: 0, skipped: 0, summary: ['GITHUB_TOKEN not set — cannot commit fixes.'] };

  interface SeoIssue { code: string; severity: string; message: string }

  const UNFIXABLE = new Set(['slow-response', 'duplicate-title', 'duplicate-description', 'scan-error']);

  const actionable = records
    .filter((r) => r.issue_count > 0 && r.page_path !== '/_site_wide')
    .map((r) => ({
      page_path: r.page_path,
      issues: ((r.issues ?? []) as SeoIssue[]).filter(
        (i) => (i.severity === 'error' || i.severity === 'warning') && !UNFIXABLE.has(i.code)
      ),
    }))
    .filter((r) => r.issues.length > 0)
    // Errors first, then warnings; cap at 10 pages per run to avoid API overload
    .sort((a, b) => {
      const aHasError = a.issues.some((i) => i.severity === 'error') ? 0 : 1;
      const bHasError = b.issues.some((i) => i.severity === 'error') ? 0 : 1;
      return aHasError - bHasError;
    })
    .slice(0, 10);

  if (actionable.length === 0) {
    return { fixed: 0, skipped: 0, summary: ['No actionable SEO issues found.'] };
  }

  const client = new Anthropic();
  const fileCache: Record<string, { content: string; sha: string }> = {};
  const summary: string[] = [];
  let fixed = 0;
  let skipped = 0;

  // Process in small batches to avoid Anthropic API overload
  const BATCH_SIZE = 2;
  for (let batchStart = 0; batchStart < actionable.length; batchStart += BATCH_SIZE) {
    const batch = actionable.slice(batchStart, batchStart + BATCH_SIZE);
    const batchIssueText = batch
      .map((r) =>
        `Page: ${r.page_path}\n` +
        r.issues.map((i) => `  - [${i.severity}] ${i.code}: ${i.message}`).join('\n')
      )
      .join('\n\n');

    const batchResult = await runCureBatch(client, fileCache, token, batchIssueText);
    fixed += batchResult.fixed;
    skipped += batchResult.skipped;
    summary.push(...batchResult.summary);

    // Pause between batches to avoid Anthropic rate limits
    if (batchStart + BATCH_SIZE < actionable.length) {
      await new Promise((r) => setTimeout(r, 8000));
    }
  }

  return { fixed, skipped, summary };
}

async function createMessageWithRetry(
  client: Anthropic,
  params: Parameters<Anthropic['messages']['create']>[0],
  retries = 4
): Promise<Anthropic.Message> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await client.messages.create(params) as Anthropic.Message;
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status;
      if ((status === 529 || status === 503) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 8000; // 8s, 16s, 32s, 64s
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw new Error('Max retries exceeded');
}

async function runCureBatch(
  client: Anthropic,
  fileCache: Record<string, { content: string; sha: string }>,
  token: string,
  issueText: string,
): Promise<SeoCureResult> {
  const summary: string[] = [];
  let fixed = 0;
  let skipped = 0;

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: `You are fixing SEO issues in a Next.js 14 / TypeScript project (EMLAKIE — a rental listing platform, brand color #16a34a green).

File mapping rules:
- Page /contact → app/contact/page.tsx
- Page / → app/page.tsx
- Page /blog/[slug] → app/blog/[slug]/page.tsx
- Page /rentals/city/[slug] → app/rentals/city/[slug]/page.tsx
- Shared metadata base → app/layout.tsx

For each issue, read the source file, then fix it minimally:
- missing-title: add/fix the export const metadata title field
- missing-description: add a compelling 120-150 char meta description
- missing-canonical: add alternates.canonical to the metadata export
- missing-og-title / missing-og-description / missing-og-image: add the openGraph fields
- missing-h1: ensure the page JSX has exactly one <h1> element
- missing-json-ld: add a minimal WebPage JSON-LD script tag
- title-too-long: shorten the title to under 60 chars while keeping it descriptive
- title-too-short: expand the title to be more descriptive (10-60 chars)
- description-too-long: trim to under 160 chars
- description-too-short: expand to at least 70 chars
- canonical-mismatch: correct the canonical URL to match the actual page path
- multiple-h1: reduce to a single h1

Keep all existing functionality. Do not change layout, styling, or non-metadata code.
The site URL is https://emlakie.com.

SEO issues to fix:\n\n${issueText}`,
    },
  ];

  for (let turn = 0; turn < 20; turn++) {
    const response = await createMessageWithRetry(client, {
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
        const ok = await ghPut(path, content, cached.sha, `fix(seo): ${description}`, token);
        if (ok) {
          fixed++;
          summary.push(`✓ ${path}: ${description}`);
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
