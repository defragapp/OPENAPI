import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-premium-platform-release.mjs');
const temporaryPath = resolve(`scripts/.verify-premium-platform-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');
const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const landing = readFileSync(resolve('apps/web/src/PublicLanding.tsx'), 'utf8');
const stories = readFileSync(resolve('apps/web/src/LandingProductStories.tsx'), 'utf8');
const field = readFileSync(resolve('apps/web/src/expression-field/LandingExpressionSlice.tsx'), 'utf8');
const landingRefinementV5 = readFileSync(resolve('apps/web/src/landing-live-refinement-v5.css'), 'utf8');
const typography = readFileSync(resolve('apps/web/src/typography-system.css'), 'utf8');
const sansTypography = readFileSync(resolve('apps/web/src/sans-typography-authority-v1.css'), 'utf8');

const replacements = [
  [
    "  'Why do I keep taking responsibility for everyone around me?',",
    "  'How do I make decisions that actually fit me?',"
  ],
  [
    "  'What is mine, what is theirs, and what happens between us?',",
    "  'Why does the same conversation feel urgent to me and pressuring to them?',"
  ],
  [
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');",
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst routeCohesionVisual = read('apps/web/src/deployed-route-cohesion.css');\nconst refinementVisual = read('apps/web/src/experience-refinement-v1.css');\nconst renderedFidelityVisual = read('apps/web/src/rendered-fidelity-v1.css');\nconst landingRefinementVisual = read('apps/web/src/landing-refinement-v2.css');\nconst landingRefinementV5Visual = read('apps/web/src/landing-live-refinement-v5.css');\nconst invitationFidelityVisual = read('apps/web/src/invitation-rendered-fidelity-v1.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');\nconst staticRefinementVisual = read('apps/web/public/experience-static-refinement-v1.css');\nconst staticTerminalVisual = read('apps/web/public/premium-action-static-v1.css');"
  ],
  [
    "  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css'",
    "  'apps/web/src/deployed-route-cohesion.css',\n  'apps/web/src/experience-refinement-v1.css',\n  'apps/web/src/rendered-fidelity-v1.css',\n  'apps/web/src/landing-refinement-v2.css',\n  'apps/web/src/landing-live-refinement-v5.css',\n  'apps/web/src/invitation-rendered-fidelity-v1.css',\n  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css',\n  'apps/web/public/experience-static-refinement-v1.css',\n  'apps/web/public/premium-action-static-v1.css'"
  ],
  [
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\"\n];",
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './deployed-route-cohesion.css';\",\n  \"import './passkey-auth.css';\"\n];"
  ],
  [
    "  'Sovereign begins with the capacity beneath a pattern—showing how it may express, what happens between people, and what could change.',",
    "  'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',"
  ],
  [
    "  'Bring the question you actually have.',",
    "  'Start with yourself. Expand outward when it matters.',"
  ],
  [
    "  'Ask about your life.',\n  'Get an answer built for you.',",
    "  'Explore how you think, decide, communicate, create, connect, and grow.',\n  'How Sovereign explores the question',"
  ],
  [
    "  'Understand what happens',\n  'between you.',",
    "  'See why the same moment lands differently—and how to bridge the gap.',"
  ],
  [
    "  'From one person',\n  'to the whole system.',",
    "  'See the whole system.',"
  ],
  [
    "  'Seeing the capacity beneath it',\n  'Seeing how it is expressing',\n  'Seeing what keeps it going',\n  'Seeing what could change',",
    "  'Start with the question',\n  'Use what matters from your Baseline',\n  'Find the useful difference',\n  'Give you something you can try',"
  ],
  [
    "  'Mapping the people',",
    "  'How Sovereign reads a system',"
  ],
  [
    "  'Roles',",
    "  'Roles',"
  ],
  [
    "  'Responsibility',",
    "  'Responsibilities',"
  ],
  [
    "  'Movement',",
    "  'Perspectives',"
  ],
  [
    "  'Illustrative permitted Baselines',",
    "  'Start with what you told Sovereign',"
  ],
  [
    "  'stroke: #2f93ff',\n  'width: 100vw',",
    "  'width: 100vw',"
  ],
  [
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned to the hero field.');",
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned to the hero field.');\nrequireAll('final experience refinement', refinementVisual, ['--landing-blue: #e8ddd0 !important', '--route-blue: #e8ddd0 !important', '-webkit-text-stroke: 1.15px rgba(241, 233, 222, 0.82)', '.sovereign-app-runtime .sovereign-composer']);\nrequireAll('rendered fidelity authority', renderedFidelityVisual, ['--v8-blue: #d8d0c5 !important', \"radialGradient[id$='-sphere-fill']\", 'filter: saturate(0.08) contrast(1.05) brightness(0.96) !important', '.public-approved-v8 .landing-demo {', 'padding: 54px 0 !important']);\nrequireAll('landing refinement v2', landingRefinementVisual, ['.landing-workflow__progress', '@keyframes sovereign-system-route', 'scroll-snap-type: inline mandatory !important']);\nrequireAll('landing refinement v5', landingRefinementV5Visual, ['.v0-hero h1 > span', '.v0-hero h1 > em', 'font-family: inherit !important', '@keyframes sovereign-hero-rise', '@keyframes sovereign-field-arrive', '.landing-expression-slice__tooltip-panel', 'width: 104px !important', 'height: 26px !important', '@media (prefers-reduced-motion: reduce)']);\nrequireAll('invitation rendered fidelity', invitationFidelityVisual, ['@media (min-width: 901px)', 'overflow-wrap: normal']);\nrequireAll('final static refinement', staticRefinementVisual, ['--v0-blue: #e8ddd0', '--v0-blue-bright: #fffaf3', 'body.how-page .journey-steps > article', 'body.pricing-page .pricing-grid', 'body.questions-page .faq-category', '@media (prefers-reduced-motion: reduce)']);\nrequireAll('terminal static typography', staticTerminalVisual, ['--static-display-font:', '--static-ui-title-font:', 'font-family: var(--static-display-font) !important', 'font-family: var(--static-ui-title-font) !important']);"
  ],
  [
    "supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'Sovereign.OS']));",
    "supportPages.forEach((page) => requireAll('support page', page, ['/v0-public-static.css?v=20260803-refined-v2', '/deployed-route-cohesion.css?v=20260803-route-v1', '/experience-static-refinement-v1.css?v=20260817-cohesion-v2', '/premium-action-static-v1.css?v=20260819-founder-display-v1', 'Sovereign.OS']));"
  ],
  [
    "  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],",
    "  ['route cohesion authority', routeCohesionVisual],\n  ['experience refinement', refinementVisual],\n  ['rendered fidelity', renderedFidelityVisual],\n  ['landing refinement v2', landingRefinementVisual],\n  ['landing refinement v5', landingRefinementV5Visual],\n  ['invitation rendered fidelity', invitationFidelityVisual],\n  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],\n  ['standalone refinement', staticRefinementVisual],\n  ['standalone terminal typography', staticTerminalVisual],"
  ],
  [
    "  sequenceFingerprint,\n",
    ""
  ]
];

for (const [retiredContract, currentContract] of replacements) {
  const occurrences = source.split(retiredContract).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Premium platform release v2 compatibility update expected one retired contract occurrence but found ${occurrences}: ${retiredContract.slice(0, 120)}`);
  }
  source = source.replace(retiredContract, currentContract);
}

if (source.includes("\"import './passkey-auth.css';\",\n  \"import './deployed-route-cohesion.css';\"")) throw new Error('Premium platform release v2 places route cohesion after passkey component styling.');
if (!source.includes("read('apps/web/src/rendered-fidelity-v1.css')") || !source.includes("read('apps/web/src/landing-refinement-v2.css')") || !source.includes("read('apps/web/src/landing-live-refinement-v5.css')")) throw new Error('Premium platform release v2 is missing current rendered landing authorities.');

for (const marker of [
  'data-public-narrative="self-people-systems-v1"',
  'You → your people → the whole system',
  'Start with yourself. Expand outward when it matters.',
  'How do I make decisions that actually fit me?',
  'Most AI starts with the prompt. Sovereign starts with you.',
  'Know yourself. Understand your people. See the whole system.'
]) if (!landing.includes(marker)) throw new Error(`Premium platform release v2 is missing landing marker: ${marker}`);
for (const retired of ['<BaselineFoundation />', 'One private reference beneath every question.', 'One private foundation. More useful answers across the questions that shape your life.', 'calculated astronomical positions and selected interpretive frameworks']) {
  if (landing.includes(retired)) throw new Error(`Premium platform release v2 found retired root language: ${retired}`);
}
for (const marker of [
  '01 · You',
  'Explore how you think, decide, communicate, create, connect, and grow.',
  '02 · You + your people',
  'See why the same moment lands differently—and how to bridge the gap.',
  'Keep each person separate',
  '03 · From 1:1 to the whole system',
  'See the whole system.',
  'How Sovereign reads a system',
  'Show how pressure moves',
  'Change one thing and watch what happens'
]) {
  if (!stories.includes(marker)) throw new Error(`Premium platform release v2 is missing product story marker: ${marker}`);
}
for (const retired of ['Separate helping from carrying the outcome.', 'See where responsibility keeps landing.']) {
  if (stories.includes(retired)) throw new Error(`Premium platform release v2 found retired category framing: ${retired}`);
}
for (const marker of [
  "data-inspecting={hasInspection ? 'true' : 'false'}",
  'setHasInspection(true)',
  'click a line to inspect it',
  'const TOOLTIP_WIDTH = 104',
  'const TOOLTIP_HEIGHT = 26'
]) if (!field.includes(marker)) throw new Error(`Premium platform release v2 is missing click-led field marker: ${marker}`);
if (field.includes('onPointerEnter={() => selectAxis(axis.id)}')) throw new Error('Premium platform release v2 found hover-driven field inspection.');
for (const marker of ['@keyframes sovereign-hero-rise', 'font-family: inherit !important', 'width: 104px !important', 'height: 26px !important']) {
  if (!landingRefinementV5.includes(marker)) throw new Error(`Premium platform release v2 is missing final visual marker: ${marker}`);
}
if (landingRefinementV5.includes('var(--font-display, Georgia, serif)') || landingRefinementV5.includes('.landing-baseline-intro')) throw new Error('Premium platform release v2 found retired component-local landing presentation.');
for (const marker of ['font-family: "Geist Sans";', 'font-family: "Sovereign Display";', '/fonts/sovereign-display.woff2', '--font-public-display:', '--font-display: var(--font-title);']) {
  if (!typography.includes(marker)) throw new Error(`Premium platform release v2 is missing split typography marker: ${marker}`);
}
for (const marker of ['.public-approved-v8 .v0-hero h1 > em', 'font-family: var(--font-title) !important', 'font-family: var(--font-public-display) !important']) {
  if (!sansTypography.includes(marker)) throw new Error(`Premium platform release v2 is missing split typography authority marker: ${marker}`);
}
if (!main.includes("import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';")) throw new Error('Premium platform release v2 is missing split typography import.');
if (main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;') <= main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;')) throw new Error('Premium platform release v2 does not place split typography after action authority.');

for (const retired of [
  'Bring the question you actually have.',
  "'Ask about your life.',",
  "'Get an answer built for you.',",
  'Illustrative permitted Baselines',
  'capacity beneath a pattern',
  'Seeing the capacity beneath it',
  'Mapping the people',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.',
  'One private foundation. More useful answers across the questions that shape your life.'
]) if (source.includes(retired)) throw new Error(`Premium platform release v2 still enforces retired active language: ${retired}`);

/* CURRENT_STORY_CONTRACT_restored product stories */
const currentStoryMarkers = ["<PersonalStory />","<RelationshipStory />","<SystemStory />","Explore how you think, decide, communicate, create, connect, and grow.","See why the same moment lands differently—and how to bridge the gap.","See the whole system.","How Sovereign builds the answer","How Sovereign compares two people","How Sovereign reads a system","Keep each person separate","Show what happens between you","Show how pressure moves","Show why the role keeps returning","Change one thing and watch what happens","surface=\"personal-chat\"","surface=\"relationship-chat\"","surface=\"system-map\"","No compatibility score"];
const currentStoryQuote = String.fromCharCode(39);
const currentStoryStart = "requireAll(" + currentStoryQuote + "restored product stories" + currentStoryQuote + ", stories, [";
const currentStoryIndex = source.indexOf(currentStoryStart);
if (currentStoryIndex < 0) throw new Error("Current story verifier block is missing: restored product stories");
const currentStoryEnd = source.indexOf("\n]);", currentStoryIndex);
if (currentStoryEnd < 0) throw new Error("Current story verifier block has no end: restored product stories");
const currentStoryContract = currentStoryStart + "\n" + currentStoryMarkers.map((marker) => "  " + JSON.stringify(marker)).join(",\n") + "\n]);";
source = source.slice(0, currentStoryIndex) + currentStoryContract + source.slice(currentStoryEnd + 4);

/* CURRENT_THREE_WORKFLOW_CONTRACT */
const staleWorkflowMultiplicity = "assert((stories.match(/<WorkflowPanel /g) ?? []).length === 1, 'Public stories must render one detailed reasoning flow, not repeat it for relationship and system examples.');";
const currentWorkflowMultiplicity = "assert((stories.match(/<WorkflowPanel/g) ?? []).length === 3, 'Public stories must render one workflow for Self, Relationship, and System.');";
if (source.includes(staleWorkflowMultiplicity)) {
  source = source.replace(staleWorkflowMultiplicity, currentWorkflowMultiplicity);
} else if (source.includes(currentWorkflowMultiplicity) === false) {
  throw new Error("Premium platform release v2 could not reconcile workflow multiplicity.");
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
