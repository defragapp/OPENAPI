import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath = resolve('scripts/verify-premium-platform-release.mjs');
const temporaryPath = resolve(`scripts/.verify-premium-platform-release-v2-${process.pid}.mjs`);
let source = readFileSync(sourcePath, 'utf8');

const replacements = [
  [
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');",
    "const passkeyVisual = read('apps/web/src/passkey-auth.css');\nconst routeCohesionVisual = read('apps/web/src/deployed-route-cohesion.css');\nconst refinementVisual = read('apps/web/src/experience-refinement-v1.css');\nconst renderedFidelityVisual = read('apps/web/src/rendered-fidelity-v1.css');\nconst staticV0Visual = read('apps/web/public/v0-public-port.css');\nconst staticRefinementVisual = read('apps/web/public/experience-static-refinement-v1.css');"
  ],
  [
    "  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css'",
    "  'apps/web/src/deployed-route-cohesion.css',\n  'apps/web/src/experience-refinement-v1.css',\n  'apps/web/src/rendered-fidelity-v1.css',\n  'apps/web/src/passkey-auth.css',\n  'apps/web/public/v0-public-port.css',\n  'apps/web/public/experience-static-refinement-v1.css'"
  ],
  [
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './passkey-auth.css';\"\n];",
    "  \"import './landing-hero-field-v4.css';\",\n  \"import './deployed-route-cohesion.css';\",\n  \"import './passkey-auth.css';\"\n];"
  ],
  [
    "  'Sovereign begins with the capacity beneath a pattern—showing how it may express, what happens between people, and what could change.',",
    "  'Sovereign begins with the capacity beneath a pattern. It shows how that capacity may be expressing, what happens between people, and what may be keeping the pattern in place—so you can see what could change.',"
  ],
  [
    "  'Bring the question you actually have.',",
    "  'Start with what’s actually happening.',"
  ],
  [
    "  'Ask about your life.',\n  'Get an answer built for you.',",
    "  'Capacity beneath the pattern',\n  'How pressure changes the expression',"
  ],
  [
    "  'Understand what happens',\n  'between you.',",
    "  'Understand what happens between you.',"
  ],
  [
    "  'From one person',\n  'to the whole system.',",
    "  'See what keeps the pattern going—and what could change it.',"
  ],
  [
    "  'Seeing the capacity beneath it',\n  'Seeing how it is expressing',\n  'Seeing what keeps it going',\n  'Seeing what could change',",
    "  'Capacity beneath the pattern',\n  'How pressure changes the expression',\n  'What may keep it going',\n  'What could change',"
  ],
  [
    "  'Mapping the people',",
    "  'System structure',"
  ],
  [
    "  'stroke: #2f93ff',\n  'width: 100vw',",
    "  'width: 100vw',"
  ],
  [
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned to the hero field.');",
    "assert(!field.includes('<div className=\"landing-expression-slice__tooltip\"'), 'The retired floating tooltip returned to the hero field.');\nrequireAll('final experience refinement', refinementVisual, ['--landing-blue: #e8ddd0 !important', '--route-blue: #e8ddd0 !important', '-webkit-text-stroke: 1.15px rgba(241, 233, 222, 0.82)', '.sovereign-app-runtime .sovereign-composer']);\nrequireAll('rendered fidelity authority', renderedFidelityVisual, ['--v8-blue: #d8d0c5 !important', \"radialGradient[id$='-sphere-fill']\", 'filter: saturate(0.08) contrast(1.05) brightness(0.96) !important', '.public-approved-v8 .landing-demo {', 'padding: 54px 0 !important']);\nrequireAll('final static refinement', staticRefinementVisual, ['--v0-blue: #e8ddd0', '--v0-blue-bright: #fffaf3', '@media (prefers-reduced-motion: reduce)']);"
  ],
  [
    "supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'Sovereign.OS']));",
    "supportPages.forEach((page) => requireAll('support page', page, ['/premium-public-release.css?v=20260730-final', 'Sovereign.OS']));\nfor (const page of supportPages.slice(0, 3)) requireAll('refined static page', page, ['/experience-static-refinement-v1.css?v=20260816-refinement-v1']);"
  ],
  [
    "  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],",
    "  ['route cohesion authority', routeCohesionVisual],\n  ['experience refinement', refinementVisual],\n  ['rendered fidelity', renderedFidelityVisual],\n  ['passkey authority', passkeyVisual],\n  ['standalone authority', staticV0Visual],\n  ['standalone refinement', staticRefinementVisual],"
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
if (!source.includes("read('apps/web/src/rendered-fidelity-v1.css')")) {
  throw new Error('Premium platform release v2 is missing the rendered fidelity authority.');
}
for (const retired of ['Bring the question you actually have.', "'Ask about your life.',", "'Get an answer built for you.',"]) {
  if (source.includes(retired)) throw new Error(`Premium platform release v2 still enforces retired active language: ${retired}`);
}

try {
  writeFileSync(temporaryPath, source, 'utf8');
  await import(`${pathToFileURL(temporaryPath).href}?release=${Date.now()}`);
} finally {
  rmSync(temporaryPath, { force: true });
}