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
const workspaceCss = [read('apps/web/src/workspace-chat.css'), read('apps/web/src/sovereign-cohesion.css'), read('apps/web/src/sovereign-modern.css')].join('\n');
const landing = read('apps/web/src/PublicLanding.tsx');
const engine = read('apps/web/src/engine-room.css');
const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');
const contract = read('apps/sovereign-worker/src/agent/recognition.ts');
const baseline = read('apps/sovereign-worker/src/baseline-contracts.ts');
const relational = read('apps/sovereign-worker/src/relational-context.ts');
const actions = read('apps/sovereign-worker/src/interface-actions.ts');
const scripture = read('apps/sovereign-worker/src/covenant/scripture.ts');
const serviceWorker = read('apps/web/public/sw.js');
const main = read('apps/web/src/main.tsx');
const pricing = read('apps/web/public/pricing.html');
const faq = read('apps/web/public/faq.html');

containsAll('answer contract', contract, [
  "z.literal('sovereign-answer.v2')", 'basis_refs', 'invented or unauthorized Basis reference',
  "if (parsed.mode === 'relationship')", "if (parsed.mode === 'system')", "if (parsed.mode === 'alignment')", "if (parsed.mode === 'covenant')"
]);
containsAll('Baseline contracts', baseline, [
  "BASELINE_SOURCE_VERSION = 'baseline-source.v1'", "BASELINE_FACET_CONTRACT_VERSION = 'baseline-facets.v1'",
  'shadowExpression', 'giftExpression', 'alignmentMarkers', 'basisRefs'
]);
containsAll('runtime prompt', prompt, [
  'A user does not need to report a problem', 'Keep four layers separate', 'Give the direct answer first',
  'Alignment is not a score or rule', 'Keep the people and the interaction distinct', 'Select IDs only in basis_refs'
]);
containsAll('canonical workspace', workspace, [
  "version: 'sovereign-answer.v2'", '<SovereignAnswerView', '<AlignmentView', '<RelationshipAnswer', '<SystemAnswer',
  '<BasisStrip', 'Explore this through Covenant?', "action.type === 'save_to_library'"
]);
containsAll('relationship and system intelligence', relational, [
  'pairFacetPairs', 'sharedNeeds', 'differentRoutes', 'responsibilityAuthorityMismatch', 'relationshipGraph: buildSupportedEdges'
]);
containsAll('contextual actions', actions, ["type: 'offer_covenant'", "type: 'show_plan'", 'confirmationRequired: true']);
containsAll('verified Covenant library', scripture, ["translation: 'WEB'", 'biblicalParallel:', 'scripture:', 'teaching:', 'application:', 'boundary:']);

containsAll('Engine Room public product contract', landing, [
  'className="sovereign-landing engine-room"', 'data-product-contract="baseline-first"', 'data-answer-contract="sovereign-answer.v2"',
  '<BootSequence />', '<TechnicalGrid />', '<DataPointField />', '<HeroState />', '<BaselineState />', '<ConnectedScalesState />', '<LiveQueryState />', '<ReadyState />',
  'KNOW YOURSELF.', 'UNDERSTAND THE SYSTEM.', 'Personal, relationship, and system intelligence built from context.',
  'Your intelligence begins with a stable Baseline.', 'Move outward without rebuilding context.',
  'Why do I keep taking responsibility for everyone else?', 'Your capacity is real.',
  'The question is whether the responsibility is actually yours.', '&gt; READY'
]);
containsAll('Engine Room implementation', engine, [
  '--engine-bg: #050505', '--engine-sans:', '--engine-mono:', '.engine-scroll-shell { min-height: 600svh; }',
  'position: sticky', '.baseline-machine', '.scale-field', '.query-computation',
  '@media (max-width: 680px)', '@media (prefers-reduced-motion: reduce)', '@media (forced-colors: active)'
]);

for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'localStorage', 'OVERLAP: 68%', 'border-radius: 999px']) {
  assert(!`${landing}\n${engine}`.includes(prohibited), `Engine Room contains prohibited behavior or treatment: ${prohibited}`);
}
containsAll('responsive workspace', workspaceCss, ['min-height: 44px', 'env(safe-area-inset-bottom)', '.mobile-bottom-nav', '.intelligence-workspace', '@media (prefers-reduced-motion: reduce)']);
containsAll('pricing entitlements', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
containsAll('FAQ contract', faq, ['<details', 'What is Sovereign.OS?', 'Can I correct or remove an interpretation?']);
containsAll('canonical visual imports', main, [
  "import './sovereign-cohesion.css'", "import './sovereign-modern.css'", "import './interface-composition.css'", "import './engine-room.css'"
]);
assert(main.indexOf("import './engine-room.css'") > main.indexOf("import './public-landing-editorial.css'"), 'Engine Room must be the final public layer.');
assert(!existsSync(resolve(root, 'apps/web/src/experience-reconciliation.css')), 'Retired visual override was restored.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');

for (const [label, css] of [['workspace', workspaceCss], ['Engine Room', engine]]) {
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  assert(open === close, `${label} CSS has unbalanced braces (${open}/${close}).`);
}

console.log(JSON.stringify({
  ok: true,
  answerContract: 'sovereign-answer.v2',
  baselineContracts: ['baseline-source.v1', 'baseline-facets.v1'],
  publicProductContract: 'baseline-first-private-ai',
  canonicalLanding: 'Sovereign Engine Room',
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  canonicalVisualLayers: ['engine-room.css', 'platform-public.css'],
  coveredSurfaces: ['home', 'how-it-works', 'pricing', 'faq', 'login', 'signup', 'onboarding', 'invitation', 'workspace', 'privacy', 'terms', 'not-found'],
  responsiveBreakpoints: ['900px', '680px'],
  exactBasis: true,
  contextualCovenant: true,
  continuousEngine: true
}, null, 2));
