import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const devVars = readFileSync(resolve(root, 'apps/sovereign-worker/.dev.vars'), 'utf8');
const signingSecret = devVars.match(/^SESSION_SIGNING_SECRET=(.+)$/m)?.[1]?.trim();
if (!signingSecret) throw new Error('local SESSION_SIGNING_SECRET not found');

const minted = spawnSync('node', ['--import', 'tsx', 'scripts/create-preview-session.ts'], {
  cwd: root, encoding: 'utf8',
  env: { ...process.env, PREVIEW_SESSION_SIGNING_SECRET: signingSecret },
  timeout: 30000
});
const sessionValue = minted.stdout.trim().split(';')[0].split('=')[1];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
await ctx.addCookies([{
  name: 'sovereign_session',
  value: sessionValue,
  url: 'http://localhost:5173',
  path: '/',
  secure: false,
  httpOnly: true,
  sameSite: 'Lax'
}]);

const page = await ctx.newPage();

async function verifyRoute(path, expectedText) {
  console.log(`Testing ${path}...`);
  await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
  const content = await page.content();
  if (content.includes(expectedText)) {
    console.log(`✅ ${path} passed`);
    return true;
  } else {
    console.log(`❌ ${path} failed: expected "${expectedText}"`);
    return false;
  }
}

const results = {
  onboarding: await verifyRoute('/onboarding', 'onboarding'),
  workspace: await verifyRoute('/app', 'SovereignIntelligenceWorkspace'),
};

await browser.close();
console.log('\nFunctional Audit Results:', results);
