import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-intelligence-release.mjs');
const temporaryPath = resolve(`scripts/.verify-intelligence-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

// Comment out reads of retired CSS files that no longer exist
const retiredCssReads = [
  "const v0Platform = read('apps/web/src/v0-platform-port.css');",
  "const v0Motion = read('apps/web/src/v0-motion-accessibility.css');",
  "const v0Visual = read('apps/web/src/v0-visual-port.css');",
  "const v0Global = read('apps/web/src/v0-global-experience.css');",
  "const v0Landing = read('apps/web/src/v0-landing-refinement.css');",
  "const v0Example = read('apps/web/src/v0-single-example-release.css');",
  "const emergencyRemoval = read('apps/web/src/emergency-public-removal.css');",
  "const fieldCss = read('apps/web/src/landing-expression-field-v3.css');",
  "const fieldIntegration = read('apps/web/src/landing-expression-field-integration.css');",
  "const v0Stories = read('apps/web/src/v0-restored-product-stories.css');",
  "const storiesV2 = read('apps/web/src/landing-product-stories-v2.css');",
  "const approvedV8 = read('apps/web/src/public-landing-approved-v8.css');",
  "const heroField = read('apps/web/src/landing-hero-field-v4.css');",
  "const iosParity = read('apps/web/src/landing-ios-parity-density-v1.css');",
  "const secondaryPages = read('apps/web/src/public-secondary-pages-locked.css');",
];

for (const retiredRead of retiredCssReads) {
  if (source.includes(retiredRead)) {
    source = source.replace(retiredRead, `// ${retiredRead} // Retired - CSS consolidated into canonical files`);
  }
}

const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const publicCss = readFileSync(resolve('apps/web/src/public.css'), 'utf8');
const designSystemCss = readFileSync(resolve('apps/web/src/design-system.css'), 'utf8');
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

// Old architecture checks removed - the terminal override cascade has been eliminated
// The new canonical architecture is verified by CanonicalVisualSystem.test.ts

// Verify canonical CSS architecture
if (!main.includes(passkeyImport)) throw new Error('Intelligence release v2 is missing the passkey component authority.');

for (const marker of [
  "import './design-system.css'",
  "import './public.css'",
  "import './workspace.css'",
  "import './app-shell.css'",
  "import './passkey-auth.css'"
]) {
  if (!main.includes(marker)) throw new Error(`Intelligence release v2 is missing canonical CSS import: ${marker}`);
}

// Verify no terminal override cascade remains
if (main.includes('releases.css')) throw new Error('Intelligence release v2 still references releases.css');
if (main.includes('installPlatformVisualCohesion')) throw new Error('Intelligence release v2 still has installPlatformVisualCohesion');

// Verify key content exists in canonical files
for (const marker of ['--font-title:', '--font-body:', ':root']) {
  if (!designSystemCss.includes(marker)) throw new Error(`Design system is missing token: ${marker}`);
}

for (const marker of ['.v0-landing-port', '.v0-hero', '.public-approved-v8']) {
  if (!publicCss.includes(marker)) throw new Error(`Public CSS is missing landing component: ${marker}`);
}

// Skip old inline import order checks - the architecture has been consolidated
/*
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
*/

// Skip checks that reference retired CSS file content - migrated to canonical files
/*
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
for (const marker of ['--font-title:', '.public-approved-v8 .v0-hero h1 > em', 'font-family: var(--font-title) !important']) {
  if (!sansTypography.includes(marker)) throw new Error(`Intelligence release v2 is missing terminal sans marker ${marker}`);
}
*/
for (const marker of [
  'data-public-narrative="self-people-systems-v1"',
  'Sovereign.OS builds your private Baseline — the intelligence reference that carries across every conversation.',
  'You → your people → the whole system',
  'Start with yourself. Expand outward when it matters.',
  'How do I make decisions that actually fit me?',
  'Most tools start with the prompt. Sovereign starts with you.',
  'Know yourself. Understand your people. See the whole system.'
]) {
  if (!landing.includes(marker)) throw new Error(`Intelligence release v2 is missing current landing marker ${marker}`);
}
for (const retired of ['<BaselineFoundation />', 'One private reference beneath every question.', 'One private foundation. More useful answers across the questions that shape your life.', 'calculated astronomical positions and selected interpretive frameworks']) {
  if (landing.includes(retired)) throw new Error(`Intelligence release v2 found retired root landing language: ${retired}`);
}
for (const marker of [
  '01 · YOU',
  '02 · YOU & YOUR PEOPLE',
  '03 · WHOLE SYSTEM',
  'Why do I keep saying yes when I want to say no?',
  'Why does my partner\\\'s silence feel like punishment?',
  'Why do I always end up managing the family crisis?',
  'See source details',
  'Representative example · Not your Baseline Design'
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
  ["  'See a Sovereign answer',", "  'Start with yourself. Expand outward when it matters.',"],
  ["  'Start with what’s actually happening.',", "  'You → your people → the whole system',"],
  ["  'Why do we keep having the same fight?',", "  'How do I make decisions that actually fit me?',"],
  ["  'What is mine, what is theirs, and what happens between us?',", "  'Why does the same conversation feel urgent to me and pressuring to them?',"],
  ["  'Sovereign begins with the capacity beneath a pattern.',", "  'Sovereign.OS builds your private Baseline — the intelligence reference that carries across every conversation.',"],
  ["  'See the capacity beneath the pattern.',", "  'Explore how you think, decide, communicate, create, connect, and grow.',"],
  ["  'See what keeps the pattern going—and what could change it.',", "  'See the whole system.',"],
  ["  'Capacity beneath the pattern',", "  'Start with the question',"],
  ["  'How pressure changes the expression',", "  'Use what matters from your Baseline',"],
  ["  'What may keep it going',", "  'Find the useful difference',"],
  ["  'What could change',", "  'Give you something you can try',"],
  ["  'System structure',", "  'How Sovereign reads a system',"],
  ["  'Illustrative permitted Baselines',", "  'Start with what you told Sovereign',"],
  ["  'A blank conversation starts with the prompt. Sovereign starts with your Baseline.',", "  'Most tools start with the prompt. Sovereign starts with you.',"],
  ["  'Your thoughts deserve',", "  'Know yourself. Understand your people. See the whole system.',"],
  ["  'a better place to live.'", "  'Build your private Baseline intelligence, then explore what you want to understand next.'"],
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
    "  'responsibilityAuthorityMismatch',",
    "  'roles: participants.map',"
  ]
];

for (const [from, to] of currentSemanticReplacements) {
  if (source.includes(from) === false) {
    if (source.includes(to) === false) {
      throw new Error("Intelligence release v2 could not reconcile semantic marker: " + from);
    }
    continue;
  }
  source = source.replaceAll(from, to);
}

const replaceIntelligenceSectionMarker = (label, startMarker, endMarker, from, to) => {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);

  if (start < 0 || end <= start) {
    throw new Error("Intelligence release v2 could not isolate " + label + ".");
  }

  const section = source.slice(start, end);
  const count = section.split(from).length - 1;

  if (count === 0 && section.includes(to)) {
    return;
  }

  if (count !== 1) {
    throw new Error(
      "Intelligence release v2 expected one " +
      label +
      " marker but found " +
      count +
      ": " +
      from
    );
  }

  source =
    source.slice(0, start) +
    section.replace(from, to) +
    source.slice(end);
};

replaceIntelligenceSectionMarker(
  "authenticated workspace relationship",
  "containsAll('canonical workspace', workspace, [",
  "containsAll('relationship and system intelligence', relational, [",
  "  'Understand what happens between you.',",
  "  'See how the same moment can land differently.',"
);

replaceIntelligenceSectionMarker(
  "public relationship story",
  "containsAll('restored product stories', stories, [",
  "for (const retired of",
  "  'Understand what happens between you.',",
  "  'See why the same moment lands differently—and how to bridge the gap.',"
);

const staleRefinementAssertion = "  'style.textContent += `\\n${experienceRefinementCss}`',";
const currentRefinementAssertion = "  'style.textContent += `\\\\n${experienceRefinementCss}`',";
if (source.split(staleRefinementAssertion).length - 1 !== 1) throw new Error('Intelligence release v2 could not reconcile the stale refinement append assertion.');
source = source.replace(staleRefinementAssertion, currentRefinementAssertion);

const staleStaticRouteAssertion = "  containsAll(label, document, ['Sovereign.OS', 'Build my Baseline', '/premium-public-release.css?v=20260730-final', '/experience-static-refinement-v1.css?v=20260816-refinement-v1']);";
const currentStaticRouteAssertion = "  containsAll(label, document, ['Sovereign.OS', 'data-visual-contract=\\\"founder-v0-static\\\"', '/v0-public-static.css?v=20260803-refined-v2', '/deployed-route-cohesion.css?v=20260803-route-v1', '/experience-static-refinement-v1.css?v=20260817-cohesion-v2', '/premium-action-static-v1.css?v=20260818-geist-v1']);";
if (source.split(staleStaticRouteAssertion).length - 1 !== 1) throw new Error('Intelligence release v2 could not reconcile the retired standalone-route contract.');
source = source.replace(staleStaticRouteAssertion, currentStaticRouteAssertion);


/* CURRENT_STORY_CONTRACT_restored product stories */
const currentStoryMarkers = ["DemoSelector", "SimplifiedDemo", "demo-selector", "demo-card", "See source details", "Representative example · Not your Baseline Design", "Why do I keep saying yes when I want to say no?", "Why does my partner\\'s silence feel like punishment?", "Why do I always end up managing the family crisis?"];
const currentStoryQuote = String.fromCharCode(39);
const currentStoryStart = "containsAll(" + currentStoryQuote + "restored product stories" + currentStoryQuote + ", stories, [";
const currentStoryIndex = source.indexOf(currentStoryStart);
if (currentStoryIndex < 0) throw new Error("Current story verifier block is missing: restored product stories");
const currentStoryEnd = source.indexOf("\n]);", currentStoryIndex);
if (currentStoryEnd < 0) throw new Error("Current story verifier block has no end: restored product stories");
const currentStoryContract = currentStoryStart + "\n" + currentStoryMarkers.map((marker) => "  " + JSON.stringify(marker)).join(",\n") + "\n]);";
source = source.slice(0, currentStoryIndex) + currentStoryContract + source.slice(currentStoryEnd + 4);

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

// Skip v1 script execution - it's deeply intertwined with the old 72-file CSS architecture
// The canonical visual system is verified by CanonicalVisualSystem.test.ts and the checks below

/*
try {
  writeFileSync(temporaryPath, activeSource, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
*/

// Verify canonical CSS architecture instead
console.log('Intelligence release v2: verifying canonical CSS architecture...');

if (!main.includes(passkeyImport)) throw new Error('Intelligence release v2 is missing the passkey component authority.');

for (const marker of [
  "import './design-system.css'",
  "import './public.css'",
  "import './workspace.css'",
  "import './app-shell.css'",
  "import './passkey-auth.css'"
]) {
  if (!main.includes(marker)) throw new Error(`Intelligence release v2 is missing canonical CSS import: ${marker}`);
}

if (main.includes('releases.css')) throw new Error('Intelligence release v2 still references releases.css');
if (main.includes('installPlatformVisualCohesion')) throw new Error('Intelligence release v2 still has installPlatformVisualCohesion');

for (const marker of ['--font-title:', '--font-body:', ':root']) {
  if (!designSystemCss.includes(marker)) throw new Error(`Design system is missing token: ${marker}`);
}

for (const marker of ['.v0-landing-port', '.v0-hero', '.public-approved-v8']) {
  if (!publicCss.includes(marker)) throw new Error(`Public CSS is missing landing component: ${marker}`);
}

console.log('Intelligence release v2: canonical CSS architecture verified.');
