/**
 * Automatically instruments all Next.js App Router route handlers with
 * try-catch + logError so every 500 appears in the Diagnostics page.
 *
 * Safe to re-run — skips files already instrumented or that import logError.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const API_DIR = path.join(ROOT, 'app', 'api');

const LOG_IMPORT = `import { logError } from '@/lib/log-error'`;
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// Derive a human-readable source label from the file path
function sourceLabel(filePath) {
  const rel = path.relative(API_DIR, filePath).replace('/route.ts', '');
  return rel
    .replace(/\[.*?\]/g, ':id')   // [id] → :id
    .replace(/\//g, ' › ')        // slashes → arrows
    .replace(/(?:^|\s)\w/g, c => c.toUpperCase()); // Title Case
}

// Find the closing brace of the function body starting at `openPos`
function findClosingBrace(src, openPos) {
  let depth = 0;
  for (let i = openPos; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function instrumentFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf-8');

  // Already instrumented
  if (src.includes('logError')) return { skipped: true };

  const source = sourceLabel(filePath);
  let modified = false;

  // Add import after the last existing import line
  if (!src.includes("from '@/lib/log-error'")) {
    const lastImportIdx = [...src.matchAll(/^import\s.+?['"].+?['"]\s*;?\s*$/gm)]
      .reduce((max, m) => Math.max(max, m.index + m[0].length), -1);
    if (lastImportIdx > -1) {
      src = src.slice(0, lastImportIdx) + '\n' + LOG_IMPORT + src.slice(lastImportIdx);
    } else {
      src = LOG_IMPORT + '\n' + src;
    }
  }

  // Wrap each exported HTTP method handler
  for (const method of HTTP_METHODS) {
    // Match: export async function METHOD( ... ) {
    const pattern = new RegExp(`(export\\s+async\\s+function\\s+${method}\\s*\\([^)]*(?:\\([^)]*\\)[^)]*)?\\)\\s*(?::\\s*[^{]+?)?)\\{`, 'g');
    let match;
    while ((match = pattern.exec(src)) !== null) {
      const funcHeader = match[1];
      const openBrace = match.index + match[0].length - 1;
      const closeBrace = findClosingBrace(src, openBrace);
      if (closeBrace === -1) continue;

      const innerBody = src.slice(openBrace + 1, closeBrace);

      // Skip if already has try-catch wrapping the whole body
      const trimmed = innerBody.trimStart();
      if (trimmed.startsWith('try {') || trimmed.startsWith('try{')) continue;

      // Indent the existing body by 2 extra spaces
      const indented = innerBody
        .split('\n')
        .map(line => (line.trim() ? '  ' + line : line))
        .join('\n');

      // Extract method and path for endpoint label
      const endpointPath = path.relative(API_DIR, filePath).replace('/route.ts', '');
      const endpoint = `${method} /api/${endpointPath}`;

      const newBody = `\n  try {${indented}  } catch (_err) {\n    const _msg = _err instanceof Error ? _err.message : String(_err);\n    const _stack = _err instanceof Error ? _err.stack : undefined;\n    await logError({ source: '${source}', message: _msg, details: _stack, endpoint: '${endpoint}', http_status: 500 });\n    return NextResponse.json({ error: _msg }, { status: 500 });\n  }\n`;

      src = src.slice(0, openBrace + 1) + newBody + src.slice(closeBrace);

      // Adjust pattern index after replacement
      pattern.lastIndex = openBrace + newBody.length + 1;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, src, 'utf-8');
    return { skipped: false, source };
  }
  return { skipped: true };
}

// Find all route.ts files
function findRoutes(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findRoutes(full));
    else if (entry.name === 'route.ts') results.push(full);
  }
  return results;
}

const routes = findRoutes(API_DIR);
let instrumented = 0, skipped = 0, errors = 0;

for (const route of routes) {
  try {
    const result = instrumentFile(route);
    if (result.skipped) {
      skipped++;
    } else {
      console.log(`✓ instrumented: ${result.source}`);
      instrumented++;
    }
  } catch (e) {
    console.error(`✗ error: ${route}\n  ${e.message}`);
    errors++;
  }
}

console.log(`\nDone. ${instrumented} instrumented, ${skipped} skipped, ${errors} errors.`);
