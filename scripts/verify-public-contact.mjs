import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const root = resolve('.');
const primaryContact = 'info@sovereign.os';
const publicAliases = ['info@sovereign.app', 'contact@sovereign.app'];
const publicSite = 'https://sovereign.app';
const publicApp = 'https://app.sovereign.app';
const explicitFiles = ['wrangler.jsonc', 'wrangler.production-direct.jsonc'];
const productionTrees = [
  'apps/web/src',
  'apps/web/public',
  'apps/sovereign-worker/src'
];
const productionScripts = [
  'scripts/email-smoke.ts',
  'scripts/cloudflare-production-deploy-v2.mjs',
  'scripts/cloudflare-production-deploy-v3.mjs',
  'scripts/verify-direct-preview-config.mjs',
  'scripts/verify-parent-domain-routes.mjs',
  'scripts/verify-parent-domain-routes-v3.mjs',
  'scripts/verify-live-route-cohesion.mjs',
  'scripts/verify-live-secondary-public.mjs',
  'scripts/verify-live-visual-release.mjs',
  'scripts/verify-live-visual-release-v2.mjs',
  'scripts/write-cloudflare-release-evidence.mjs',
  'scripts/configure-cloudflare-dmarc.mjs'
];
const errors = [];

const scanFiles = [
  ...explicitFiles,
  ...productionTrees.flatMap((directory) => walk(directory)),
  ...productionScripts
].filter((value, index, values) => values.indexOf(value) === index);

for (const path of scanFiles) {
  const source = readFileSync(resolve(root, path), 'utf8');
  if (/\bdefrag\.app\b/i.test(source)) {
    errors.push(`${path}: exposes the retired Defrag public namespace`);
  }
  if (/[A-Za-z0-9._%+-]+@gmail\.com/i.test(source)) {
    errors.push(`${path}: contains a private Gmail destination`);
  }
  if (/info@defrag\.app/i.test(source)) {
    errors.push(`${path}: contains the retired public email identity`);
  }
}

for (const configPath of explicitFiles) {
  const source = readFileSync(resolve(root, configPath), 'utf8');
  requireMarker(configPath, source, `"PUBLIC_CONTACT_EMAIL": "${primaryContact}"`);
  requireMarker(configPath, source, `"PUBLIC_CONTACT_ALIASES": "${publicAliases.join(',')}"`);
  requireMarker(configPath, source, `"TRANSACTIONAL_FROM_EMAIL": "${primaryContact}"`);
  requireMarker(configPath, source, `"PUBLIC_APP_URL": "${publicApp}"`);
  requireMarker(configPath, source, '"pattern": "sovereign.app"');
  requireMarker(configPath, source, '"pattern": "www.sovereign.app"');
  requireMarker(configPath, source, '"pattern": "app.sovereign.app"');
}

const emailSource = readFileSync(resolve(root, 'apps/sovereign-worker/src/email.ts'), 'utf8');
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, `const DEFAULT_FROM_ADDRESS = '${primaryContact}';`);
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, `const DEFAULT_PUBLIC_CONTACT = '${primaryContact}';`);
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, `const BRAND_MARK_URL = '${publicSite}/brand-mark.svg';`);
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, "runtimeMode(env) !== 'production' && env.EMAIL");
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, "throw new Error('resend_required')");
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, 'reply_to: replyTo');

const runtimeSource = readFileSync(resolve(root, 'apps/sovereign-worker/src/runtime-entry.ts'), 'utf8');
requireMarker('apps/sovereign-worker/src/runtime-entry.ts', runtimeSource, "const PUBLIC_HOST = 'sovereign.app';");
requireMarker('apps/sovereign-worker/src/runtime-entry.ts', runtimeSource, "const APP_HOST = 'app.sovereign.app';");
requireMarker('apps/sovereign-worker/src/runtime-entry.ts', runtimeSource, "const PRIMARY_PUBLIC_EMAIL = 'info@sovereign.os';");
requireMarker('apps/sovereign-worker/src/runtime-entry.ts', runtimeSource, "'info@sovereign.app', 'contact@sovereign.app'");
requireMarker('apps/sovereign-worker/src/runtime-entry.ts', runtimeSource, "dependencies.transactionalEmail === 'resend'");
requireMarker('apps/sovereign-worker/src/runtime-entry.ts', runtimeSource, "dependencies.mailIdentity === 'configured'");

const landing = readFileSync(resolve(root, 'apps/web/src/PublicLanding.tsx'), 'utf8');
requireMarker('apps/web/src/PublicLanding.tsx', landing, `mailto:${primaryContact}`);
for (const alias of publicAliases) {
  if (landing.includes(`mailto:${alias}`)) {
    errors.push(`apps/web/src/PublicLanding.tsx: ${alias} is an alias, not the primary public address`);
  }
}

if (errors.length > 0) {
  console.error('[public-contact] verification failed');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[public-contact] verified Sovereign-only public namespace; primary=${primaryContact}; aliases=${publicAliases.join(',')}; private routing absent from source`);

function requireMarker(path, source, marker) {
  if (!source.includes(marker)) errors.push(`${path}: missing ${marker}`);
}

function walk(directory) {
  const absolute = resolve(root, directory);
  const files = [];
  for (const entry of readdirSync(absolute)) {
    const path = join(absolute, entry);
    const repoPath = relative(root, path).replaceAll('\\', '/');
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walk(repoPath));
      continue;
    }
    if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry)) continue;
    if (/\.(map|woff2?|png|jpe?g|gif|webp|ico|pdf|zip)$/i.test(entry)) continue;
    if (!/\.(?:[cm]?[jt]sx?|html|css|json|xml|txt|webmanifest)$/i.test(entry)) continue;
    files.push(repoPath);
  }
  return files;
}
