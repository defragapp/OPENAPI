import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve('.');
const approvedPublicContact = 'info@sovereign.os';
const verifiedTransactionalSender = 'info@defrag.app';
const prohibitedPublicAddress = 'support@defrag.app';
const scanRoots = [
  'apps/web/src',
  'apps/web/public',
  'apps/sovereign-worker/src',
  'scripts'
];
const explicitFiles = ['wrangler.jsonc', 'wrangler.production-direct.jsonc'];
const scannedExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.html', '.json', '.jsonc']);
const errors = [];
let approvedOccurrences = 0;

for (const path of [...explicitFiles, ...scanRoots.flatMap(walk)]) {
  const source = readFileSync(resolve(root, path), 'utf8');
  const normalizedPath = path.replaceAll('\\', '/');
  approvedOccurrences += source.split(approvedPublicContact).length - 1;

  if (source.includes(prohibitedPublicAddress)) {
    errors.push(`${normalizedPath}: contains prohibited public address ${prohibitedPublicAddress}`);
  }
  if (/[A-Za-z0-9._%+-]+@gmail\.com/i.test(source)) {
    errors.push(`${normalizedPath}: contains a personal Gmail address`);
  }

  const retiredOccurrences = source.split(verifiedTransactionalSender).length - 1;
  if (retiredOccurrences > 0 && !allowsVerifiedSender(normalizedPath, source, retiredOccurrences)) {
    errors.push(`${normalizedPath}: exposes the transactional sender outside its approved transport-only locations`);
  }
}

for (const configPath of explicitFiles) {
  const source = readFileSync(resolve(root, configPath), 'utf8');
  requireMarker(configPath, source, `"PUBLIC_CONTACT_EMAIL": "${approvedPublicContact}"`);
  requireMarker(configPath, source, `"TRANSACTIONAL_FROM_EMAIL": "${verifiedTransactionalSender}"`);
}

if (approvedOccurrences < 8) {
  errors.push(`approved public contact appears only ${approvedOccurrences} times; expected broad public/runtime coverage`);
}

if (errors.length > 0) {
  console.error('[public-contact] verification failed');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[public-contact] verified ${approvedPublicContact} with private-destination and transport separation`);

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

function allowsVerifiedSender(path, source, occurrences) {
  if (path === 'apps/sovereign-worker/src/email.ts') {
    return occurrences === 1 && source.includes(`const DEFAULT_FROM_ADDRESS = '${verifiedTransactionalSender}';`);
  }
  if (path === 'apps/sovereign-worker/src/runtime-entry.ts') {
    return occurrences === 1 && source.includes(`transactionalFromEmail: env.TRANSACTIONAL_FROM_EMAIL || '${verifiedTransactionalSender}'`);
  }
  if (path === 'scripts/email-smoke.ts') {
    return occurrences === 1 && source.includes(`process.env.TRANSACTIONAL_FROM_EMAIL || '${verifiedTransactionalSender}'`);
  }
  if (path === 'wrangler.jsonc' || path === 'wrangler.production-direct.jsonc') {
    return occurrences === 1 && source.includes(`"TRANSACTIONAL_FROM_EMAIL": "${verifiedTransactionalSender}"`);
  }
  if (path.endsWith('.test.ts') || path.endsWith('.test.tsx')) {
    return source.includes('TRANSACTIONAL_FROM_EMAIL') || source.includes('payload.from');
  }
  return false;
}

function requireMarker(path, source, marker) {
  if (!source.includes(marker)) errors.push(`${path}: missing ${marker}`);
}
