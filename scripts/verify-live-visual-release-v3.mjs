const originalFetch = globalThis.fetch.bind(globalThis);
let lastBrowserRunStartedAt = 0;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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

globalThis.fetch = rateLimitedFetch;
await import('./verify-live-visual-release-v2.mjs');
