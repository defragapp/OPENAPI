import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-visual-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-visual-intelligence-release-v2-${process.pid}.mjs`);
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

for (const marker of [
  "import './deployed-route-cohesion.css';",
  "import './passkey-auth.css';",
  "import experienceRefinementCss from './experience-refinement-v1.css?inline';",
  "import renderedFidelityCss from './rendered-fidelity-v1.css?inline';",
  "import landingRefinementV2Css from './landing-refinement-v2.css?inline';",
  "import landingLiveRefinementV5Css from './landing-live-refinement-v5.css?inline';",
  "import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';",
  'style.textContent += `\\n${experienceRefinementCss}`;',
  'style.textContent += `\\n${renderedFidelityCss}`;',
  'style.textContent += `\\n${landingRefinementV2Css}`;',
  'style.textContent += `\\n${landingLiveRefinementV5Css}`;',
  'style.textContent += `\\n${sansTypographyAuthorityCss}`;'
]) {
  if (!main.includes(marker)) throw new Error(`Visual intelligence release v2 is missing ${marker}`);
}
if (main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;') <= main.indexOf('style.textContent += `\\n${experienceRefinementCss}`;')) throw new Error('Visual intelligence release v2 does not place rendered fidelity after experience refinement.');
if (main.indexOf('style.textContent += `\\n${landingRefinementV2Css}`;') <= main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;')) throw new Error('Visual intelligence release v2 does not place landing refinement v2 after rendered fidelity.');
if (main.indexOf('style.textContent += `\\n${landingLiveRefinementV5Css}`;') <= main.indexOf('style.textContent += `\\n${landingLiveRefinementV4Css}`;')) throw new Error('Visual intelligence release v2 does not place landing refinement v5 after v4.');
if (main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;') <= main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;')) throw new Error('Visual intelligence release v2 does not place sans typography last.');

for (const marker of [
  '--v8-blue: #d8d0c5 !important',
  "radialGradient[id$='-sphere-fill']",
  'filter: saturate(0.08) contrast(1.05) brightness(0.96) !important',
  '.public-approved-v8 .landing-demo {',
  'padding: 54px 0 !important'
]) if (!renderedFidelity.includes(marker)) throw new Error(`Visual intelligence release v2 is missing rendered fidelity marker ${marker}`);

for (const marker of [
  '.landing-workflow__progress',
  'grid-template-columns: minmax(0, 1.34fr) minmax(320px, 0.66fr) !important',
  '@keyframes sovereign-system-route',
  'scroll-snap-type: inline mandatory !important'
]) if (!landingRefinement.includes(marker)) throw new Error(`Visual intelligence release v2 is missing landing refinement marker ${marker}`);

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
]) if (!landingRefinementV5.includes(marker)) throw new Error(`Visual intelligence release v2 is missing landing refinement v5 marker ${marker}`);
if (landingRefinementV5.includes('var(--font-display, Georgia, serif)')) throw new Error('Visual intelligence release v2 found the retired display serif.');
if (landingRefinementV5.includes('.landing-baseline-intro')) throw new Error('Visual intelligence release v2 found the retired root Baseline intro styling.');
if (typography.includes('font-family: "Sovereign Display"') || typography.includes('/fonts/sovereign-display.woff2')) throw new Error('Visual intelligence release v2 found active Sovereign Display typography.');
for (const marker of ['--font-display: var(--font-title);', '.public-approved-v8 .v0-hero h1 > em', 'font-family: var(--font-title) !important']) {
  if (!`${typography}\n${sansTypography}`.includes(marker)) throw new Error(`Visual intelligence release v2 is missing sans typography marker ${marker}`);
}

for (const marker of [
  'data-public-narrative="self-people-systems-v1"',
  'Start with you',
  'Explore yourself.',
  'What does Alignment look like for me?',
  'Most AI starts with the prompt. Sovereign starts with you.',
  'Know yourself. Understand your people. See the whole system.'
]) if (!landing.includes(marker)) throw new Error(`Visual intelligence release v2 is missing current landing marker ${marker}`);
for (const retired of ['<BaselineFoundation />', 'One private reference beneath every question.', 'One private foundation. More useful answers across the questions that shape your life.', 'calculated astronomical positions and selected interpretive frameworks']) {
  if (landing.includes(retired)) throw new Error(`Visual intelligence release v2 found retired landing language ${retired}`);
}
for (const marker of ['01 · You', 'Explore how you think, decide, create, connect, and grow.', '02 · You + your people', '03 · From 1:1 to the whole system', 'See the whole system.']) {
  if (!stories.includes(marker)) throw new Error(`Visual intelligence release v2 is missing story marker ${marker}`);
}
for (const retired of ['Separate helping from carrying the outcome.', 'See where responsibility keeps landing.']) {
  if (stories.includes(retired)) throw new Error(`Visual intelligence release v2 found retired category framing ${retired}`);
}

for (const marker of [
  "data-inspecting={hasInspection ? 'true' : 'false'}",
  'setHasInspection(true)',
  'const TOOLTIP_WIDTH = 104',
  'const TOOLTIP_HEIGHT = 26',
  'click a line to inspect it'
]) if (!field.includes(marker)) throw new Error(`Visual intelligence release v2 is missing click-led field marker ${marker}`);
if (field.includes('onPointerEnter={() => selectAxis(axis.id)}')) throw new Error('Visual intelligence release v2 found hover-driven field inspection.');

const routeCohesionImport = "import './deployed-route-cohesion.css';";
const passkeyImport = "import './passkey-auth.css';";
const retiredFingerprintOutput = '\n  sequenceFingerprint,\n';
if (main.indexOf(routeCohesionImport) >= main.indexOf(passkeyImport)) throw new Error('Visual intelligence release v2 places route cohesion after the passkey component authority.');
if (main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './")) throw new Error('Visual intelligence release v2 found a local stylesheet import after passkey component styling.');
if (source.split(retiredFingerprintOutput).length - 1 !== 1) throw new Error('Visual intelligence release v2 could not isolate the historical sequence fingerprint output.');

const replacements = [
  ["  'See a Sovereign answer',", "  'Explore yourself.',"],
  ["  'Start with what’s actually happening.',", "  'Start with you',"],
  ["  'Why do we keep having the same fight?',", "  'What does Alignment look like for me?',"],
  ["  'Sovereign begins with the capacity beneath a pattern.',", "  'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',"],
  ["  'Generic AI',", "  'Most AI starts with the prompt. Sovereign starts with you.',"],
  ["  'Capacity beneath the pattern',", "  'How you tend to create',"],
  ["  'How pressure changes the expression',", "  'What changes under pressure',"],
  ["  'What may keep it going',", "  'What feels aligned',"],
  ["  'What could change',", "  'What to explore next',"],
  ["  'System structure',", "  'Seeing the whole system',"],
  ["  'Illustrative permitted Baselines',", "  'Illustrative supplied context',"],
  ["  '/experience-static-refinement-v1.css?v=20260816-refinement-v1',", "  '/experience-static-refinement-v1.css?v=20260817-cohesion-v2',\n  '/premium-action-static-v1.css?v=20260817-action-v1',"],
  ["  'Build my Baseline',", "  'Get started',"]
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
  'System structure',
  'One private foundation. More useful answers across the questions that shape your life.',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.'
]) if (activeSource.includes(retired)) throw new Error(`Visual intelligence release v2 still enforces retired active language: ${retired}`);

try {
  writeFileSync(temporaryPath, activeSource, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
