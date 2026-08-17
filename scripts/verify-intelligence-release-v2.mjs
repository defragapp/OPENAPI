import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-intelligence-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');
const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const renderedFidelity = readFileSync(resolve('apps/web/src/rendered-fidelity-v1.css'), 'utf8');
const landingRefinement = readFileSync(resolve('apps/web/src/landing-refinement-v2.css'), 'utf8');

const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
const refinementImport = "import experienceRefinementCss from './experience-refinement-v1.css?inline';";
const refinementAppend = 'style.textContent += `\\n${experienceRefinementCss}`;';
const fidelityImport = "import renderedFidelityCss from './rendered-fidelity-v1.css?inline';";
const fidelityAppend = 'style.textContent += `\\n${renderedFidelityCss}`;';
const landingRefinementImport = "import landingRefinementV2Css from './landing-refinement-v2.css?inline';";
const landingRefinementAppend = 'style.textContent += `\\n${landingRefinementV2Css}`;';
const invitationAppend = 'style.textContent += `\\n${invitationRenderedFidelityCss}`;';
const retiredFingerprintOutput = '\n  sequenceFingerprint,\n';

if (!main.includes(routeCohesionImport)) throw new Error('Intelligence release v2 is missing deployed route cohesion.');
if (!main.includes(passkeyImport)) throw new Error('Intelligence release v2 is missing the passkey visual authority.');
if (main.indexOf(routeCohesionImport) >= main.indexOf(passkeyImport)) throw new Error('Intelligence release v2 places route cohesion after the final passkey stylesheet authority.');
if (!main.includes(refinementImport) || !main.includes(refinementAppend)) throw new Error('Intelligence release v2 is missing the bounded experience refinement authority.');
if (!main.includes(fidelityImport) || !main.includes(fidelityAppend)) throw new Error('Intelligence release v2 is missing the rendered fidelity authority.');
if (!main.includes(landingRefinementImport) || !main.includes(landingRefinementAppend)) throw new Error('Intelligence release v2 is missing landing refinement v2.');
if (main.indexOf(fidelityAppend) <= main.indexOf(refinementAppend)) throw new Error('Intelligence release v2 does not place rendered fidelity after experience refinement.');
if (main.indexOf(landingRefinementAppend) <= main.indexOf(fidelityAppend)) throw new Error('Intelligence release v2 does not place landing refinement v2 after rendered fidelity.');
if (main.includes(invitationAppend) && main.indexOf(invitationAppend) <= main.indexOf(landingRefinementAppend)) throw new Error('Intelligence release v2 places Invitation fidelity before landing refinement v2.');

for (const marker of ['--v8-blue: #d8d0c5 !important', "radialGradient[id$='-sphere-fill']", 'padding: 54px 0 !important']) {
  if (!renderedFidelity.includes(marker)) throw new Error(`Intelligence release v2 is missing rendered fidelity marker ${marker}`);
}
for (const marker of [
  '.landing-expression-slice__tooltip-panel',
  'width: 132px !important',
  '.landing-workflow__progress',
  '@keyframes sovereign-system-route',
  'scroll-snap-type: inline mandatory !important'
]) {
  if (!landingRefinement.includes(marker)) throw new Error(`Intelligence release v2 is missing landing refinement marker ${marker}`);
}
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) throw new Error('Intelligence release v2 found a local stylesheet import after the passkey authority.');
if (source.split(retiredFingerprintOutput).length - 1 !== 1) throw new Error('Intelligence release v2 could not isolate the historical sequence fingerprint output.');

const languageReplacements = [
  ["  'Sovereign begins with the capacity beneath a pattern.',", "  'Sovereign uses your Baseline to help make sense of real questions about yourself, relationships, decisions, and family or group dynamics.',"],
  ["  'See the capacity beneath the pattern.',", "  'Separate helping from carrying the outcome.',"],
  ["  'See what keeps the pattern going—and what could change it.',", "  'See where responsibility keeps landing.',"],
  ["  'Capacity beneath the pattern',", "  'What your Baseline supports',"],
  ["  'How pressure changes the expression',", "  'What changes under pressure',"],
  ["  'What may keep it going',", "  'Where responsibility shifts',"],
  ["  'What could change',", "  'A cleaner boundary',"],
  ["  'System structure',", "  'What Sovereign separates',"],
  ["  'Illustrative permitted Baselines',", "  'Illustrative supplied context',"]
];
for (const [from, to] of languageReplacements) {
  if (source.split(from).length - 1 !== 1) throw new Error(`Intelligence release v2 could not reconcile historical marker: ${from}`);
  source = source.replace(from, to);
}

// The historical verifier accidentally encoded the main.tsx template-literal newline
// as a runtime newline. Reconcile only that assertion; main.tsx remains authoritative.
const staleRefinementAssertion = "  'style.textContent += `\\n${experienceRefinementCss}`',";
const currentRefinementAssertion = "  'style.textContent += `\\\\n${experienceRefinementCss}`',";
if (source.split(staleRefinementAssertion).length - 1 !== 1) throw new Error('Intelligence release v2 could not reconcile the stale refinement append assertion.');
source = source.replace(staleRefinementAssertion, currentRefinementAssertion);

const activeSource = source.replace(retiredFingerprintOutput, '\n');

for (const retired of [
  'Illustrative permitted Baselines',
  'Sovereign begins with the capacity beneath a pattern.',
  'See the capacity beneath the pattern.',
  'Capacity beneath the pattern',
  'How pressure changes the expression',
  'System structure'
]) {
  if (activeSource.includes(retired)) throw new Error(`Intelligence release v2 still enforces retired public language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, activeSource, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
