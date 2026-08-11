import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-premium-platform-release.mjs');
const temporaryPath = resolve(`scripts/.verify-premium-platform-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

const replacements = [
  [
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');",
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst routeCohesionVisual = read('apps/web/src/deployed-route-cohesion.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');"
  ],
  [
    "  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css'",
    "  'apps/web/src/deployed-route-cohesion.css',\n  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css'"
  ],
  [
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\"\n];",
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './deployed-route-cohesion.css';\",\n  \"import './passkey-auth.css';\"\n];"
  ],
  [
    "  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],",
    "  ['route cohesion authority', routeCohesionVisual],\n  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],"
  ]
];

for (const [retiredContract, currentContract] of replacements) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Premium platform release v2 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 120)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

if (source.includes("\"import './passkey-auth.css';\",\n  \"import './deployed-route-cohesion.css';\"")) {
  throw new Error('Premium platform release v2 places route cohesion after the final passkey authority.');
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
