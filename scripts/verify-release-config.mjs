import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('apps/sovereign-worker/wrangler.jsonc', 'utf8'));
function assertBinding(scope, name) {
  if (!scope?.queues?.producers?.some((item) => item.binding === 'JOBS')) throw new Error(`${name} missing JOBS queue producer`);
  if (!scope?.queues?.consumers?.length) throw new Error(`${name} missing queue consumer`);
  if (!scope?.triggers?.crons?.length) throw new Error(`${name} missing scheduled cleanup trigger`);
  if (!scope?.r2_buckets?.some((item) => item.binding === 'ARTIFACTS')) throw new Error(`${name} missing ARTIFACTS R2 binding`);
}
assertBinding(config, 'default');
assertBinding(config.env?.preview, 'preview');
if (config.vars?.APP_ENV !== 'production') throw new Error('default Worker environment must fail closed as production');
if (config.env?.preview?.vars?.APP_ENV !== 'preview') throw new Error('preview environment must be explicitly preview');
for (const scope of [config.vars, config.env?.preview?.vars]) {
  if (scope?.AI_PROVIDER !== 'cloudflare-gateway') throw new Error('AI provider must be Cloudflare Gateway');
  if (scope?.AI_MODEL !== 'openai/gpt-5.5') throw new Error('AI model must be the approved ZDR-cataloged model');
  if (scope?.AI_FREE_MONTHLY_TURNS !== '10' || scope?.AI_SOVEREIGN_PLUS_MONTHLY_TURNS !== '300') throw new Error('AI allowances do not match the review contract');
}
for (const key of ['STRIPE_SUCCESS_URL', 'STRIPE_CANCEL_URL', 'STRIPE_PORTAL_RETURN_URL']) {
  if (!String(config.env?.preview?.vars?.[key] ?? '').includes('/app')) throw new Error(`${key} must return to /app`);
}
console.log('Release config verified queues=true consumers=true schedules=true r2=true cloudflare_only_ai=true allowances=true billing_routes=true');
