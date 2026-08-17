import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-intelligence-release-v2-${process.pid}.mjs`);
const source = readFileSync(sourcePath, 'utf8');
const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const renderedFidelity = readFileSync(resolve('apps/web/src/rendered-fidelity-v1.css'), 'utf8');

const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
const refinementImport = "import experienceRefinementCss from './experience-refinement-v1.css?inline';";
const refinementAppend = 'style.textContent += `\\n${experienceRefinementCss}`;';
const fidelityImport = "import renderedFidelityCss from './rendered-fidelity-v1.css?inline';";
const fidelityAppend = 'style.textContent += `\\n${renderedFidelityCss}`;';
const retiredFingerprintOutput = '\n  sequenceFingerprint,\n';

if (!main.includes(routeCohesionImport)) {
  throw new Error('Intelligence release v2 is missing deployed route cohesion.');
}
if (!main.includes(passkeyImport)) {
  throw new Error('Intelligence release v2 is missing the passkey visual authority.');
}
if (main.indexOf(routeCohesionImport) >= main.indexOf(passkeyImport)) {
  throw new Error('Intelligence release v2 places route cohesion after the final passkey stylesheet authority.');
}
if (!main.includes(refinementImport) || !main.includes(refinementAppend)) {
  throw new Error('Intelligence release v2 is missing the bounded experience refinement authority.');
}
if (!main.includes(fidelityImport) || !main.includes(fidelityAppend)) {
  throw new Error('Intelligence release v2 is missing the rendered fidelity authority.');
}
if (main.indexOf(fidelityAppend) <= main.indexOf(refinementAppend)) {
  throw new Error('Intelligence release v2 does not place rendered fidelity after experience refinement.');
}
for (const marker of ['--v8-blue: #d8d0c5 !important', "radialGradient[id$='-sphere-fill']", 'padding: 54px 0 !important']) {
  if (!renderedFidelity.includes(marker)) throw new Error(`Intelligence release v2 is missing rendered fidelity marker ${marker}`);
}
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) {
  throw new Error('Intelligence release v2 found a local stylesheet import after the passkey authority.');
}
if (source.split(retiredFingerprintOutput).length - 1 !== 1) {
  throw new Error('Intelligence release v2 could not isolate the historical sequence fingerprint output.');
}
const activeSource = source.replace(retiredFingerprintOutput, '\n');

try {
  writeFileSync(temporaryPath, activeSource, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}