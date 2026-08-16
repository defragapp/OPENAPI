import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-intelligence-release-v2-${process.pid}.mjs`);
const source = readFileSync(sourcePath, 'utf8');
const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');

const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
const refinementImport = "import experienceRefinementCss from './experience-refinement-v1.css?inline';";
const refinementAppend = 'style.textContent += `\\n${experienceRefinementCss}`;';

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
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) {
  throw new Error('Intelligence release v2 found a local stylesheet import after the passkey authority.');
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
