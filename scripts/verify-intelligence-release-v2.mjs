import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-intelligence-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

const replacements = [
  [
    "  \"import './passkey-auth.css'\",\n  'installV0ReleaseFingerprint();'",
    "  \"import './passkey-auth.css'\",\n  \"import './deployed-route-cohesion.css'\",\n  'installV0ReleaseFingerprint();'"
  ],
  [
    "assert(!main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes(\"import './\"), 'A local visual file loads after the passkey-specific final authority.');",
    "const routeCohesionImport = \"import './deployed-route-cohesion.css';\";\nassert(main.indexOf(passkeyImport) < main.indexOf(routeCohesionImport), 'The final non-landing route authority must load after passkey-specific styling.');\nassert(!main.slice(main.indexOf(routeCohesionImport) + routeCohesionImport.length).includes(\"import './\"), 'A local visual file loads after the final deployed route authority.');"
  ],
  [
    "'landing-hero-field-v4.css', 'passkey-auth.css', 'v0-public-port.css'",
    "'landing-hero-field-v4.css', 'passkey-auth.css', 'deployed-route-cohesion.css', 'v0-public-port.css'"
  ]
];

for (const [retiredContract, currentContract] of replacements) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Intelligence release v2 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 120)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

if (source.includes('A local visual file loads after the passkey-specific final authority.')) {
  throw new Error('Intelligence release v2 still treats passkey styling as the final global visual authority.');
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
