#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';

const PRODUCTION = /(^|\.)(sovereign\.defrag\.app|app\.defrag\.app|defrag\.app)$|\.workers\.dev$|\.workers\.cloud$/i;
export function validateCanaryTarget(raw) {
  if (!raw) throw new Error('An explicit --canary-target is required.');
  const url = new URL(raw);
  if (url.protocol !== 'https:' || PRODUCTION.test(url.hostname) || !/(canary|isolated|localhost)/i.test(url.hostname)) throw new Error('Refusing non-isolated or production target.');
  return url;
}

export async function run({ target, allowAi = false, artifact = 'artifacts/launch-saturation-result.json' }) {
  const base = validateCanaryTarget(target);
  const stages = [1, 5, 10, 25];
  const results = [];
  for (const concurrency of stages) {
    const started = Date.now();
    const responses = await Promise.all(Array.from({ length: concurrency }, () => fetch(new URL('/healthz', base), { redirect: 'manual' }).catch(() => undefined)));
    const elapsed = Date.now() - started;
    const errors = responses.filter((response) => !response?.ok).length;
    results.push({ concurrency, requests: responses.length, errors, elapsedMs: elapsed });
    if (errors / responses.length > 0.02 || elapsed > 5_000 || responses.some((response) => response?.status === 503)) break;
  }
  const report = { target: base.origin, generatedAt: new Date().toISOString(), aiTraffic: allowAi, sideEffects: { billing: false, email: false, entitlements: false, customers: false }, results };
  await writeFile(artifact, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (process.argv.includes('--self-test')) {
  for (const target of ['https://sovereign.defrag.app', 'https://app.defrag.app', 'https://defrag.app', 'https://sovv-web.workers.dev']) {
    try { validateCanaryTarget(target); throw new Error(`unsafe target accepted: ${target}`); } catch (error) { if (!String(error).includes('Refusing')) throw error; }
  }
  console.log('saturation production-refusal self-test passed');
} else {
  const value = (flag) => { const index = process.argv.indexOf(flag); return index < 0 ? undefined : process.argv[index + 1]; };
  const ai = process.argv.includes('--allow-ai-generation');
  if (ai && !process.argv.includes('--confirm-billed-ai-canary')) throw new Error('AI traffic requires --confirm-billed-ai-canary.');
  const artifact = value('--artifact');
  await run({ target: value('--canary-target'), allowAi: ai, ...(artifact ? { artifact } : {}) });
}
