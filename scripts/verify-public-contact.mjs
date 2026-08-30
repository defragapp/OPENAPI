import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

// Public identity layer vs operational mail layer (decision recorded 2026-08-29, see
// docs/release/NAMESPACE_AUTHORITY.md): info@sovereign.os is the public contact identity
// (PUBLIC_CONTACT_EMAIL) — configuration and runtime metadata only. The sovereign.os zone is
// not resolvable at the DNS root, so the identity address must never be a mail routing target.
// info@sovereign.defrag.app is the operational contact: the deliverable, monitored inbox used
// for transactional sender identity, reply routing, and support/security inbound mail. It may
// appear only in the allowlisted files below at the exact allowlisted occurrence counts.
const root = resolve('.');
const approvedPublicContact = 'info@sovereign.os';
const operationalContact = 'info@sovereign.defrag.app';
const prohibitedPublicAddresses = ['info@defrag.app', 'support@defrag.app'];
const scanRoots = [
  'apps/web/src',
  'apps/web/public',
  'apps/sovereign-worker/src',
  'scripts'
];
const explicitFiles = ['wrangler.jsonc', 'wrangler.production-direct.jsonc', 'apps/web/public/.well-known/security.txt'];
const scannedExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.html', '.json', '.jsonc']);
const excludedPaths = new Set(['scripts/verify-public-contact.mjs']);
const operationalAllowlist = new Map([
  ['wrangler.jsonc', 2],
  ['wrangler.production-direct.jsonc', 2],
  ['apps/web/public/.well-known/security.txt', 1],
  ['apps/web/public/consent.html', 3],
  ['apps/web/public/faq.html', 2],
  ['apps/web/src/PolicyGateAccountRights.tsx', 1],
  ['apps/web/src/AccountControlCenter.tsx', 1],
  ['apps/web/src/PublicPolicy.tsx', 3],
  ['apps/web/src/PublicLanding.tsx', 1],
  ['apps/web/src/PublicFAQ.tsx', 2],
  ['apps/sovereign-worker/src/runtime-entry.ts', 1],
  ['apps/sovereign-worker/src/auth-passkeys.ts', 1],
  ['apps/sovereign-worker/src/email.ts', 2],
  ['scripts/email-smoke.ts', 2],
  ['scripts/verify-direct-preview-config.mjs', 1]
]);
const identityMarkers = [
  ['wrangler.jsonc', '"PUBLIC_CONTACT_EMAIL": "info@sovereign.os"'],
  ['wrangler.production-direct.jsonc', '"PUBLIC_CONTACT_EMAIL": "info@sovereign.os"'],
  ['wrangler.jsonc', '"TRANSACTIONAL_REPLY_TO_EMAIL": "info@sovereign.defrag.app"'],
  ['wrangler.production-direct.jsonc', '"TRANSACTIONAL_REPLY_TO_EMAIL": "info@sovereign.defrag.app"'],
  ['apps/sovereign-worker/src/runtime-entry.ts', "publicContactEmail: env.PUBLIC_CONTACT_EMAIL || 'info@sovereign.os'"],
  ['apps/web/public/.well-known/security.txt', 'Contact: mailto:info@sovereign.defrag.app']
];
const errors = [];

for (const path of [...explicitFiles, ...scanRoots.flatMap(walk)]) {
  const normalizedPath = path.replaceAll('\\', '/');
  if (excludedPaths.has(normalizedPath) || normalizedPath.includes('.test.')) continue;
  const source = readFileSync(resolve(root, path), 'utf8');

  for (const prohibitedPublicAddress of prohibitedPublicAddresses) {
    if (source.includes(prohibitedPublicAddress)) {
      errors.push(`${normalizedPath}: contains prohibited public address ${prohibitedPublicAddress}`);
    }
  }
  if (/[A-Za-z0-9._%+-]+@gmail\.com/i.test(source)) {
    errors.push(`${normalizedPath}: contains a personal Gmail address`);
  }
  if (source.includes(`mailto:${approvedPublicContact}`)) {
    errors.push(`${normalizedPath}: public contact identity must never be a routable mailto target while its zone is not resolvable`);
  }

  const operationalOccurrences = source.split(operationalContact).length - 1;
  const expectedOperationalOccurrences = operationalAllowlist.get(normalizedPath) ?? 0;
  if (operationalOccurrences !== expectedOperationalOccurrences) {
    errors.push(
      expectedOperationalOccurrences === 0
        ? `${normalizedPath}: operational contact is not allowlisted here (found ${operationalOccurrences} occurrence(s))`
        : `${normalizedPath}: operational contact occurrence drift (found ${operationalOccurrences}, allowlisted ${expectedOperationalOccurrences})`
    );
  }
}

for (const [path, marker] of identityMarkers) {
  requireMarker(path, readFileSync(resolve(root, path), 'utf8'), marker);
}

const emailSource = readFileSync(resolve(root, 'apps/sovereign-worker/src/email.ts'), 'utf8');
if (!emailSource.includes('env.TRANSACTIONAL_REPLY_TO_EMAIL')) {
  errors.push('apps/sovereign-worker/src/email.ts: reply routing must resolve from TRANSACTIONAL_REPLY_TO_EMAIL');
}
if (emailSource.includes('env.PUBLIC_CONTACT_EMAIL')) {
  errors.push('apps/sovereign-worker/src/email.ts: transactional email must not consume the public contact identity');
}

if (errors.length > 0) {
  console.error('[public-contact] verification failed');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[public-contact] verified identity ${approvedPublicContact} with fail-closed separation from operational transport ${operationalContact}`);

function walk(path) {
  const absolute = resolve(root, path);
  if (!statSync(absolute).isDirectory()) return scannedExtensions.has(extname(path)) ? [path] : [];
  return readdirSync(absolute).flatMap((entry) => {
    const child = join(path, entry);
    const childAbsolute = resolve(root, child);
    if (statSync(childAbsolute).isDirectory()) return walk(child);
    return scannedExtensions.has(extname(child)) ? [relative(root, childAbsolute)] : [];
  });
}

function requireMarker(path, source, marker) {
  if (!source.includes(marker)) errors.push(`${path}: missing ${marker}`);
}
