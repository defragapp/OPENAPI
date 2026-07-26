import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const secretsExample = readFileSync('.dev.vars.example', 'utf8');
const readme = readFileSync('README.md', 'utf8');

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

requireValue(config.name === 'sovereign-openapi-preview', 'one-click deploy must target sovereign-openapi-preview');
requireValue(config.main === 'apps/sovereign-worker/src/runtime-entry.ts', 'one-click deploy must use the active OPENAPI runtime entry');
requireValue(config.vars?.APP_ENV === 'preview', 'one-click deploy must remain preview-only');
requireValue(config.workers_dev === true, 'one-click deploy must use workers.dev');
requireValue(!config.routes && !config.custom_domains, 'one-click deploy must not contain production routes or custom domains');
requireValue(config.assets?.directory === 'apps/web/dist', 'one-click deploy must publish the built web assets');
requireValue(config.assets?.binding === 'ASSETS', 'one-click deploy is missing ASSETS');
requireValue(config.ai?.binding === 'AI', 'one-click deploy is missing Workers AI');
requireValue(config.d1_databases?.some((item) => item.binding === 'DB' && item.database_name === 'sovereign-openapi-preview-db'), 'one-click deploy is missing isolated D1');
requireValue(config.d1_databases?.some((item) => item.migrations_dir === 'apps/sovereign-worker/migrations'), 'one-click deploy must use the canonical migrations');
requireValue(config.r2_buckets?.some((item) => item.binding === 'ARTIFACTS' && item.bucket_name === 'sovereign-openapi-preview-artifacts'), 'one-click deploy is missing isolated R2');
requireValue(config.queues?.producers?.some((item) => item.binding === 'JOBS' && item.queue === 'sovereign-openapi-preview-jobs'), 'one-click deploy is missing isolated Queue producer');
requireValue(config.queues?.consumers?.some((item) => item.queue === 'sovereign-openapi-preview-jobs'), 'one-click deploy is missing isolated Queue consumer');
requireValue(config.durable_objects?.bindings?.some((item) => item.name === 'THREADS' && item.class_name === 'ThreadCoordinator'), 'one-click deploy is missing ThreadCoordinator');
requireValue(config.triggers?.crons?.includes('*/15 * * * *'), 'one-click deploy is missing retention cron');

for (const value of ['openai/gpt-5.5', 'sovereign', 'https://ssd.jpl.nasa.gov/api/horizons.api']) {
  requireValue(JSON.stringify(config).includes(value), `one-click deploy is missing ${value}`);
}

const deploy = packageJson.scripts?.deploy ?? '';
requireValue(deploy.includes('d1 migrations apply DB --remote'), 'deploy script must apply remote D1 migrations');
requireValue(deploy.includes('wrangler deploy --config ../../wrangler.jsonc'), 'deploy script must use the root one-click config');
requireValue(packageJson.scripts?.build === 'pnpm verify:cloudflare-build', 'Cloudflare build must run the full verification contract');
requireValue(packageJson.scripts?.['verify:cloudflare-build']?.includes('verify:one-click-deploy'), 'canonical verification must include the one-click contract');

for (const name of ['SESSION_SIGNING_SECRET', 'TURNSTILE_SECRET_KEY', 'EMAIL_API_TOKEN', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']) {
  requireValue(secretsExample.includes(`${name}=`), `.dev.vars.example is missing ${name}`);
}

requireValue(readme.includes('deploy.workers.cloudflare.com/?url=https://github.com/defragapp/OPENAPI'), 'README is missing the Deploy to Cloudflare link');
requireValue(!readme.includes('defrag.app)') || readme.includes('Production promotion'), 'one-click preview must not be presented as production');

console.log('One-click Cloudflare preview contract verified: isolated Worker, D1, R2, Queue, Durable Object, Workers AI, migrations, secrets, and no production routes.');
