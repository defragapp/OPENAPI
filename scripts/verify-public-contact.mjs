import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.');
const primaryContact = 'info@sovereign.os';
const publicAliases = ['info@sovereign.app', 'contact@sovereign.app'];
const publicSite = 'https://sovereign.app';
const publicApp = 'https://app.sovereign.app';
const explicitFiles = ['wrangler.jsonc', 'wrangler.production-direct.jsonc'];
const publicIdentityFiles = [
  'apps/sovereign-worker/src/email.ts',
  'apps/web/index.html',
  'apps/web/src/PublicLanding.tsx',
  'apps/web/src/PublicPolicyMetadata.tsx',
  'apps/web/public/sitemap.xml',
  'apps/web/public/_headers'
];
const errors = [];

for (const path of [...explicitFiles, ...publicIdentityFiles]) {
  const source = readFileSync(resolve(root, path), 'utf8');
  if (/\bdefrag\.app\b/i.test(source)) {
    errors.push(`${path}: exposes the retired Defrag public namespace`);
  }
  if (/[A-Za-z0-9._%+-]+@gmail\.com/i.test(source)) {
    errors.push(`${path}: contains a private Gmail destination`);
  }
}

for (const configPath of explicitFiles) {
  const source = readFileSync(resolve(root, configPath), 'utf8');
  requireMarker(configPath, source, `"PUBLIC_CONTACT_EMAIL": "${primaryContact}"`);
  requireMarker(configPath, source, `"PUBLIC_CONTACT_ALIASES": "${publicAliases.join(',')}"`);
  requireMarker(configPath, source, `"TRANSACTIONAL_FROM_EMAIL": "${primaryContact}"`);
  requireMarker(configPath, source, `"PUBLIC_APP_URL": "${publicApp}"`);
  requireMarker(configPath, source, '"pattern": "sovereign.app"');
  requireMarker(configPath, source, '"pattern": "app.sovereign.app"');
}

const emailSource = readFileSync(resolve(root, 'apps/sovereign-worker/src/email.ts'), 'utf8');
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, `const DEFAULT_FROM_ADDRESS = '${primaryContact}';`);
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, `const DEFAULT_PUBLIC_CONTACT = '${primaryContact}';`);
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, `const BRAND_MARK_URL = '${publicSite}/brand-mark.svg';`);
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, "runtimeMode(env) !== 'production' && env.EMAIL");
requireMarker('apps/sovereign-worker/src/email.ts', emailSource, "throw new Error('resend_required')");

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

console.log(`[public-contact] verified primary ${primaryContact}; aliases remain transport-only and private routing is absent from source`);

function requireMarker(path, source, marker) {
  if (!source.includes(marker)) errors.push(`${path}: missing ${marker}`);
}
