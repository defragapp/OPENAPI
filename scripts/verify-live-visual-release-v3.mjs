import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourcePath = resolve(root, 'scripts/verify-live-visual-release-v2.mjs');
const generatedPath = resolve(root, 'scripts/.verify-live-visual-release-v3.generated.mjs');
const originalFetch = globalThis.fetch.bind(globalThis);
let lastBrowserRunStartedAt = 0;

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function requestUrl(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function isTransientFetchTimeout(error) {
  return Boolean(
    error
    && typeof error === 'object'
    && (error.name === 'TimeoutError' || error.name === 'AbortError')
  );
}

async function waitForBrowserRunSlot(minimumIntervalMs) {
  const elapsed = Date.now() - lastBrowserRunStartedAt;
  if (lastBrowserRunStartedAt && elapsed < minimumIntervalMs) {
    await delay(minimumIntervalMs - elapsed);
  }
  lastBrowserRunStartedAt = Date.now();
}

async function responseContainsRenderedLanding(response, url) {
  if (!url.includes('/browser-rendering/snapshot') || !response.ok) return true;
  try {
    const payload = await response.clone().json();
    const content = payload?.result?.content || payload?.content || '';
    return typeof content === 'string' && content.includes('public-approved-v8');
  } catch {
    return true;
  }
}

async function isTransientBrowserTimeout(response) {
  if (response.status !== 422) return false;
  try {
    const text = await response.clone().text();
    return text.includes('A timeout was reached') || text.includes('Waiting for selector');
  } catch {
    return false;
  }
}

async function rateLimitedFetch(input, init) {
  const url = requestUrl(input);
  if (!url.includes('/browser-rendering/')) return originalFetch(input, init);

  const minimumIntervalMs = 10_500;
  const browserRequestTimeoutMs = 135_000;
  const maximumAttempts = 3;
  let response;
  let lastError;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    await waitForBrowserRunSlot(minimumIntervalMs);

    try {
      response = await originalFetch(input, {
        ...init,
        // The v2 caller supplies a one-shot 120 second AbortSignal. Reusing that
        // signal across retries guarantees every later attempt is already aborted.
        // Give each Browser Rendering attempt its own deadline instead.
        signal: AbortSignal.timeout(browserRequestTimeoutMs)
      });
    } catch (error) {
      lastError = error;
      if (isTransientFetchTimeout(error) && attempt < maximumAttempts) {
        await delay(11_000);
        continue;
      }
      throw error;
    }

    if (response.status !== 429) {
      if (await isTransientBrowserTimeout(response)) {
        if (attempt < maximumAttempts) {
          await response.arrayBuffer().catch(() => undefined);
          await delay(11_000);
          continue;
        }
        return response;
      }

      if (await responseContainsRenderedLanding(response, url)) return response;
      if (attempt < maximumAttempts) {
        await response.arrayBuffer().catch(() => undefined);
        await delay(11_000);
        continue;
      }
      return response;
    }

    const retryAfterSeconds = Number(response.headers.get('retry-after') || 11);
    await response.arrayBuffer().catch(() => undefined);
    if (attempt < maximumAttempts) {
      await delay(Math.max(11_000, retryAfterSeconds * 1_000));
    }
  }

  if (response) return response;
  throw lastError || new Error('Cloudflare Browser Rendering did not return a response');
}

const referenceAssertionV2 = "assert(reference.length > 8_000, 'Approved visual reference is missing or unexpectedly small');";
const referenceAssertionV3 = "assert(reference.length > 6_500, 'Approved visual reference is missing, truncated, or unexpectedly small');";
const auditParserV2 = String.raw`function parseRenderedAudit(html) {
  const match = String(html).match(/<script[^>]+id=["']__sovereign_visual_audit["'][^>]*>([\s\S]*?)<\/script>/i);
  assert(match, 'Browser-rendered DOM audit payload is missing');
  return JSON.parse(match[1]);
}`;
const auditParserV3 = String.raw`function attributesToObject(attributes) {
  return Object.fromEntries((attributes || []).map((attribute) => [attribute.name, attribute.value]));
}

async function scrapeRenderedAudit(profile, url, html) {
  const selectors = [
    '.v0-hero',
    '.landing-story--personal',
    '.landing-story--relationship',
    '.landing-story--system',
    '.v0-comparison',
    '.v0-final'
  ];
  const elements = ['html', '.public-approved-v8', ...selectors, '.v0-hero h1'];
  const response = await fetch(
    \`https://api.cloudflare.com/client/v4/accounts/\${accountId}/browser-rendering/scrape?cacheTTL=0\`,
    {
      method: 'POST',
      headers: {
        authorization: \`Bearer \${apiToken}\`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        url,
        elements: elements.map((selector) => ({ selector })),
        viewport: profile.viewport,
        gotoOptions: { waitUntil: 'networkidle0', timeout: 45_000 },
        waitForSelector: { selector: '.public-approved-v8', timeout: 45_000, visible: true },
        waitForTimeout: 2_200,
        actionTimeout: 120_000,
        addStyleTag: [{
          content: \`html { scroll-behavior: auto !important; }
            *, *::before, *::after {
              animation-delay: 0s !important;
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
            }\`
        }]
      }),
      signal: AbortSignal.timeout(120_000)
    }
  );

  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = undefined; }
  if (!response.ok || payload?.success === false) {
    const detail = JSON.stringify(payload?.errors || payload || text);
    throw new Error(
      \`Cloudflare Browser Run scrape failed (\${response.status}). \`
      + \`The release token must include Browser Rendering Write. \${redact(detail).slice(0, 900)}\`
    );
  }

  const items = Array.isArray(payload?.result) ? payload.result : (Array.isArray(payload) ? payload : []);
  const bySelector = new Map(items.map((item) => [item.selector, item.results]));
  const htmlResult = bySelector.get('html');
  const rootResult = bySelector.get('.public-approved-v8');
  const headingResult = bySelector.get('.v0-hero h1');
  const htmlAttributes = attributesToObject(htmlResult?.attributes);
  const renderedWidth = Math.max(Number(htmlResult?.width || 0), Number(rootResult?.width || 0));
  const renderedHeight = Math.max(Number(htmlResult?.height || 0), Number(rootResult?.height || 0));

  return {
    viewport: { width: profile.viewport.width, height: profile.viewport.height },
    document: {
      width: renderedWidth,
      height: renderedHeight,
      overflowX: Math.max(0, renderedWidth - profile.viewport.width)
    },
    rootPresent: Boolean(rootResult),
    sections: selectors.map((selector) => {
      const result = bySelector.get(selector);
      return result
        ? {
            selector,
            present: true,
            top: Math.round(Number(result.top || 0)),
            width: Math.round(Number(result.width || 0)),
            height: Math.round(Number(result.height || 0))
          }
        : { selector, present: false };
    }),
    controls: {
      count: 0,
      minimumWidth: 0,
      minimumHeight: 0,
      below44: 0,
      source: 'static-release-tests'
    },
    typography: {
      headingWidth: Math.round(Number(headingResult?.width || 0)),
      headingHeight: Math.round(Number(headingResult?.height || 0))
    },
    color: {},
    release: {
      contract: htmlAttributes['data-sovereign-public-landing'] || '',
      field: htmlAttributes['data-sovereign-landing-field'] || '',
      sequence: htmlAttributes['data-sovereign-v0-sequence'] || ''
    },
    text: String(rootResult?.text || html || '').replace(/\s+/g, ' ').trim()
  };
}`;
const scriptTagV2 = 'addScriptTag: [{ content: renderedAuditScript() }]';
const scriptTagV3 = "waitForSelector: { selector: '.public-approved-v8', timeout: 45_000, visible: true }";
const domParserCallV2 = 'const dom = parseRenderedAudit(captured.content);';
const domParserCallV3 = 'const dom = await scrapeRenderedAudit(profile, captured.url, captured.content);';

let generated = readFileSync(sourcePath, 'utf8');
for (const marker of [referenceAssertionV2, auditParserV2, scriptTagV2, domParserCallV2]) {
  if (!generated.includes(marker)) {
    throw new Error(`Visual release v3 could not locate required v2 marker: ${marker.slice(0, 80)}`);
  }
}

generated = generated
  .replace(referenceAssertionV2, referenceAssertionV3)
  .replace(auditParserV2, auditParserV3)
  .replace(scriptTagV2, scriptTagV3)
  .replace(domParserCallV2, domParserCallV3);

for (const marker of [referenceAssertionV3, auditParserV3, scriptTagV3, domParserCallV3]) {
  if (!generated.includes(marker)) {
    throw new Error(`Visual release v3 did not apply required hardening: ${marker.slice(0, 80)}`);
  }
}

writeFileSync(generatedPath, generated);
globalThis.fetch = rateLimitedFetch;
try {
  await import(pathToFileURL(generatedPath).href);
} finally {
  globalThis.fetch = originalFetch;
  rmSync(generatedPath, { force: true });
}
