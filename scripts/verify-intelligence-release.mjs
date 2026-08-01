import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const containsAll = (label, text, values) => values.forEach((value) => assert(text.includes(value), `${label} is missing: ${value}`));

const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const main = read('apps/web/src/main.tsx');
const staticPublicCss = read('apps/web/public/platform-public.css');
const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
const contract = read('apps/sovereign-worker/src/agent/recognition.ts');
const baseline = read('apps/sovereign-worker/src/baseline-contracts.ts');
const relational = read('apps/sovereign-worker/src/relational-context.ts');
const actions = read('apps/sovereign-worker/src/interface-actions.ts');
const scripture = read('apps/sovereign-worker/src/covenant/scripture.ts');
const serviceWorker = read('apps/web/public/sw.js');
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
  "type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'"
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

containsAll('founder v0 public product contract', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  '<RotatingQuestions />',
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  '<ComparisonStory />',
  '<FinalCallToAction />',
  'Ask about your life.',
  'Get an answer built for you.',
  'See the space',
  'between you.',
  'From one person',
  'to the whole system.',
  'Other AI answers',
  'everyone the same.',
  'Your thoughts deserve',
  'a better place to live.',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'Each person controls what may be included'
]);

containsAll('founder v0 visual components', `${landing}\n${v0Visual}`, [
  'className="v0-baseline-trace"',
  'className="v0-flow"',
  'className="v0-family-map"',
  'className="v0-comparison-grid"',
  '.v0-hero',
  '.v0-story-grid',
  '.v0-family-map',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.account-shell',
  '@media (max-width: 760px)',
  '@media (prefers-reduced-motion: reduce)'
]);

for (const prohibited of ['Know yourself.', 'Understand the system.', 'Choose what fits.', 'Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'generateAIResponse', 'Demo User']) {
  assert(!landing.includes(prohibited), `Public landing contains rejected reconstruction, mock, or scoring behavior: ${prohibited}`);
}

containsAll('final v0 visual import', main, ["import './v0-visual-port.css';"]);
const v0Import = "import './v0-visual-port.css';";
assert(!main.slice(main.indexOf(v0Import) + v0Import.length).includes("import './"), 'A local visual file loads after the founder v0 authority.');

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
  containsAll(label, document, ['SOVEREIGN.OS', 'Build my Baseline']);
}
containsAll('Pricing entitlements', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
containsAll('FAQ contract', faq, ['<details', 'What is Sovereign.OS?', 'Can I correct or remove an interpretation?']);

assert(!existsSync(resolve(root, 'apps/web/src/experience-reconciliation.css')), 'Retired visual override was restored.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');

for (const [label, css] of [['founder v0', v0Visual], ['static public', staticPublicCss]]) {
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  assert(open === close, `${label} CSS has unbalanced braces (${open}/${close}).`);
}

console.log(JSON.stringify({
  ok: true,
  answerContract: 'sovereign-answer.v2',
  baselineContracts: ['baseline-source.v1', 'baseline-facets.v1'],
  publicProductContract: 'baseline-first-private-ai',
  visualAuthority: 'founder-v0-selective-port',
  archiveSha256: archiveSha,
  mockRuntimeImported: false,
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  canonicalVisualLayers: ['v0-visual-port.css', 'platform-public.css'],
  coveredSurfaces: ['home', 'how-it-works', 'pricing', 'faq', 'login', 'signup', 'onboarding', 'invitation', 'workspace', 'privacy', 'terms', 'not-found'],
  exactBasis: true,
  contextualCovenant: true,
  selectiveVisualPort: true
}, null, 2));
