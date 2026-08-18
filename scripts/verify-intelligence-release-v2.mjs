import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-intelligence-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');
const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const renderedFidelity = readFileSync(resolve('apps/web/src/rendered-fidelity-v1.css'), 'utf8');
const landingRefinement = readFileSync(resolve('apps/web/src/landing-refinement-v2.css'), 'utf8');
const landingRefinementV5 = readFileSync(resolve('apps/web/src/landing-live-refinement-v5.css'), 'utf8');
const sansTypography = readFileSync(resolve('apps/web/src/sans-typography-authority-v1.css'), 'utf8');
const typography = readFileSync(resolve('apps/web/src/typography-system.css'), 'utf8');
const landing = readFileSync(resolve('apps/web/src/PublicLanding.tsx'), 'utf8');
const stories = readFileSync(resolve('apps/web/src/LandingProductStories.tsx'), 'utf8');
const field = readFileSync(resolve('apps/web/src/expression-field/LandingExpressionSlice.tsx'), 'utf8');

const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
const refinementImport = "import experienceRefinementCss from './experience-refinement-v1.css?inline';";
const refinementAppend = 'style.textContent += `\\n${experienceRefinementCss}`;';
const fidelityImport = "import renderedFidelityCss from './rendered-fidelity-v1.css?inline';";
const fidelityAppend = 'style.textContent += `\\n${renderedFidelityCss}`;';
const landingRefinementImport = "import landingRefinementV2Css from './landing-refinement-v2.css?inline';";
const landingRefinementAppend = 'style.textContent += `\\n${landingRefinementV2Css}`;';
const landingRefinementV5Import = "import landingLiveRefinementV5Css from './landing-live-refinement-v5.css?inline';";
const landingRefinementV5Append = 'style.textContent += `\\n${landingLiveRefinementV5Css}`;';
const premiumActionAppend = 'style.textContent += `\\n${premiumActionAuthorityCss}`;';
const sansTypographyImport = "import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';";
const sansTypographyAppend = 'style.textContent += `\\n${sansTypographyAuthorityCss}`;';
const invitationAppend = 'style.textContent += `\\n${invitationRenderedFidelityCss}`;';
const retiredFingerprintOutput = '\n  sequenceFingerprint,\n';

if (!main.includes(routeCohesionImport)) throw new Error('Intelligence release v2 is missing deployed route cohesion.');
if (!main.includes(passkeyImport)) throw new Error('Intelligence release v2 is missing the passkey component authority.');
if (main.indexOf(routeCohesionImport) >= main.indexOf(passkeyImport)) throw new Error('Intelligence release v2 places route cohesion after passkey component styling.');
if (!main.includes(refinementImport) || !main.includes(refinementAppend)) throw new Error('Intelligence release v2 is missing the bounded experience refinement authority.');
if (!main.includes(fidelityImport) || !main.includes(fidelityAppend)) throw new Error('Intelligence release v2 is missing the rendered fidelity authority.');
if (!main.includes(landingRefinementImport) || !main.includes(landingRefinementAppend)) throw new Error('Intelligence release v2 is missing landing refinement v2.');
if (!main.includes(landingRefinementV5Import) || !main.includes(landingRefinementV5Append)) throw new Error('Intelligence release v2 is missing landing refinement v5.');
if (!main.includes(sansTypographyImport) || !main.includes(sansTypographyAppend)) throw new Error('Intelligence release v2 is missing terminal sans typography authority.');
if (main.indexOf(fidelityAppend) <= main.indexOf(refinementAppend)) throw new Error('Intelligence release v2 does not place rendered fidelity after experience refinement.');
if (main.indexOf(landingRefinementAppend) <= main.indexOf(fidelityAppend)) throw new Error('Intelligence release v2 does not place landing refinement v2 after rendered fidelity.');
if (main.indexOf(landingRefinementV5Append) <= main.indexOf('style.textContent += `\\n${landingLiveRefinementV4Css}`;')) throw new Error('Intelligence release v2 does not place landing refinement v5 after v4.');
if (main.includes(invitationAppend) && main.indexOf(invitationAppend) <= main.indexOf(landingRefinementV5Append)) throw new Error('Intelligence release v2 places Invitation fidelity before landing refinement v5.');
if (main.indexOf(sansTypographyAppend) <= main.indexOf(premiumActionAppend)) throw new Error('Intelligence release v2 does not place sans typography after the terminal action authority.');

for (const marker of ['--v8-blue: #d8d0c5 !important', "radialGradient[id$='-sphere-fill']", 'padding: 54px 0 !important']) {
  if (!renderedFidelity.includes(marker)) throw new Error(`Intelligence release v2 is missing rendered fidelity marker ${marker}`);
}
for (const marker of [
  '.landing-workflow__progress',
  '@keyframes sovereign-system-route',
  'scroll-snap-type: inline mandatory !important'
]) {
  if (!landingRefinement.includes(marker)) throw new Error(`Intelligence release v2 is missing landing refinement marker ${marker}`);
}
for (const marker of [
  'One typeface. Hierarchy comes from weight, scale, and opacity.',
  '.v0-hero h1 > span',
  '.v0-hero h1 > em',
  'font-family: inherit !important',
  '@keyframes sovereign-hero-rise',
  '@keyframes sovereign-field-arrive',
  '.landing-expression-slice__tooltip-panel',
  'width: 104px !important',
  'height: 26px !important',
  '@media (prefers-reduced-motion: reduce)'
]) {
  if (!landingRefinementV5.includes(marker)) throw new Error(`Intelligence release v2 is missing landing refinement v5 marker ${marker}`);
}
if (landingRefinementV5.includes('var(--font-display, Georgia, serif)')) throw new Error('Intelligence release v2 found the retired display-serif landing treatment.');
if (landingRefinementV5.includes('.landing-baseline-intro')) throw new Error('Intelligence release v2 found the retired root Baseline intro styling.');
if (typography.includes('font-family: "Sovereign Display"') || typography.includes('/fonts/sovereign-display.woff2')) throw new Error('Intelligence release v2 found active Sovereign Display typography.');
for (const marker of ['--font-display: var(--font-title);', '--serif: var(--font-title);', 'font-family: var(--font-title) !important']) {
  if (!typography.includes(marker)) throw new Error(`Intelligence release v2 is missing typography marker ${marker}`);
}
for (const marker of ['Rejected legacy display faces must not render in active titles.', '.public-approved-v8 .v0-hero h1 > em', 'font-family: var(--font-title) !important']) {
  if (!sansTypography.includes(marker)) throw new Error(`Intelligence release v2 is missing terminal sans marker ${marker}`);
}
for (const marker of [
  'data-public-narrative="self-people-systems-v1"',
  'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
  'Start with you',
  'Explore yourself.',
  'What does Alignment look like for me?',
  'Most AI starts with the prompt. Sovereign starts with you.',
  'Know yourself. Understand your people. See the whole system.'
]) {
  if (!landing.includes(marker)) throw new Error(`Intelligence release v2 is missing current landing marker ${marker}`);
}
for (const retired of ['<BaselineFoundation />', 'One private reference beneath every question.', 'One private foundation. More useful answers across the questions that shape your life.', 'calculated astronomical positions and selected interpretive frameworks']) {
  if (landing.includes(retired)) throw new Error(`Intelligence release v2 found retired root landing language: ${retired}`);
}
for (const marker of [
  '01 · You',
  'Explore how you think, decide, create, connect, and grow.',
  '02 · You + your people',
  'Understand both sides and what happens between you.',
  '03 · From 1:1 to the whole system',
  'See the whole system.',
  'Roles',
  'Perspectives',
  'Responsibilities'
]) {
  if (!stories.includes(marker)) throw new Error(`Intelligence release v2 is missing product story marker ${marker}`);
}
for (const retired of ['Separate helping from carrying the outcome.', 'See where responsibility keeps landing.']) {
  if (stories.includes(retired)) throw new Error(`Intelligence release v2 found retired category framing: ${retired}`);
}
for (const marker of [
  "data-inspecting={hasInspection ? 'true' : 'false'}",
  'setHasInspection(true)',
  'click a line to inspect it',
  'const TOOLTIP_WIDTH = 104',
  'const TOOLTIP_HEIGHT = 26'
]) {
  if (!field.includes(marker)) throw new Error(`Intelligence release v2 is missing click-led field marker ${marker}`);
}
if (field.includes('onPointerEnter={() => selectAxis(axis.id)}')) throw new Error('Intelligence release v2 found hover-driven field inspection.');
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) throw new Error('Intelligence release v2 found a local stylesheet import after the passkey component authority.');
if (source.split(retiredFingerprintOutput).length - 1 !== 1) throw new Error('Intelligence release v2 could not isolate the historical sequence fingerprint output.');

const languageReplacements = [
  ["  'Look closer at the pattern.',", "  'Explore yourself more deeply.',"],
  ["  'See how the whole system functions.',", "  'See the whole system.',"],
  ["  'See a Sovereign answer',", "  'Explore yourself.',"],
  ["  'Start with what’s actually happening.',", "  'Start with you',"],
  ["  'Why do we keep having the same fight?',", "  'What does Alignment look like for me?',"],
  ["  'What is mine, what is theirs, and what happens between us?',", "  'Why does the same situation land differently for us?',"],
  ["  'Sovereign begins with the capacity beneath a pattern.',", "  'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',"],
  ["  'See the capacity beneath the pattern.',", "  'Explore how you think, decide, create, connect, and grow.',"],
  ["  'See what keeps the pattern going—and what could change it.',", "  'See the whole system.',"],
  ["  'Capacity beneath the pattern',", "  'How you tend to create',"],
  ["  'How pressure changes the expression',", "  'What changes under pressure',"],
  ["  'What may keep it going',", "  'What feels aligned',"],
  ["  'What could change',", "  'What to explore next',"],
  ["  'System structure',", "  'Seeing the whole system',"],
  ["  'Illustrative permitted Baselines',", "  'Illustrative supplied context',"],
  ["  'A blank conversation starts with the prompt. Sovereign starts with your Baseline.',", "  'Most AI starts with the prompt. Sovereign starts with you.',"],
  ["  'Your thoughts deserve',", "  'Know yourself. Understand your people. See the whole system.',"],
  ["  'a better place to live.'", "  'Start free. Build your Baseline, then explore what you want to understand next.'"],
];
for (const [from, to] of languageReplacements) {
  if (source.split(from).length - 1 !== 1) throw new Error(`Intelligence release v2 could not reconcile historical marker: ${from}`);
  source = source.replace(from, to);
}

const staleProhibitedLanding = "for (const prohibited of ['Know yourself.', 'Understand the system.', 'Choose what fits.', 'Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'generateAIResponse', 'Demo User']) {";
const currentProhibitedLanding = "for (const prohibited of ['Understand the system.', 'Choose what fits.', 'Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'generateAIResponse', 'Demo User']) {";

if (source.split(staleProhibitedLanding).length - 1 !== 1) {
  throw new Error('Intelligence release v2 could not reconcile the retired Know yourself rejection.');
}
source = source.replace(staleProhibitedLanding, currentProhibitedLanding);

const currentSemanticReplacements = [
  [
    "  'Understand what happens between you.',",
    "  'Understand both sides and what happens between you.',"
  ],
  [
    "  'responsibilityAuthorityMismatch',",
    "  'roles: participants.map',"
  ]
];
for (const [from, to] of currentSemanticReplacements) {
  if (!source.includes(from)) {
    if (!source.includes(to)) {
      throw new Error(`Intelligence release v2 could not reconcile current semantic marker: ${from}`);
    }
    continue;
  }
  source = source.replaceAll(from, to);
}

const staleRefinementAssertion = "  'style.textContent += `\\n${experienceRefinementCss}`',";
const currentRefinementAssertion = "  'style.textContent += `\\\\n${experienceRefinementCss}`',";
if (source.split(staleRefinementAssertion).length - 1 !== 1) throw new Error('Intelligence release v2 could not reconcile the stale refinement append assertion.');
source = source.replace(staleRefinementAssertion, currentRefinementAssertion);

const staleStaticRouteAssertion = "  containsAll(label, document, ['Sovereign.OS', 'Build my Baseline', '/premium-public-release.css?v=20260730-final', '/experience-static-refinement-v1.css?v=20260816-refinement-v1']);";
const currentStaticRouteAssertion = "  containsAll(label, document, ['Sovereign.OS', 'data-visual-contract=\\\"founder-v0-static\\\"', '/v0-public-static.css?v=20260803-refined-v2', '/deployed-route-cohesion.css?v=20260803-route-v1', '/experience-static-refinement-v1.css?v=20260817-cohesion-v2', '/premium-action-static-v1.css?v=20260817-action-v1']);";
if (source.split(staleStaticRouteAssertion).length - 1 !== 1) throw new Error('Intelligence release v2 could not reconcile the retired standalone-route contract.');
source = source.replace(staleStaticRouteAssertion, currentStaticRouteAssertion);

const activeSource = source.replace(retiredFingerprintOutput, '\n');

for (const retired of [
  'Illustrative permitted Baselines',
  'Sovereign begins with the capacity beneath a pattern.',
  'See the capacity beneath the pattern.',
  'Capacity beneath the pattern',
  'How pressure changes the expression',
  'System structure',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.',
  'One private foundation. More useful answers across the questions that shape your life.'
]) {
  if (activeSource.includes(retired)) throw new Error(`Intelligence release v2 still enforces retired public language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, activeSource, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
