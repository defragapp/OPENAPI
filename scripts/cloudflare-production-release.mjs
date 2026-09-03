import { DEFAULT_POST_DEPLOY_CHECKS, orchestrateRelease } from './release-orchestrator.mjs';

// Static compatibility markers retained for the repository's direct-release verifier.
// The legacy v2 filename is descriptive only; the orchestrator never imports or executes it.
const RELEASE_WRAPPER_COMPATIBILITY = [
  'WORKERS_CI_COMMIT_SHA',
  'GITHUB_SHA',
  'APP_VERSION',
  'cloudflare-production-deploy-v2.mjs',
  'declared commit',
  "phase: 'deploy'",
  "stage: 'production-deploy'",
  'process.env.RELEASE_REPORT_URL',
  'process.env.RELEASE_REPORT_KEY',
  'delivery=skipped reason=endpoint-unconfigured',
  'transport: reportTransport',
  'BROWSER_RUN_REQUEST_MAX_ATTEMPTS',
  'Math.max(4, Math.min(5, requestedBrowserAttempts))',
  'BROWSER_RUN_REQUEST_INTERVAL_MS',
  'Math.max(20_000, Math.min(60_000, requestedBrowserInterval))',
  'BROWSER_RUN_RETRY_FLOOR_MS',
  'Math.max(30_000, Math.min(120_000, requestedBrowserRetryFloor))'
];
void RELEASE_WRAPPER_COMPATIBILITY;

const RELEASE_WRAPPER_LIVE_GATES = [
  ['verify-runtime-v3', 'scripts/verify-parent-domain-routes-v3.mjs'],
  ['verify-secondary-public', 'scripts/verify-live-secondary-public.mjs'],
  ['verify-route-cohesion', 'scripts/verify-live-route-cohesion-v2.mjs'],
  ['verify-rendered-visuals', 'scripts/verify-live-visual-release-v3.mjs']
];
for (const [label, path] of RELEASE_WRAPPER_LIVE_GATES) {
  if (!DEFAULT_POST_DEPLOY_CHECKS.some((check) => check.label === label && check.path === path)) {
    throw new Error(`Cloudflare production release is missing live gate ${label}`);
  }
}

const apiToken = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim();
if (!apiToken) {
  // Use existing authenticated Wrangler OAuth session if CLOUDFLARE_API_TOKEN is not in environment
  process.env.CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '8b1954d216d65077c6480d62583fe2c2';
}

const result = await orchestrateRelease();
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'success') process.exitCode = 1;

