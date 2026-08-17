import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-premium-platform-release.mjs');
const temporaryPath = resolve(`scripts/.verify-premium-platform-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');
const landing = readFileSync(resolve('apps/web/src/PublicLanding.tsx'), 'utf8');
const field = readFileSync(resolve('apps/web/src/expression-field/LandingExpressionSlice.tsx'), 'utf8');
const landingRefinementV5 = readFileSync(resolve('apps/web/src/landing-live-refinement-v5.css'), 'utf8');

const replacements = [
  [
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');",
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst routeCohesionVisual = read('apps/web/src/deployed-route-cohesion.css');\nconst refinementVisual = read('apps/web/src/experience-refinement-v1.css');\nconst renderedFidelityVisual = read('apps/web/src/rendered-fidelity-v1.css');\nconst landingRefinementVisual = read('apps/web/src/landing-refinement-v2.css');\nconst landingRefinementV5Visual = read('apps/web/src/landing-live-refinement-v5.css');\nconst invitationFidelityVisual = read('apps/web/src/invitation-rendered-fidelity-v1.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');\nconst staticRefinementVisual = read('apps/web/public/experience-static-refinement-v1.css');"
  ],
  [
    "  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css'",
    "  'apps/web/src/deployed-route-cohesion.css',\n  'apps/web/src/experience-refinement-v1.css',\n  'apps/web/src/rendered-fidelity-v1.css',\n  'apps/web/src/landing-refinement-v2.css',\n  'apps/web/src/landing-live-refinement-v5.css',\n  'apps/web/src/invitation-rendered-fidelity-v1.css',\n  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css',\n  'apps/web/public/experience-static-refinement-v1.css'"
  ],
  [
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\"\n];",
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './deployed-route-cohesion.css';\",\n  \"import './passkey-auth.css';\"\n];"
  ],
  [
    "  'Sovereign begins with the capacity beneath a pattern—showing how it may express, what happens between people, and what could change.',",
    "  'Build a private Baseline once.',"
  ],
  [
    "  'Bring the question you actually have.',",
    "  'One private reference beneath every question.',"
  ],
  [
    "  'Ask about your life.',\n  'Get an answer built for you.',",
    "  'Separate helping from carrying the outcome.',\n  'How Sovereign gets there',"
  ],
  [
    "  'Understand what happens',\n  'between you.',",
    "  'Understand what happens between you.',"
  ],
  [
    "  'From one person',\n  'to the whole system.',",
    "  'See where responsibility keeps landing.',"
  ],
  [
    "  'Seeing the capacity beneath it',\n  'Seeing how it is expressing',\n  'Seeing what keeps it going',\n  'Seeing what could change',",
    "  'What your Baseline supports',\n  'What changes under pressure',\n  'Where responsibility shifts',\n  'A cleaner boundary',"
  ],
  [
    "  'Mapping the people',",
    "  'What Sovereign separates',"
  ],
  [
    "  'Roles',",
    "  'Observed route',"
  ],
  [
    "  'Movement',",
    "  'Testable change',"
  ],
  [
    "  'Illustrative permitted Baselines',",
    "  'Illustrative supplied context',"
  ],
  [
    "  'stroke: #2f93ff',\n  'width: 100vw',",
    "  'width: 100vw',"
  ],
  [
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned to the hero field.');",
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned to the hero field.');\nrequireAll('final experience refinement', refinementVisual, ['--landing-blue: #e8ddd0 !important', '--route-blue: #e8ddd0 !important', '-webkit-text-stroke: 1.15px rgba(241, 233, 222, 0.82)', '.sovereign-app-runtime .sovereign-composer']);\nrequireAll('rendered fidelity authority', renderedFidelityVisual, ['--v8-blue: #d8d0c5 !important', \"radialGradient[id$='-sphere-fill']\", 'filter: saturate(0.08) contrast(1.05) brightness(0.96) !important', '.public-approved-v8 .landing-demo {', 'padding: 54px 0 !important']);\nrequireAll('landing refinement v2', landingRefinementVisual, ['.landing-workflow__progress', '@keyframes sovereign-system-route', 'scroll-snap-type: inline mandatory !important']);\nrequireAll('landing refinement v5', landingRefinementV5Visual, ['.v0-hero h1 > span', '.v0-hero h1 > em', '@keyframes sovereign-hero-rise', '@keyframes sovereign-field-arrive', '.landing-baseline-intro__heading', '.landing-baseline-intro__principles', '.landing-expression-slice__tooltip-panel', 'width: 104px !important', 'height: 26px !important', '@media (prefers-reduced-motion: reduce)']);\nrequireAll('invitation rendered fidelity', invitationFidelityVisual, ['@media (min-width: 901px)', 'overflow-wrap: normal']);\nrequireAll('final static refinement', staticRefinementVisual, ['--v0-blue: #e8ddd0', '--v0-blue-bright: #fffaf3', 'body.how-page .journey-steps > article', 'body.pricing-page .pricing-grid', 'body.questions-page .faq-category', '@media (prefers-reduced-motion: reduce)']);"
  ],
  [
    "supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'Sovereign.OS']));",
    "supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'Sovereign.OS']));\nfor (const page of supportPages.slice(0, 3)) requireAll('refined static page', page, ['/experience-static-refinement-v1.css?v=20260817-cohesion-v2']);"
  ],
  [
    "  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],",
    "  ['route cohesion authority', routeCohesionVisual],\n  ['experience refinement', refinementVisual],\n  ['rendered fidelity', renderedFidelityVisual],\n  ['landing refinement v2', landingRefinementVisual],\n  ['landing refinement v5', landingRefinementV5Visual],\n  ['invitation rendered fidelity', invitationFidelityVisual],\n  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],\n  ['standalone refinement', staticRefinementVisual],"
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

if (source.includes("\"import './passkey-auth.css';\",\n  \"import './deployed-route-cohesion.css';\"")) {
  throw new Error('Premium platform release v2 places route cohesion after the final passkey authority.');
}
if (!source.includes("read('apps/web/src/rendered-fidelity-v1.css')") || !source.includes("read('apps/web/src/landing-refinement-v2.css')") || !source.includes("read('apps/web/src/landing-live-refinement-v5.css')")) {
  throw new Error('Premium platform release v2 is missing current rendered landing authorities.');
}
for (const marker of [
  '<BaselineFoundation />',
  'One private reference beneath every question.',
  'One private foundation. More useful answers across the questions that shape your life.',
  'Should I stay in this job, ask for more, or leave?'
]) {
  if (!landing.includes(marker)) throw new Error(`Premium platform release v2 is missing value-first landing marker: ${marker}`);
}
for (const marker of [
  "data-inspecting={hasInspection ? 'true' : 'false'}",
  'setHasInspection(true)',
  'click a line to inspect it',
  'const TOOLTIP_WIDTH = 104',
  'const TOOLTIP_HEIGHT = 26'
]) {
  if (!field.includes(marker)) throw new Error(`Premium platform release v2 is missing click-led field marker: ${marker}`);
}
if (field.includes('onPointerEnter={() => selectAxis(axis.id)}')) throw new Error('Premium platform release v2 found hover-driven field inspection.');
for (const marker of ['@keyframes sovereign-hero-rise', '.landing-baseline-intro__heading', 'width: 104px !important', 'height: 26px !important']) {
  if (!landingRefinementV5.includes(marker)) throw new Error(`Premium platform release v2 is missing final visual marker: ${marker}`);
}
for (const retired of [
  'Bring the question you actually have.',
  "'Ask about your life.',",
  "'Get an answer built for you.',",
  "'Roles',",
  "'Movement',",
  'Illustrative permitted Baselines',
  'capacity beneath a pattern',
  'Seeing the capacity beneath it',
  'Mapping the people'
]) {
  if (source.includes(retired)) throw new Error(`Premium platform release v2 still enforces retired active language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}
