import { DEFAULT_POST_DEPLOY_CHECKS, orchestrateRelease } from './release-orchestrator.mjs';

const TEXT_FIRST_POST_DEPLOY_CHECKS = DEFAULT_POST_DEPLOY_CHECKS.filter((check) => check.browserRun !== true);

if (TEXT_FIRST_POST_DEPLOY_CHECKS.some((check) => check.browserRun === true)) {
  throw new Error('Text-first release must not execute Browser Rendering checks');
}

const requiredChecks = ['verify-runtime-v3', 'verify-secondary-public'];
for (const label of requiredChecks) {
  if (!TEXT_FIRST_POST_DEPLOY_CHECKS.some((check) => check.label === label)) {
    throw new Error(`Text-first production release is missing required live check ${label}`);
  }
}

const apiToken = String(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim();
if (!apiToken) throw new Error('Text-first production release failed: CLOUDFLARE_API_TOKEN is required');

const result = await orchestrateRelease({
  postDeployChecks: TEXT_FIRST_POST_DEPLOY_CHECKS
});

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'success') process.exitCode = 1;
