const commitSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || process.env.APP_VERSION || '').trim();
const publicBase = 'https://sovereign.app';
const appBase = 'https://app.sovereign.app';
const wwwBase = 'https://www.sovereign.app';
const expectedMigration = '0015_release_evidence';
const expectedArchive = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const expectedSequence = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${expectedArchive}`;
const primaryEmail = 'info@sovereign.os';
const publicAliases = ['info@sovereign.app', 'contact@sovereign.app'];

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
  assert(result.json?.dependencies?.transactionalEmail === 'resend', `${label} does not use Resend`);
  assert(result.json?.dependencies?.mailIdentity === 'configured', `${label} mail identity is not configured`);
  assert(result.json?.dependencies?.publicContactEmail === primaryEmail, `${label} public email identity drifted`);
  assert(result.json?.dependencies?.transactionalFromEmail === primaryEmail, `${label} transactional sender drifted`);
  assert(JSON.stringify(result.json?.dependencies?.publicContactAliases) === JSON.stringify(publicAliases), `${label} public aliases drifted`);
  assert(!JSON.stringify(result.json).includes('@gmail.com'), `${label} exposes a private mailbox`);
  assert(!JSON.stringify(result.json).includes('defrag.app'), `${label} exposes the retired Defrag namespace`);
  assert(result.json?.visualRelease?.contract === 'v0-public-landing-v3', `${label} visual contract is stale`);
  assert(result.json?.visualRelease?.field === 'landing-expression-field-v3', `${label} expression field contract is stale`);
  assert(result.json?.visualRelease?.archiveSha256 === expectedArchive, `${label} visual archive checksum is stale`);
  assert(result.json?.visualRelease?.sequenceFingerprint === expectedSequence, `${label} visual sequence is stale`);
  assert(result.json?.visualRelease?.renderedComparisonRequired === true, `${label} does not require rendered comparison`);
}

assert(/^[0-9a-f]{40}$/i.test(commitSha), 'A full deployed commit SHA is required for Sovereign-domain verification');

let runtimeResults;
let lastError;
for (let attempt = 1; attempt <= 30; attempt += 1) {
  try {
    const endpoints = [
      ['publicHealth', `${publicBase}/health`, false],
      ['publicReady', `${publicBase}/ready`, true],
      ['appHealth', `${appBase}/health`, false],
      ['appReady', `${appBase}/ready`, true]
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

const [home, wwwRoot, wwwApp, wwwLogin] = await Promise.all([
  readText(`${publicBase}/?release=${commitSha}`),
  readText(`${wwwBase}/`, { redirect: 'manual' }),
  readText(`${wwwBase}/app`, { redirect: 'manual' }),
  readText(`${wwwBase}/login`, { redirect: 'manual' })
]);

assert(home.response.ok, `public landing returned ${home.response.status}`);
assert(home.text.includes('id="root"'), 'public landing root is missing');
assert(!home.text.includes('defrag.app'), 'public landing exposes the retired Defrag namespace');
assert(!home.text.includes('@gmail.com'), 'public landing exposes a private mailbox');
assert(wwwRoot.response.status === 308 && wwwRoot.response.headers.get('location') === `${publicBase}/`, 'www.sovereign.app root redirect is incorrect');
assert(wwwApp.response.status === 308 && wwwApp.response.headers.get('location') === `${appBase}/app`, 'www.sovereign.app app redirect is incorrect');
assert(wwwLogin.response.status === 308 && wwwLogin.response.headers.get('location') === `${appBase}/login`, 'www.sovereign.app login redirect is incorrect');

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
assert(!javascript.text.includes('defrag.app'), 'compiled JavaScript exposes the retired Defrag namespace');
assert(!javascript.text.includes('@gmail.com'), 'compiled JavaScript exposes a private mailbox');
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

const normalizedStylesheet = stylesheet.text.replace(/\s+/g, '');
for (const marker of [
  '.public-approved-v8',
  '.landing-story--personal',
  '.landing-story--relationship',
  '.landing-story--system',
  '.landing-story__stage',
  '.sovereign-opening-capabilities'
]) {
  assert(normalizedStylesheet.includes(marker), `compiled production CSS is missing ${marker}`);
}

console.log(JSON.stringify({
  sovereignDomainsVerified: true,
  productionWorkersDev: false,
  version: commitSha,
  migration: {
    current: expectedMigration,
    latest: expectedMigration,
    parity: 'enforced'
  },
  mailIdentity: {
    primary: primaryEmail,
    aliases: publicAliases,
    provider: 'resend',
    privateDestinationExposed: false
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
    { source: `${wwwBase}/`, destination: `${publicBase}/` },
    { source: `${wwwBase}/app`, destination: `${appBase}/app` },
    { source: `${wwwBase}/login`, destination: `${appBase}/login` }
  ],
  runtime: runtimeResults
}, null, 2));
