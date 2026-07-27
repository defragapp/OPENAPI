const commitSha = String(process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA || '').trim();

if (!/^[0-9a-f]{40}$/i.test(commitSha)) {
  throw new Error('A full 40-character commit SHA is required for parent-domain verification');
}

const redirectChecks = [
  ['https://defrag.app/', 'https://sovereign.defrag.app/'],
  ['https://www.defrag.app/', 'https://sovereign.defrag.app/'],
  ['https://defrag.app/app', 'https://app.defrag.app/app'],
  ['https://www.defrag.app/login', 'https://app.defrag.app/login']
];

const healthChecks = [
  'https://defrag.app/health',
  'https://www.defrag.app/health'
];

function normalizeLocation(value, source) {
  if (!value) return '';
  return new URL(value, source).toString();
}

async function verifyOnce() {
  for (const [source, expected] of redirectChecks) {
    const response = await fetch(source, {
      redirect: 'manual',
      signal: AbortSignal.timeout(12_000)
    });
    if (response.status !== 308) {
      throw new Error(`${source} returned ${response.status}; expected 308`);
    }
    const location = normalizeLocation(response.headers.get('location'), source);
    if (location !== expected) {
      throw new Error(`${source} redirected to ${location || 'nothing'}; expected ${expected}`);
    }
  }

  for (const source of healthChecks) {
    const response = await fetch(source, {
      redirect: 'manual',
      signal: AbortSignal.timeout(12_000)
    });
    const text = await response.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`${source} returned invalid JSON: ${text.slice(0, 300)}`);
    }
    if (!response.ok || payload?.ok !== true || payload?.version !== commitSha) {
      throw new Error(`${source} is not serving ${commitSha}: status=${response.status} body=${text.slice(0, 500)}`);
    }
  }
}

let lastError;
for (let attempt = 1; attempt <= 24; attempt += 1) {
  try {
    await verifyOnce();
    console.log(JSON.stringify({
      parentDomainsVerified: true,
      version: commitSha,
      redirects: redirectChecks.map(([source, destination]) => ({ source, destination })),
      health: healthChecks
    }, null, 2));
    process.exit(0);
  } catch (error) {
    lastError = error;
    if (attempt < 24) await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}

throw new Error(`Parent-domain verification did not converge: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
