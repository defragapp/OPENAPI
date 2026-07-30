import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const containsAll = (label, text, values) => {
  for (const value of values) assert(text.includes(value), `${label} is missing: ${value}`);
};

const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const workspaceCss = [
  read('apps/web/src/workspace-chat.css'),
  read('apps/web/src/sovereign-cohesion.css'),
  read('apps/web/src/sovereign-modern.css')
].join('\n');
const landing = read('apps/web/src/PublicLanding.tsx');
const landingCss = [
  read('apps/web/src/public-landing.css'),
  read('apps/web/src/sovereign-cohesion.css'),
  read('apps/web/src/sovereign-modern.css'),
  read('apps/web/src/landing-production.css')
].join('\n');
const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
const contract = read('apps/sovereign-worker/src/agent/recognition.ts');
const baseline = read('apps/sovereign-worker/src/baseline-contracts.ts');
const relational = read('apps/sovereign-worker/src/relational-context.ts');
const actions = read('apps/sovereign-worker/src/interface-actions.ts');
const scripture = read('apps/sovereign-worker/src/covenant/scripture.ts');
const serviceWorker = read('apps/web/public/sw.js');
const main = read('apps/web/src/main.tsx');

containsAll('answer contract', contract, [
  "z.literal('sovereign-answer.v2')",
  'basis_refs',
  'invented or unauthorized Basis reference',
  "if (parsed.mode === 'relationship')",
  "if (parsed.mode === 'system')",
  "if (parsed.mode === 'alignment')",
  "if (parsed.mode === 'covenant')"
]);

containsAll('Baseline contracts', baseline, [
  "BASELINE_SOURCE_VERSION = 'baseline-source.v1'",
  "BASELINE_FACET_CONTRACT_VERSION = 'baseline-facets.v1'",
  'shadowExpression',
  'giftExpression',
  'alignmentMarkers',
  'basisRefs'
]);

containsAll('runtime prompt', prompt, [
  'A user does not need to report a problem',
  'Keep four layers separate',
  'Give the direct answer first',
  'Alignment is not a score or rule',
  'Keep the people and the interaction distinct',
  'Select IDs only in basis_refs'
]);

containsAll('canonical workspace', workspace, [
  "version: 'sovereign-answer.v2'",
  '<SovereignAnswerView',
  '<AlignmentView',
  '<RelationshipAnswer',
  '<SystemAnswer',
  '<BasisStrip',
  'Explore this through Covenant?',
  "action.type === 'save_to_library'",
  'A supported path. Sovereign will not guess unavailable values.'
]);

containsAll('relationship and system intelligence', relational, [
  'pairFacetPairs',
  'sharedNeeds',
  'differentRoutes',
  'responsibilityAuthorityMismatch',
  'relationshipGraph: buildSupportedEdges'
]);

containsAll('contextual actions', actions, [
  "type: 'offer_covenant'",
  "type: 'show_plan'",
  'confirmationRequired: true'
]);

containsAll('verified Covenant library', scripture, [
  "translation: 'WEB'",
  'biblicalParallel:',
  'scripture:',
  'teaching:',
  'application:',
  'boundary:'
]);

// The legacy “PERSONAL AI FOR REAL LIFE” release assertion is intentionally retired.
// Release authority follows the current Baseline-first public product contract below.
containsAll('current public product contract', landing, [
  'Know yourself.',
  'Understand the system.',
  'Choose what fits.',
  'Sovereign.OS is a private AI for understanding yourself, your relationships, and the systems around you.',
  'Build your Baseline once',
  '<HeroIntelligenceStage />',
  '<SystemMap />',
  'Another person remains a person—not a data source you control.',
  'No compatibility score. No mind-reading.'
]);

containsAll('responsive workspace', workspaceCss, [
  'min-height: 44px',
  'env(safe-area-inset-bottom)',
  '@media (max-width: 900px)',
  '.mobile-bottom-nav',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('responsive landing', landingCss, [
  'min-width: 320px',
  '@media (max-width: 900px)',
  '@media (max-width: 620px)',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('canonical visual imports', main, [
  "import './sovereign-cohesion.css'",
  "import './sovereign-modern.css'",
  "import './landing-production.css'"
]);

assert(!existsSync(resolve(root, 'apps/web/src/experience-reconciliation.css')), 'Retired visual override was restored.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');

for (const [label, css] of [['workspace', workspaceCss], ['landing', landingCss]]) {
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  assert(open === close, `${label} CSS has unbalanced braces (${open}/${close}).`);
}

console.log(JSON.stringify({
  ok: true,
  answerContract: 'sovereign-answer.v2',
  baselineContracts: ['baseline-source.v1', 'baseline-facets.v1'],
  publicProductContract: 'baseline-first-private-ai',
  legacyTaglineGate: 'retired',
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  canonicalVisualLayers: ['sovereign-cohesion.css', 'sovereign-modern.css', 'landing-production.css'],
  responsiveBreakpoints: ['900px', '620px'],
  exactBasis: true,
  contextualCovenant: true
}, null, 2));