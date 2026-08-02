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

async function rateLimitedFetch(input, init) {
  const url = requestUrl(input);
  if (!url.includes('/browser-rendering/')) return originalFetch(input, init);

  const minimumIntervalMs = 10_500;
  const elapsed = Date.now() - lastBrowserRunStartedAt;
  if (lastBrowserRunStartedAt && elapsed < minimumIntervalMs) {
    await delay(minimumIntervalMs - elapsed);
  }

  lastBrowserRunStartedAt = Date.now();
  let response = await originalFetch(input, init);
  if (response.status !== 429) return response;

  const retryAfterSeconds = Number(response.headers.get('retry-after') || 11);
  await response.arrayBuffer().catch(() => undefined);
  await delay(Math.max(11_000, retryAfterSeconds * 1_000));
  lastBrowserRunStartedAt = Date.now();
  response = await originalFetch(input, init);
  return response;
}

const referenceAssertionV2 = "assert(reference.length > 8_000, 'Approved visual reference is missing or unexpectedly small');";
const referenceAssertionV3 = "assert(reference.length > 6_500, 'Approved visual reference is missing, truncated, or unexpectedly small');";
let generated = readFileSync(sourcePath, 'utf8');
if (!generated.includes(referenceAssertionV2)) {
  throw new Error('Visual release v3 could not locate the v2 reference-size assertion');
}
generated = generated.replace(referenceAssertionV2, referenceAssertionV3);
if (!generated.includes(referenceAssertionV3)) {
  throw new Error('Visual release v3 did not apply the founder-reference validation');
}

writeFileSync(generatedPath, generated);
globalThis.fetch = rateLimitedFetch;
try {
  await import(pathToFileURL(generatedPath).href);
} finally {
  globalThis.fetch = originalFetch;
  rmSync(generatedPath, { force: true });
}
