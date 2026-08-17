import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-visual-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-visual-intelligence-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');
const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const renderedFidelity = readFileSync(resolve('apps/web/src/rendered-fidelity-v1.css'), 'utf8');
const landingRefinement = readFileSync(resolve('apps/web/src/landing-refinement-v2.css'), 'utf8');

for (const marker of [
  "import './deployed-route-cohesion.css';",
  "import './passkey-auth.css';",
  "import experienceRefinementCss from './experience-refinement-v1.css?inline';",
  "import renderedFidelityCss from './rendered-fidelity-v1.css?inline';",
  "import landingRefinementV2Css from './landing-refinement-v2.css?inline';",
  'style.textContent += `\\n${experienceRefinementCss}`;',
  'style.textContent += `\\n${renderedFidelityCss}`;',
  'style.textContent += `\\n${landingRefinementV2Css}`;'
]) {
  if (!main.includes(marker)) throw new Error(`Visual intelligence release v2 is missing ${marker}`);
}
if (main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;') <= main.indexOf('style.textContent += `\\n${experienceRefinementCss}`;')) {
  throw new Error('Visual intelligence release v2 does not place rendered fidelity after experience refinement.');
}
if (main.indexOf('style.textContent += `\\n${landingRefinementV2Css}`;') <= main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;')) {
  throw new Error('Visual intelligence release v2 does not place landing refinement v2 after rendered fidelity.');
}
for (const marker of [
  '--v8-blue: #d8d0c5 !important',
  "radialGradient[id$='-sphere-fill']",
  'filter: saturate(0.08) contrast(1.05) brightness(0.96) !important',
  '.public-approved-v8 .landing-demo {',
  'padding: 54px 0 !important'
]) {
  if (!renderedFidelity.includes(marker)) throw new Error(`Visual intelligence release v2 is missing rendered fidelity marker ${marker}`);
}
for (const marker of [
  '.landing-expression-slice__tooltip-panel',
  'width: 132px !important',
  '.landing-workflow__progress',
  'grid-template-columns: minmax(0, 1.34fr) minmax(320px, 0.66fr) !important',
  '@keyframes sovereign-system-route',
  'scroll-snap-type: inline mandatory !important'
]) {
  if (!landingRefinement.includes(marker)) throw new Error(`Visual intelligence release v2 is missing landing refinement marker ${marker}`);
}

const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
const retiredFingerprintOutput = '\n  sequenceFingerprint,\n';
if (main.indexOf(routeCohesionImport) >= main.indexOf(passkeyImport)) throw new Error('Visual intelligence release v2 places route cohesion after the final passkey stylesheet authority.');
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) throw new Error('Visual intelligence release v2 found a local stylesheet import after passkey authority.');
if (source.split(retiredFingerprintOutput).length - 1 !== 1) throw new Error('Visual intelligence release v2 could not isolate the historical sequence fingerprint output.');

const replacements = [
  ["  'Sovereign begins with the capacity beneath a pattern.',", "  'Sovereign uses your Baseline to help make sense of real questions about yourself, relationships, decisions, and family or group dynamics.',"],
  ["  'Generic AI',", "  'A blank conversation starts with the prompt. Sovereign starts with your Baseline.',"],
  ["  'Capacity beneath the pattern',", "  'What your Baseline supports',"],
  ["  'How pressure changes the expression',", "  'What changes under pressure',"],
  ["  'What may keep it going',", "  'Where responsibility shifts',"],
  ["  'What could change',", "  'A cleaner boundary',"],
  ["  'System structure',", "  'What Sovereign separates',"],
  ["  'Illustrative permitted Baselines',", "  'Illustrative supplied context',"]
];
for (const [retiredMarker, currentMarker] of replacements) {
  const occurrences = source.split(retiredMarker).length - 1;
  if (occurrences !== 1) throw new Error(`Visual intelligence release v2 expected one retired marker but found ${occurrences}: ${retiredMarker}`);
  source = source.replace(retiredMarker, currentMarker);
}
const activeSource = source.replace(retiredFingerprintOutput, '\n');

for (const retired of [
  "'Generic AI',",
  'Illustrative permitted Baselines',
  'Sovereign begins with the capacity beneath a pattern.',
  'Capacity beneath the pattern',
  'How pressure changes the expression',
  'System structure'
]) {
  if (activeSource.includes(retired)) throw new Error(`Visual intelligence release v2 still enforces retired active language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, activeSource, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
