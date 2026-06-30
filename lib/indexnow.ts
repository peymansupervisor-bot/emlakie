import { logError } from './log-error';

// IndexNow instantly notifies participating search engines (Bing, Yandex,
// Seznam, Naver) when a URL is added or changed, so new listings get crawled
// in minutes instead of waiting for the next sitemap fetch.
//
// NOTE: Google does NOT consume IndexNow. Google discovery still relies on the
// sitemap (lastmod) + internal links. This is purely a Bing/Yandex accelerator.
//
// The key below is also hosted publicly at /<KEY>.txt for ownership
// verification — both must match. See public/749fce6c9cb217232de8e0573ed0ffa3.txt
const INDEXNOW_KEY = '749fce6c9cb217232de8e0573ed0ffa3';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emlakie.com';

/**
 * Submit one or more URLs (absolute, or site-root-relative paths) to IndexNow.
 * Fire-and-forget: never throws, logs failures to system_error_log.
 */
export async function submitToIndexNow(pathsOrUrls: string[]): Promise<void> {
  try {
    const urlList = Array.from(
      new Set(
        pathsOrUrls
          .filter(Boolean)
          .map((p) => (p.startsWith('http') ? p : `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`)),
      ),
    );
    if (urlList.length === 0) return;

    const host = new URL(SITE_URL).host;
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(15000),
    });

    // 200 and 202 are both success; anything else is worth recording.
    if (res.status !== 200 && res.status !== 202) {
      await logError({
        source: 'IndexNow',
        message: `IndexNow returned HTTP ${res.status}`,
        endpoint: 'submitToIndexNow',
        context: { urlCount: urlList.length, sample: urlList[0] },
      });
    }
  } catch (err) {
    await logError({
      source: 'IndexNow',
      message: err instanceof Error ? err.message : String(err),
      endpoint: 'submitToIndexNow',
    });
  }
}
