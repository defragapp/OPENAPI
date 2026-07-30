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
const composition = read('apps/web/src/interface-composition.css');
const workspaceCss = [
  read('apps/web/src/workspace-chat.css'),
  read('apps/web/src/sovereign-cohesion.css'),
  read('apps/web/src/sovereign-modern.css'),
  composition
].join('\n');
const landing = read('apps/web/src/PublicLanding.tsx');
const landingCss = [
  read('apps/web/src/public-landing.css'),
  read('apps/web/src/sovereign-cohesion.css'),
  read('apps/web/src/sovereign-modern.css'),
  read('apps/web/src/landing-production.css'),
  composition
].join('\n');
const staticPublicCss = read('apps/web/public/platform-public.css');
const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
const language = read('docs/product-language-system.md');
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
const app = read('apps/web/src/App.tsx');
const consent = read('apps/web/public/consent.html');

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
  'The direct answer must make sense by itself',
  'Write for a first-time user',
  'Prefer common verbs',
  'Alignment is not a score or rule',
  'Keep the people and the interaction distinct',
  'Select IDs only in basis_refs'
]);

containsAll('plain-language system', language, [
  'Ask about your life. Get an answer built around you.',
  'The private personal starting point Sovereign uses when answering your questions.',
  'A heading does not depend on the paragraph below it to become understandable.',
  'Use short, concrete sentences.',
  'Supporting details',
  'Choose what Sovereign may use about you.'
]);

containsAll('canonical workspace', workspace, [
  "version: 'sovereign-answer.v2'",
  '<SovereignAnswerView',
  '<AlignmentView',
  '<RelationshipAnswer',
  '<SystemAnswer',
  '<BasisStrip',
  'Add a Christian Scripture perspective?',
  "action.type === 'save_to_library'",
  'Sovereign will continue without guessing missing values.',
  'See what is steady and what may matter more right now.',
  'See who decides, who carries responsibility, and where pressure builds.',
  'Manage your Baseline, privacy, plan, and account.',
  'Supporting details',
  'What shaped this answer'
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
  'PRIVATE PERSONAL AI',
  'Ask about your life.',
  'Get an answer built around you.',
  'do not have to explain yourself from scratch',
  '<HeroIntelligenceStage />',
  '<SystemMap />',
  'You cannot add someone else’s private information without their permission.',
  'No compatibility score. No mind-reading.'
]);

containsAll('account and invitation clarity', `${app}\n${consent}`, [
  'Enter your email. We will send a one-time sign-in link.',
  'Choose what Sovereign may use about you.',
  'Accept invitation and choose permissions',
  'Review and change each permission.'
]);

for (const phrase of [
  'Know yourself.',
  'Understand the system.',
  'Choose what fits.',
  'Begin with yourself',
  'The question changes. The environment stays the same.',
  'Another person remains a person—not a data source you control.',
  'Your intelligence begins with your Baseline.',
  'Bring the whole structure into view.',
  'Keep what changes your understanding.',
  'Opening your intelligence.',
  'Why this is personal'
]) {
  assert(!`${landing}\n${how}\n${pricing}\n${faq}\n${app}\n${consent}\n${workspace}`.includes(phrase), `Retired abstract copy remains: ${phrase}`);
}

containsAll('responsive workspace', workspaceCss, [
  'min-height: 44px',
  'env(safe-area-inset-bottom)',
  '.mobile-bottom-nav',
  '.intelligence-workspace',
  '.answer-sections',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('responsive landing', landingCss, [
  'min-width: 320px',
  '.sovereign-landing',
  '.landing-section-header',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

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
  '@media (max-width: 720px)'
]);

for (const [label, document] of [['How it works', how], ['Pricing', pricing], ['FAQ', faq]]) {
  containsAll(label, document, [
    '/platform-public.css?v=20260730-platform',
    'SOVEREIGN.OS',
    'Build my Baseline'
  ]);
}
containsAll('How it works clarity', how, ['Build your Baseline once. Then ask about your real life.', 'FIVE SIMPLE STEPS']);
containsAll('Pricing entitlements', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
containsAll('Pricing clarity', pricing, ['Use Free for personal questions. Use Sovereign+ for relationships and groups.', 'What Sovereign+ adds.']);
containsAll('FAQ contract', faq, ['<details', 'What is Sovereign.OS?', 'Can I correct or remove an interpretation?', 'what it cannot know']);

containsAll('canonical visual imports', main, [
  "import './sovereign-cohesion.css'",
  "import './sovereign-modern.css'",
  "import './landing-production.css'",
  "import './interface-composition.css'"
]);

assert(!existsSync(resolve(root, 'apps/web/src/experience-reconciliation.css')), 'Retired visual override was restored.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');

for (const [label, css] of [
  ['workspace', workspaceCss],
  ['landing', landingCss],
  ['composition', composition],
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
  publicProductContract: 'baseline-first-private-ai',
  publicLanguageContract: 'plain-language-v1',
  legacyTaglineGate: 'retired',
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  canonicalVisualLayers: [
    'sovereign-cohesion.css',
    'sovereign-modern.css',
    'landing-production.css',
    'interface-composition.css',
    'platform-public.css'
  ],
  coveredSurfaces: ['home', 'how-it-works', 'pricing', 'faq', 'login', 'signup', 'onboarding', 'invitation', 'workspace', 'privacy', 'terms', 'not-found'],
  responsiveBreakpoints: ['1080px', '1000px', '920px', '700px'],
  exactBasis: true,
  contextualCovenant: true
}, null, 2));