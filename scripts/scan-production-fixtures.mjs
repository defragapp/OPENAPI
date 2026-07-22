import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

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
  /AI_PROVIDER:\s*fixture/i,
  /TODO/i,
  /not implemented/i,
  /placeholder/i
];
const fixtureAllowed = /\.test\.tsx?$|scripts\/|docs\/|fixtureAllowed|canUseDevelopmentFixtures|normalizeStripeFixtureEvent|developmentBaselineFixture|developmentCurrentFixture|fixtureBodies|openapi-fixture|SANITIZED_FIXTURE|Development fallback/i;
const files = spawnSync('git', ['ls-files', ...scopes], { encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
const violations = [];
for (const file of files) {
  if (fixtureAllowed.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  text.split('\n').forEach((line, index) => {
    if (fixtureAllowed.test(line)) return;
    if (forbidden.some((pattern) => pattern.test(line))) violations.push(`${file}:${index + 1}: ${line.trim()}`);
  });
}
if (violations.length) {
  console.error(violations.join('\n'));
  throw new Error('Production fixture scan failed');
}
console.log('Production fixture scan passed.');
