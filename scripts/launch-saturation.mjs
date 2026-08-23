import assert from 'node:assert/strict';

const PRODUCTION_HOSTS = new Set([
  'app.defrag.app',
  'sovereign.defrag.app',
  'defrag.app',
  'www.defrag.app',
  'sovv-web.sovereign-os-api.workers.dev'
]);
const PUBLIC_PATHS = ['/', '/how-it-works', '/pricing', '/faq', '/health', '/ready'];
const AUTHENTICATED_READ_PATHS = [
  '/api/v1/auth/session',
  '/api/v1/billing/entitlements',
  '/api/v1/threads',
  '/api/v1/you'
];
const PROFILE_NAMES = new Set(['public', 'authenticated-read', 'message-boundary', 'ai-standard']);

function integer(env, name, fallback, minimum, maximum) {
  const raw = env[name]?.trim();
  const value = raw ? Number(raw) : fallback;
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be a whole number from ${minimum} through ${maximum}`);
  }
  return value;
}

function number(env, name, fallback, minimum, maximum) {
  const raw = env[name]?.trim();
  const value = raw ? Number(raw) : fallback;
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be a number from ${minimum} through ${maximum}`);
  }
  return value;
}

function canonicalOrigin(value, name) {
  if (!value?.trim()) throw new Error(`${name} is required`);
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`${name} must not include credentials, a query, or a fragment`);
  }
  if (url.pathname !== '/' && url.pathname !== '') {
    throw new Error(`${name} must be an origin without a path`);
  }
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error(`${name} must use HTTPS outside localhost`);
  }
  return url.origin;
}

function loadConfig(env) {
  const origin = canonicalOrigin(env.SATURATION_TARGET_ORIGIN, 'SATURATION_TARGET_ORIGIN');
  const approvedOrigin = canonicalOrigin(env.SATURATION_APPROVED_CANARY_ORIGIN, 'SATURATION_APPROVED_CANARY_ORIGIN');
  if (origin !== approvedOrigin) throw new Error('Canary target does not match SATURATION_APPROVED_CANARY_ORIGIN');

  const target = new URL(origin);
  if (PRODUCTION_HOSTS.has(target.hostname) || target.hostname.endsWith('.defrag.app')) {
    throw new Error('Refusing to run saturation traffic against a production or branded domain');
  }

  const profile = env.SATURATION_PROFILE?.trim() || 'public';
  if (!PROFILE_NAMES.has(profile)) throw new Error(`Unsupported SATURATION_PROFILE: ${profile}`);

  const requests = integer(env, 'SATURATION_REQUESTS', 30, 1, 600);
  const concurrency = integer(env, 'SATURATION_CONCURRENCY', 5, 1, 25);
  const timeoutMs = integer(env, 'SATURATION_TIMEOUT_MS', profile === 'ai-standard' ? 30_000 : 10_000, 1_000, 60_000);
  const maxP95Ms = integer(env, 'SATURATION_MAX_P95_MS', profile === 'ai-standard' ? 20_000 : 3_000, 100, 60_000);
  const max5xxRate = number(env, 'SATURATION_MAX_5XX_RATE', 0.01, 0, 1);

  const accessClientId = env.CF_ACCESS_CLIENT_ID?.trim();
  const accessClientSecret = env.CF_ACCESS_CLIENT_SECRET?.trim();
  if (Boolean(accessClientId) !== Boolean(accessClientSecret)) {
    throw new Error('CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET are required together');
  }

  const sessionCookie = env.SATURATION_SESSION_COOKIE?.trim();
  if (['authenticated-read', 'ai-standard'].includes(profile) && !sessionCookie) {
    throw new Error(`SATURATION_SESSION_COOKIE is required for ${profile}`);
  }
  if (sessionCookie && !sessionCookie.startsWith('__Host-sovereign_session=')) {
    throw new Error('SATURATION_SESSION_COOKIE must be the Sovereign session cookie pair');
  }

  const threadId = env.SATURATION_THREAD_ID?.trim();
  if (['message-boundary', 'ai-standard'].includes(profile) && !threadId) {
    throw new Error(`SATURATION_THREAD_ID is required for ${profile}`);
  }
  if (threadId && !/^[A-Za-z0-9._:-]{1,160}$/.test(threadId)) {
    throw new Error('SATURATION_THREAD_ID contains unsupported characters');
  }

  if (profile === 'ai-standard') {
    if (env.SATURATION_ENABLE_BILLED_AI !== 'true') {
      throw new Error('SATURATION_ENABLE_BILLED_AI=true is required for billed AI traffic');
    }
    if (requests > 60 || concurrency > 5) {
      throw new Error('A single billed-AI canary run is capped at 60 requests and concurrency 5');
    }
  }

  return {
    origin,
    targetHost: target.hostname,
    profile,
    requests,
    concurrency,
    timeoutMs,
    maxP95Ms,
    max5xxRate,
    accessClientId,
    accessClientSecret,
    sessionCookie,
    threadId
  };
}

function percentile(values, quantile) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1)];
}

function stageConcurrency(maximum) {
  return [...new Set([1, Math.max(1, Math.ceil(maximum / 3)), maximum])].sort((a, b) => a - b);
}

function stageRequestCounts(total, stages) {
  const base = Math.floor(total / stages.length);
  const remainder = total % stages.length;
  return stages.map((_, index) => base + (index < remainder ? 1 : 0)).filter(Boolean);
}

function requestSpec(config, index) {
  if (config.profile === 'public') {
    return { method: 'GET', path: PUBLIC_PATHS[index % PUBLIC_PATHS.length], expected: [200] };
  }
  if (config.profile === 'authenticated-read') {
    return { method: 'GET', path: AUTHENTICATED_READ_PATHS[index % AUTHENTICATED_READ_PATHS.length], expected: [200] };
  }

  const path = `/api/v1/threads/${encodeURIComponent(config.threadId)}/messages`;
  if (config.profile === 'message-boundary') {
    return {
      method: 'POST',
      path,
      expected: [413],
      body: JSON.stringify({ message: 'x'.repeat(12_001), context: { surface: 'Today' } })
    };
  }

  return {
    method: 'POST',
    path,
    expected: [200, 429],
    body: JSON.stringify({
      message: 'Synthetic launch canary. Reply with one short sentence confirming controlled availability.',
      context: { surface: 'Today' }
    })
  };
}

function requestHeaders(config, hasBody) {
  return {
    ...(config.accessClientId && config.accessClientSecret ? {
      'CF-Access-Client-Id': config.accessClientId,
      'CF-Access-Client-Secret': config.accessClientSecret
    } : {}),
    ...(config.sessionCookie ? { cookie: config.sessionCookie } : {}),
    origin: config.origin,
    accept: 'application/json',
    ...(hasBody ? { 'content-type': 'application/json' } : {}),
    'x-idempotency-key': crypto.randomUUID()
  };
}

async function discardBody(response, maximumBytes = 1_048_576) {
  if (!response.body) return 0;
  const reader = response.body.getReader();
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) return bytes;
    bytes += value.byteLength;
    if (bytes > maximumBytes) {
      await reader.cancel('saturation_response_limit').catch(() => undefined);
      throw new Error('response exceeded the 1 MiB canary ceiling');
    }
  }
}

async function executeOne(config, index) {
  const spec = requestSpec(config, index);
  const started = performance.now();
  try {
    const response = await fetch(new URL(spec.path, config.origin), {
      method: spec.method,
      headers: requestHeaders(config, Boolean(spec.body)),
      ...(spec.body ? { body: spec.body } : {}),
      signal: AbortSignal.timeout(config.timeoutMs)
    });
    const responseBytes = await discardBody(response);
    return {
      durationMs: performance.now() - started,
      status: response.status,
      responseBytes,
      expected: spec.expected.includes(response.status),
      error: null
    };
  } catch (error) {
    return {
      durationMs: performance.now() - started,
      status: 0,
      responseBytes: 0,
      expected: false,
      error: error instanceof Error ? error.name : 'unknown'
    };
  }
}

async function executeStage(config, concurrency, count, offset) {
  const results = new Array(count);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, count) }, async () => {
    while (true) {
      const localIndex = cursor++;
      if (localIndex >= count) return;
      results[localIndex] = await executeOne(config, offset + localIndex);
    }
  });
  await Promise.all(workers);
  return results;
}

function summarize(results, config, concurrency) {
  const durations = results.map((result) => result.durationMs);
  const statuses = {};
  for (const result of results) {
    const key = result.status ? String(result.status) : 'network_error';
    statuses[key] = (statuses[key] || 0) + 1;
  }
  const networkErrors = results.filter((result) => result.status === 0).length;
  const fiveXx = results.filter((result) => result.status >= 500).length;
  const unexpected = results.filter((result) => !result.expected).length;
  const report = {
    concurrency,
    requests: results.length,
    statuses,
    latencyMs: {
      p50: Math.round(percentile(durations, 0.50)),
      p95: Math.round(percentile(durations, 0.95)),
      p99: Math.round(percentile(durations, 0.99)),
      max: Math.round(Math.max(...durations))
    },
    responseBytes: results.reduce((total, result) => total + result.responseBytes, 0),
    networkErrorRate: networkErrors / results.length,
    fiveXxRate: fiveXx / results.length,
    unexpectedStatusRate: unexpected / results.length
  };
  return {
    ...report,
    passed: report.networkErrorRate === 0
      && report.unexpectedStatusRate === 0
      && report.fiveXxRate <= config.max5xxRate
      && report.latencyMs.p95 <= config.maxP95Ms
  };
}

async function run(config) {
  const stages = stageConcurrency(config.concurrency);
  const counts = stageRequestCounts(config.requests, stages);
  const reports = [];
  let offset = 0;

  for (let index = 0; index < counts.length; index += 1) {
    const concurrency = stages[index];
    const count = counts[index];
    const results = await executeStage(config, concurrency, count, offset);
    offset += count;
    const report = summarize(results, config, concurrency);
    reports.push(report);
    console.log(JSON.stringify({ type: 'sovereign-launch-saturation-stage.v1', ...report }));
    if (!report.passed) break;
  }

  const passed = reports.length === counts.length && reports.every((report) => report.passed);
  console.log(JSON.stringify({
    type: 'sovereign-launch-saturation-result.v1',
    targetHost: config.targetHost,
    profile: config.profile,
    configuredRequests: config.requests,
    completedRequests: reports.reduce((total, report) => total + report.requests, 0),
    maxConcurrency: config.concurrency,
    maxP95Ms: config.maxP95Ms,
    max5xxRate: config.max5xxRate,
    passed,
    stages: reports
  }));
  if (!passed) process.exitCode = 1;
}

function selfTest() {
  const valid = {
    SATURATION_TARGET_ORIGIN: 'https://candidate.example.net',
    SATURATION_APPROVED_CANARY_ORIGIN: 'https://candidate.example.net'
  };
  assert.equal(loadConfig(valid).profile, 'public');
  assert.throws(() => loadConfig({
    ...valid,
    SATURATION_TARGET_ORIGIN: 'https://app.defrag.app',
    SATURATION_APPROVED_CANARY_ORIGIN: 'https://app.defrag.app'
  }), /Refusing/);
  assert.throws(() => loadConfig({
    ...valid,
    SATURATION_APPROVED_CANARY_ORIGIN: 'https://other.example.net'
  }), /does not match/);
  assert.throws(() => loadConfig({ ...valid, SATURATION_CONCURRENCY: '26' }), /SATURATION_CONCURRENCY/);
  assert.throws(() => loadConfig({
    ...valid,
    SATURATION_PROFILE: 'ai-standard',
    SATURATION_SESSION_COOKIE: '__Host-sovereign_session=test',
    SATURATION_THREAD_ID: 'synthetic-thread'
  }), /SATURATION_ENABLE_BILLED_AI/);
  assert.deepEqual(stageConcurrency(10), [1, 4, 10]);
  assert.deepEqual(stageRequestCounts(10, [1, 4, 10]), [4, 3, 3]);
  assert.equal(percentile([1, 2, 3, 4], 0.95), 4);
  const boundary = requestSpec({ ...loadConfig(valid), profile: 'message-boundary', threadId: 'synthetic-thread' }, 0);
  assert.deepEqual(boundary.expected, [413]);
  assert.match(boundary.body, /"message":/);
  console.log('Launch saturation self-test passed production_refusal=true gradual_ramp=true bounded_profiles=true');
}

if (process.argv.includes('--self-test')) {
  selfTest();
} else {
  await run(loadConfig(process.env));
}
