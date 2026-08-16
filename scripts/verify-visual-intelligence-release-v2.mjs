import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-visual-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-visual-intelligence-release-v2-${process.pid}.mjs`);
const source = readFileSync(sourcePath, 'utf8');
const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');

for (const marker of [
  "import './deployed-route-cohesion.css';",
  "import './passkey-auth.css';",
  "import experienceRefinementCss from './experience-refinement-v1.css?inline';",
  'style.textContent += `\\n${experienceRefinementCss}`;'
]) {
  if (!main.includes(marker)) throw new Error(`Visual intelligence release v2 is missing ${marker}`);
}

const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
const retiredFingerprintOutput = '\n  sequenceFingerprint,\n';
if (main.indexOf(routeCohesionImport) >= main.indexOf(passkeyImport)) {
  throw new Error('Visual intelligence release v2 places route cohesion after the final passkey stylesheet authority.');
}
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) {
  throw new Error('Visual intelligence release v2 found a local stylesheet import after passkey authority.');
}
if (source.split(retiredFingerprintOutput).length - 1 !== 1) {
  throw new Error('Visual intelligence release v2 could not isolate the historical sequence fingerprint output.');
}
const activeSource = source.replace(retiredFingerprintOutput, '\n');

try {
  writeFileSync(temporaryPath, activeSource, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
