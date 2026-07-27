import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const scopes = ['apps/web/src', 'apps/sovereign-worker/src'];
const forbidden = [
  /billing\.test/i,
  /test-billing\.invalid/i,
  /price_test_/i,
  /fixture checkout/i,
  /fixture Covenant/i,
  /demo thread/i,
  /HUMAN LEGAL REVIEW REQUIRED/i,
  /Open Sovereign\+ Checkout fixture/i,
  /Retrieve Covenant fixture/i,
  /AI_PROVIDER:\s*(?:fixture|fake|mock|test)/i,
  /TODO/i,
  /not implemented/i,
  /\bplaceholder\s*(?:=|:)\s*(?:["'`]|\{\s*["'`]?)?(?:fixture|demo|mock|test|todo|not implemented|development)\b/i
];
const fixtureAllowed = /\.test\.tsx?$|scripts\/|docs\/|fixtureAllowed|canUseDevelopmentFixtures|allowTestBilling|normalizeStripeFixtureEvent|developmentBaselineFixture|developmentCurrentFixture|fixtureBodies|openapi-fixture|SANITIZED_FIXTURE|Development fallback|setAttribute\(['"]placeholder['"]/i;
const violatesPolicy = (line) => !fixtureAllowed.test(line) && forbidden.some((pattern) => pattern.test(line));
assert.equal(violatesPolicy('<input placeholder="Email" />'), false);
assert.equal(violatesPolicy('<input placeholder="fixture email" />'), true);
assert.equal(violatesPolicy("const field = { placeholder: 'mock account' };"), true);
assert.equal(violatesPolicy('const provider = { AI_PROVIDER: fixture };'), true);
const files = spawnSync('git', ['ls-files', ...scopes], { encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
assert(files.some((file) => file.startsWith('apps/web/src/')) && files.some((file) => file.startsWith('apps/sovereign-worker/src/')));
const violations = [];
for (const file of files) {
  if (fixtureAllowed.test(file) || !existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  text.split('\n').forEach((line, index) => {
    if (violatesPolicy(line)) violations.push(`${file}:${index + 1}: ${line.trim()}`);
  });
}
if (violations.length) {
  console.error(violations.join('\n'));
  throw new Error('Production fixture scan failed');
}
console.log('Production fixture scan passed.');
