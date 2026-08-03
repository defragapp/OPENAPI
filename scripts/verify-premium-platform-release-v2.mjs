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
    "  'apps/web/src/passkey-auth.css',\n  'apps/web/src/deployed-route-cohesion.css',\n  'apps/web/public/v0-public-port.css'"
  ],
  [
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\"\n];",
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\",\n  \"import './deployed-route-cohesion.css';\"\n];"
  ],
  [
    "assert(!main.slice(previousImport + orderedImports.at(-1).length).includes(\"import './\"), 'A local visual layer loads after passkey authority.');",
    "assert(!main.slice(previousImport + orderedImports.at(-1).length).includes(\"import './\"), 'A local visual layer loads after the final deployed route authority.');"
  ],
  [
    "  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],",
    "  ['passkey authority', passkeyVisual],\n  ['final route authority', routeCohesionVisual],\n  ['standalone authority', staticV0Visual],"
  ]
];

for (const [retiredContract, currentContract] of replacements) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Premium platform release v2 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 120)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

if (source.includes('A local visual layer loads after passkey authority.')) {
  throw new Error('Premium platform release v2 still treats passkey styling as the final visual authority.');
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
