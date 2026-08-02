const commitSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || process.env.APP_VERSION || '').trim();
const publicBase = 'https://sovereign.defrag.app';
const appBase = 'https://app.defrag.app';
const workerBase = 'https://sovv-web.sovereign-os-api.workers.dev';
const expectedMigration = '0014_passkey_authentication';
const expectedArchive = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const expectedSequence = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${expectedArchive}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(url, options = {}) {
  return fetch(url, {
    method: options.method || 'GET',
    redirect: options.redirect || 'follow',
    headers: options.headers,
    signal: AbortSignal.timeout(options.timeoutMs || 20_000)
  });
}

async function readJson(url) {
  const response = await request(url);
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = undefined; }
  return { response, text, json };
}

async function readText(url, options) {
  const response = await request(url, options);
  return { response, text: await response.text() };
}

function verifyRuntime(label, result, readyExpected) {
  assert(result.response.ok, `${label} returned ${result.response.status}`);
  assert(result.json?.ok === true, `${label} is not healthy`);
  if (readyExpected) assert(result.json?.ready === true, `${label} is not ready`);
  assert(result.json?.version === commitSha, `${label} version ${result.json?.version || 'missing'} does not match ${commitSha}`);
  assert(result.json?.migrationVersion === expectedMigration, `${label} migration is ${result.json?.migrationVersion || 'missing'}`);
  assert(result.json?.latestMigrationVersion === expectedMigration, `${label} latest migration is ${result.json?.latestMigrationVersion || 'missing'}`);
  assert(result.json?.dependencies?.migrationParity === 'current', `${label} does not enforce migration parity`);
  assert(result.json?.visualRelease?.contract === 'v0-public-landing-v3', `${label} visual contract is stale`);
  assert(result.json?.visualRelease?.field === 'landing-expression-field-v3', `${label} expression field contract is stale`);
  assert(result.json?.visualRelease?.archiveSha256 === expectedArchive, `${label} visual archive checksum is stale`);
  assert(result.json?.visualRelease?.sequenceFingerprint === expectedSequence, `${label} visual sequence is stale`);
  assert(result.json?.visualRelease?.renderedComparisonRequired === true, `${label} does not require rendered comparison`);
}

assert(/^[0-9a-f]{40}$/i.test(commitSha), 'A full deployed commit SHA is required for parent-domain verification');

let runtimeResults;
let lastError;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    const endpoints = [
      ['publicHealth', `${publicBase}/health`, false],
      ['publicReady', `${publicBase}/ready`, true],
      ['appHealth', `${appBase}/health`, false],
      ['appReady', `${appBase}/ready`, true],
      ['workerHealth', `${workerBase}/health`, false],
      ['workerReady', `${workerBase}/ready`, true]
    ];
    const responses = await Promise.all(endpoints.map(([, url]) => readJson(url)));
    runtimeResults = {};
    endpoints.forEach(([label, url, readyExpected], index) => {
      verifyRuntime(label, responses[index], readyExpected);
      runtimeResults[label] = { url, payload: responses[index].json };
    });
    break;
  } catch (error) {
    lastError = error;
    if (attempt === 30) throw new Error(`Runtime metadata did not converge: ${lastError?.message || lastError}`);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000));
  }
}

const [home, parentRoot, wwwRoot, parentApp, wwwLogin] = await Promise.all([
  readText(`${publicBase}/?release=${commitSha}`),
  readText('https://defrag.app/', { redirect: 'manual' }),
  readText('https://www.defrag.app/', { redirect: 'manual' }),
  readText('https://defrag.app/app', { redirect: 'manual' }),
  readText('https://www.defrag.app/login', { redirect: 'manual' })
]);

assert(home.response.ok, `public landing returned ${home.response.status}`);
assert(home.text.includes('id="root"'), 'public landing root is missing');
assert(parentRoot.response.status === 308 && parentRoot.response.headers.get('location') === `${publicBase}/`, 'defrag.app root redirect is incorrect');
assert(wwwRoot.response.status === 308 && wwwRoot.response.headers.get('location') === `${publicBase}/`, 'www.defrag.app root redirect is incorrect');
assert(parentApp.response.status === 308 && parentApp.response.headers.get('location') === `${appBase}/app`, 'defrag.app app redirect is incorrect');
assert(wwwLogin.response.status === 308 && wwwLogin.response.headers.get('location') === `${appBase}/login`, 'www.defrag.app login redirect is incorrect');

const jsPath = home.text.match(/src=["'](\/assets\/[^"']+\.js)["']/)?.[1];
const cssPath = home.text.match(/href=["'](\/assets\/[^"']+\.css)["']/)?.[1];
assert(jsPath, 'public landing JavaScript asset is missing');
assert(cssPath, 'public landing CSS asset is missing');
const [javascript, stylesheet] = await Promise.all([
  readText(`${publicBase}${jsPath}`),
  readText(`${publicBase}${cssPath}`)
]);
assert(javascript.response.ok, `public JavaScript asset returned ${javascript.response.status}`);
assert(stylesheet.response.ok, `public CSS asset returned ${stylesheet.response.status}`);
for (const marker of [
  expectedSequence,
  'v0-public-landing-v3',
  'landing-expression-field-v3',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  'See what keeps happening.',
  'Understand what happens between you.',
  'See the whole system.',
  'Your thoughts deserve'
]) {
  assert(javascript.text.includes(marker), `compiled production JavaScript is missing ${marker}`);
}
for (const marker of [
  '.public-approved-v8',
  '.landing-story--personal',
  '.landing-story--relationship',
  '.landing-story--system',
  '@media(min-width:981px)'
]) {
  assert(stylesheet.text.replace(/\s+/g, '').includes(marker.replace(/\s+/g, '')), `compiled production CSS is missing ${marker}`);
}

console.log(JSON.stringify({
  parentDomainsVerified: true,
  version: commitSha,
  migration: {
    current: expectedMigration,
    latest: expectedMigration,
    parity: 'enforced'
  },
  visualRelease: {
    contract: 'v0-public-landing-v3',
    field: 'landing-expression-field-v3',
    archiveSha256: expectedArchive,
    sequenceFingerprint: expectedSequence,
    renderedComparisonRequired: true,
    javascriptAsset: jsPath,
    cssAsset: cssPath
  },
  redirects: [
    { source: 'https://defrag.app/', destination: `${publicBase}/` },
    { source: 'https://www.defrag.app/', destination: `${publicBase}/` },
    { source: 'https://defrag.app/app', destination: `${appBase}/app` },
    { source: 'https://www.defrag.app/login', destination: `${appBase}/login` }
  ],
  runtime: runtimeResults
}, null, 2));
