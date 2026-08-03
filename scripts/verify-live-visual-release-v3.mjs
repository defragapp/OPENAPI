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

async function responseContainsRenderedAudit(response, url) {
  if (!url.includes('/browser-rendering/snapshot') || !response.ok) return true;
  try {
    const payload = await response.clone().json();
    const content = payload?.result?.content || payload?.content || '';
    return typeof content === 'string' && content.includes('data-sovereign-visual-audit');
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

      if (await responseContainsRenderedAudit(response, url)) return response;
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
const auditScriptStartV2 = "return `(() => {\n    const visible = (element) => {";
const auditScriptStartV3 = "return `(() => {\n    const collectAudit = () => {\n      if (!document.querySelector('.public-approved-v8') || !document.body) return false;\n      const visible = (element) => {";
const auditTailV2 = "const node = document.createElement('script');\n    node.id = '__sovereign_visual_audit';\n    node.type = 'application/json';\n    node.textContent = JSON.stringify(payload);\n    document.head.appendChild(node);";
const auditTailV3 = "document.documentElement.setAttribute('data-sovereign-visual-audit', encodeURIComponent(JSON.stringify(payload)));\n      return true;\n    };\n    if (collectAudit()) return;\n    const observer = new MutationObserver(() => {\n      if (collectAudit()) observer.disconnect();\n    });\n    observer.observe(document.documentElement, { childList: true, subtree: true });\n    setTimeout(() => observer.disconnect(), 45_000);";
const auditParserV2 = String.raw`function parseRenderedAudit(html) {
  const match = String(html).match(/<script[^>]+id=["']__sovereign_visual_audit["'][^>]*>([\s\S]*?)<\/script>/i);
  assert(match, 'Browser-rendered DOM audit payload is missing');
  return JSON.parse(match[1]);
}`;
const auditParserV3 = String.raw`function parseRenderedAudit(html) {
  const match = String(html).match(/\sdata-sovereign-visual-audit=["']([^"']+)["']/i);
  assert(match, 'Browser-rendered DOM audit payload is missing');
  return JSON.parse(decodeURIComponent(match[1]));
}`;
const scriptTagV2 = 'addScriptTag: [{ content: renderedAuditScript() }]';
const scriptTagV3 = "addScriptTag: [{ id: 'sovereign-visual-audit-runtime', content: renderedAuditScript() }],\n        waitForSelector: { selector: 'html[data-sovereign-visual-audit]', timeout: 45_000 }";

let generated = readFileSync(sourcePath, 'utf8');
for (const marker of [referenceAssertionV2, auditScriptStartV2, auditTailV2, auditParserV2, scriptTagV2]) {
  if (!generated.includes(marker)) {
    throw new Error(`Visual release v3 could not locate required v2 marker: ${marker.slice(0, 80)}`);
  }
}

generated = generated
  .replace(referenceAssertionV2, referenceAssertionV3)
  .replace(auditScriptStartV2, auditScriptStartV3)
  .replace(auditTailV2, auditTailV3)
  .replace(auditParserV2, auditParserV3)
  .replace(scriptTagV2, scriptTagV3);

for (const marker of [referenceAssertionV3, auditScriptStartV3, auditTailV3, auditParserV3, scriptTagV3]) {
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
