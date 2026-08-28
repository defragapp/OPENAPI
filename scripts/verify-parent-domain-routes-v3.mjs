const commitSha = String(process.env.WORKERS_CI_COMMIT_SHA || process.env.GITHUB_SHA || process.env.APP_VERSION || '').trim();
const publicBase = 'https://sovereign.defrag.app';
const appBase = 'https://app.defrag.app';
const expectedMigration = '0018_workers_ai_capacity_reservations';
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
  assert(result.json?.dependencies?.policyAcceptanceReceipts === 'configured', `${label} policy acceptance receipt store is not configured`);
  assert(result.json?.dependencies?.privacyAccessControls === 'configured', `${label} privacy access controls are not configured`);
  assert(result.json?.dependencies?.aiCapacityReservations === 'configured', `${label} AI capacity reservations are not configured`);
  assert(result.json?.dependencies?.privateExports === 'on-demand-no-artifact', `${label} private export contract is stale`);
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

const [home, parentRoot, wwwRoot, parentApp, wwwLogin, socialPreview, appIcon, touchIcon] = await Promise.all([
  readText(`${publicBase}/?release=${commitSha}`),
  readText('https://defrag.app/', { redirect: 'manual' }),
  readText('https://www.defrag.app/', { redirect: 'manual' }),
  readText('https://defrag.app/app', { redirect: 'manual' }),
  readText('https://www.defrag.app/login', { redirect: 'manual' }),
  request(`${publicBase}/og-sovereign.png`),
  request(`${publicBase}/app-icon.png`),
  request(`${publicBase}/apple-touch-icon.png`)
]);

assert(home.response.ok, `public landing returned ${home.response.status}`);
assert(home.text.includes('id="root"'), 'public landing root is missing');
assert(home.text.includes('Sovereign.OS — Private personal AI for real life'), 'public landing product-category metadata is missing');
assert(home.text.includes('/og-sovereign.png'), 'public landing raster social preview is missing');
assert(home.text.includes('/apple-touch-icon.png'), 'public landing iOS touch icon is missing');
assert(socialPreview.ok && (socialPreview.headers.get('content-type') || '').includes('image/png'), 'social preview PNG is not publicly served');
assert(appIcon.ok && (appIcon.headers.get('content-type') || '').includes('image/png'), 'app icon PNG is not publicly served');
assert(touchIcon.ok && (touchIcon.headers.get('content-type') || '').includes('image/png'), 'iOS touch icon PNG is not publicly served');
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
  'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
  'Start with yourself. Expand outward when it matters.',
  'Explore how you think, decide, communicate, create, and respond.',
  'See why the same moment lands differently—and how to bridge the gap.',
  'How Sovereign compares two people',
  'See source details',
  'From 1:1 to the whole system',
  'See the whole system.',
  'How Sovereign reads a system',
  'Most AI starts with the prompt. Sovereign starts with you.',
  'Know yourself. Understand your people. See the whole system.'
]) {
  assert(javascript.text.includes(marker), `compiled production JavaScript is missing ${marker}`);
}
for (const retired of [
  'Understand both sides and what happens between you.',
  'Example Basis',
  'server-approved Basis',
  'permitted context',
  'consented people',
  'permitted perspectives',
  'confirmed responsibilities',
  'One private reference beneath every question.',
  'One private foundation. More useful answers across the questions that shape your life.',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.',
  'Sovereign uses your Baseline to help make sense of real questions about yourself, relationships, decisions, and family or group dynamics.',
  'Built for real situations',
  'See the capacity beneath the pattern.',
  'See what keeps the pattern going—and what could change it.'
]) {
  assert(!javascript.text.includes(retired), `compiled production JavaScript still contains retired or internal public language ${retired}`);
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
  parentDomainsVerified: true,
  productionWorkersDev: false,
  version: commitSha,
  migration: {
    current: expectedMigration,
    latest: expectedMigration,
    parity: 'enforced'
  },
  privacy: {
    policyAcceptanceReceipts: 'configured',
    privacyAccessControls: 'configured',
    privateExports: 'on-demand-no-artifact'
  },
  visualRelease: {
    contract: 'v0-public-landing-v3',
    field: 'landing-expression-field-v3',
    archiveSha256: expectedArchive,
    sequenceFingerprint: expectedSequence,
    renderedComparisonRequired: true,
    javascriptAsset: jsPath,
    cssAsset: cssPath,
    socialPreview: `${publicBase}/og-sovereign.png`,
    appIcon: `${publicBase}/app-icon.png`,
    touchIcon: `${publicBase}/apple-touch-icon.png`
  },
  redirects: [
    { source: 'https://defrag.app/', destination: `${publicBase}/` },
    { source: 'https://www.defrag.app/', destination: `${publicBase}/` },
    { source: 'https://defrag.app/app', destination: `${appBase}/app` },
    { source: 'https://www.defrag.app/login', destination: `${appBase}/login` }
  ],
  runtime: runtimeResults
}, null, 2));
