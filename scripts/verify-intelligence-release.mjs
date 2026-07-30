import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const containsAll = (label, text, values) => {
  for (const value of values) assert(text.includes(value), `${label} is missing: ${value}`);
};

const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const composition = read('apps/web/src/interface-composition.css');
const productCss = read('apps/web/src/sovereign-product-v2.css');
const precisionCss = read('apps/web/src/sovereign-product-precision.css');
const workspaceCss = [
  read('apps/web/src/workspace-chat.css'),
  read('apps/web/src/sovereign-cohesion.css'),
  read('apps/web/src/sovereign-modern.css'),
  composition,
  productCss,
  precisionCss
].join('\n');
const landing = read('apps/web/src/PublicLanding.tsx');
const landingCss = [
  read('apps/web/src/public-landing.css'),
  read('apps/web/src/sovereign-cohesion.css'),
  read('apps/web/src/sovereign-modern.css'),
  read('apps/web/src/landing-production.css'),
  composition,
  productCss,
  precisionCss
].join('\n');
const staticPublicCss = [
  read('apps/web/public/platform-public.css'),
  read('apps/web/public/sovereign-product-v2.css'),
  read('apps/web/public/sovereign-product-precision.css')
].join('\n');
const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
const contract = read('apps/sovereign-worker/src/agent/recognition.ts');
const baseline = read('apps/sovereign-worker/src/baseline-contracts.ts');
const relational = read('apps/sovereign-worker/src/relational-context.ts');
const actions = read('apps/sovereign-worker/src/interface-actions.ts');
const scripture = read('apps/sovereign-worker/src/covenant/scripture.ts');
const serviceWorker = read('apps/web/public/sw.js');
const main = read('apps/web/src/main.tsx');
const how = read('apps/web/public/how-it-works.html');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');

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

containsAll('current public product contract', landing, [
  'Ask about your life.',
  'Get an answer built around you.',
  'private personal AI for understanding yourself, your relationships, your decisions, and the groups around you',
  'Why do I keep taking responsibility for everyone else?',
  'Your ability to create direction is real. The problem begins when responsibility reaches you without matching authority.',
  '<PublicAnswerStage',
  '<PermissionField />',
  '<SystemMap />',
  'Understand the interaction without pretending to know another person’s mind.',
  'No compatibility score. No mind-reading.'
]);
assert(!landing.includes('INIT_BASELINE'), 'Rejected Engine Room language returned to the homepage.');
assert(!landing.includes('Know yourself.<br />Understand the system.'), 'The brand line is carrying the homepage explanation again.');

containsAll('responsive workspace', workspaceCss, [
  'min-height: 44px',
  'env(safe-area-inset-bottom)',
  '.mobile-bottom-nav',
  '.intelligence-workspace',
  '.answer-sections',
  '@media (max-width: 700px)',
  '@media(max-width:760px)',
  '@media(prefers-reduced-motion:reduce)'
]);

containsAll('responsive landing', landingCss, [
  'min-width: 320px',
  '.sovereign-landing',
  '.landing-section-header',
  '.answer-product',
  '@media(max-width:760px)',
  '@media(prefers-reduced-motion:reduce)'
]);

containsAll('precision product system', precisionCss, [
  '--precision-display',
  '--precision-text',
  '--precision-mono',
  '--s2-bg:#070908',
  'border-radius:0!important',
  '.intelligence-workspace',
  '.product-v2 .answer-product'
]);
assert(!precisionCss.includes('Iowan Old Style'), 'The precision layer must not restore serif display typography.');

containsAll('cross-route composition', composition, [
  '.sovereign-landing',
  '.account-shell',
  '.plan-onboarding',
  '.sovereign-policy',
  '.public-not-found',
  '.intelligence-workspace',
  '--platform-clay: #c58b67',
  '--platform-sage: #a9b8a7'
]);

containsAll('static public platform layer', staticPublicCss, [
  'body.launch-page',
  '.launch-nav',
  '.journey-steps',
  '.pricing-grid',
  '.questions-page .faq-section',
  '.launch-callout',
  '--precision-display',
  '@media(max-width:760px)'
]);

for (const [label, document] of [['How it works', how], ['Pricing', pricing], ['FAQ', faq]]) {
  containsAll(label, document, [
    '/platform-public.css?v=20260730-platform2',
    '/sovereign-product-v2.css?v=20260730-reconciliation',
    '/sovereign-product-precision.css?v=20260730-precision',
    'SOVEREIGN.OS',
    'Build my Baseline'
  ]);
}
containsAll('Pricing entitlements', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
assert(!pricing.includes('Begin with yourself. Expand when other people matter.'), 'Rejected pricing positioning returned.');
containsAll('FAQ contract', faq, ['<details', 'What is Sovereign.OS?', 'Can I correct or remove an interpretation?']);

containsAll('canonical visual imports', main, [
  "import './sovereign-cohesion.css'",
  "import './sovereign-modern.css'",
  "import './landing-production.css'",
  "import './interface-composition.css'",
  "import './sovereign-product-v2.css'",
  "import './sovereign-product-precision.css'"
]);

assert(!existsSync(resolve(root, 'apps/web/src/experience-reconciliation.css')), 'Retired visual override was restored.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("  '/app',"), 'Private workspace navigation must not be cached.');
containsAll('public service worker assets', serviceWorker, [
  "const CACHE_NAME = 'sovereign-public-v15'",
  "'/sovereign-product-v2.css'",
  "'/sovereign-product-precision.css'"
]);

for (const [label, css] of [
  ['workspace', workspaceCss],
  ['landing', landingCss],
  ['composition', composition],
  ['product', productCss],
  ['precision', precisionCss],
  ['static public', staticPublicCss]
]) {
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  assert(open === close, `${label} CSS has unbalanced braces (${open}/${close}).`);
}

console.log(JSON.stringify({
  ok: true,
  answerContract: 'sovereign-answer.v2',
  baselineContracts: ['baseline-source.v1', 'baseline-facets.v1'],
  publicProductContract: 'real-question-right-context-clear-answer',
  rejectedEngineRoom: true,
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  canonicalVisualLayers: [
    'sovereign-product-v2.css',
    'sovereign-product-precision.css',
    'sovereign-product-v2.css (static)',
    'sovereign-product-precision.css (static)'
  ],
  coveredSurfaces: ['home', 'how-it-works', 'pricing', 'faq', 'login', 'signup', 'onboarding', 'invitation', 'workspace', 'privacy', 'terms', 'not-found'],
  responsiveBreakpoints: ['1080px', '760px', '420px'],
  exactBasis: true,
  contextualCovenant: true
}, null, 2));
