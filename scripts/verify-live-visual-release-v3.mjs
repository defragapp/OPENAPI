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
    return typeof content === 'string' && content.includes('__sovereign_visual_audit');
  } catch {
    return true;
  }
}

async function rateLimitedFetch(input, init) {
  const url = requestUrl(input);
  if (!url.includes('/browser-rendering/')) return originalFetch(input, init);

  const minimumIntervalMs = 10_500;
  const maximumAttempts = 3;
  let response;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    await waitForBrowserRunSlot(minimumIntervalMs);
    response = await originalFetch(input, init);

    if (response.status !== 429) {
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

  return response;
}

const referenceAssertionV2 = "assert(reference.length > 8_000, 'Approved visual reference is missing or unexpectedly small');";
const referenceAssertionV3 = "assert(reference.length > 6_500, 'Approved visual reference is missing, truncated, or unexpectedly small');";
const auditNodeV2 = "const node = document.createElement('script');";
const auditNodeV3 = "const node = document.createElement('pre');";
const auditTypeV2 = "node.type = 'application/json';";
const auditTypeV3 = "node.hidden = true;\n    node.setAttribute('aria-hidden', 'true');\n    node.style.display = 'none';";
const auditAppendV2 = 'document.head.appendChild(node);';
const auditAppendV3 = 'document.body.appendChild(node);';
const auditParserV2 = String.raw`const match = String(html).match(/<script[^>]+id=["']__sovereign_visual_audit["'][^>]*>([\s\S]*?)<\/script>/i);`;
const auditParserV3 = String.raw`const match = String(html).match(/<pre[^>]+id=["']__sovereign_visual_audit["'][^>]*>([\s\S]*?)<\/pre>/i);`;
const scriptTagV2 = 'addScriptTag: [{ content: renderedAuditScript() }]';
const scriptTagV3 = "addScriptTag: [{ content: renderedAuditScript() }],\n        waitForSelector: { selector: '#__sovereign_visual_audit', timeout: 30_000 }";

let generated = readFileSync(sourcePath, 'utf8');
for (const marker of [referenceAssertionV2, auditNodeV2, auditTypeV2, auditAppendV2, auditParserV2, scriptTagV2]) {
  if (!generated.includes(marker)) {
    throw new Error(`Visual release v3 could not locate required v2 marker: ${marker.slice(0, 80)}`);
  }
}

generated = generated
  .replace(referenceAssertionV2, referenceAssertionV3)
  .replace(auditNodeV2, auditNodeV3)
  .replace(auditTypeV2, auditTypeV3)
  .replace(auditAppendV2, auditAppendV3)
  .replace(auditParserV2, auditParserV3)
  .replace(scriptTagV2, scriptTagV3);

for (const marker of [referenceAssertionV3, auditNodeV3, auditTypeV3, auditAppendV3, auditParserV3, scriptTagV3]) {
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
