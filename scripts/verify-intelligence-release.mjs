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
const workspaceCss = [
  read('apps/web/src/workspace-chat.css'),
  read('apps/web/src/workspace-mobile.css'),
  read('apps/web/src/sovereign-cohesion.css'),
  read('apps/web/src/sovereign-modern.css')
].join('\n');
const landing = read('apps/web/src/PublicLanding.tsx');
const engine = read('apps/web/src/engine-room.css');
const engineSafeArea = read('apps/web/src/engine-room-safe-area.css');
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

containsAll('canonical Engine Room product contract', landing, [
  'className="sovereign-landing engine-room"',
  'data-product-contract="baseline-first"',
  'data-answer-contract="sovereign-answer.v2"',
  '<BootSequence />', '<EngineHeader />', '<TechnicalGrid />', '<DataPointField />',
  '<HeroIntelligenceStage />', '<BaselineContextStage />', '<ConnectedScalesStage',
  '<PublicAnswerStage />', '<TerminalStage />', '<EngineProgress />',
  'KNOW YOURSELF.', 'UNDERSTAND THE SYSTEM.', 'Choose what fits.',
  'Sovereign.OS is a private AI for understanding yourself, your relationships, and the systems around you.',
  'Your intelligence begins with your Baseline.',
  'ONE INTELLIGENCE · THREE CONNECTED SCALES',
  'Why do I keep taking responsibility for everyone else?',
  'Your capacity is real. The question is whether the responsibility is actually yours.',
  'PERMISSION BEFORE COMPARISON',
  '&gt; READY'
]);
containsAll('canonical Engine Room implementation', engine, [
  '--engine-black: #050505', '--engine-ink: #f2eee6', '--engine-copper: #c38a67', '--engine-sage: #a8b6a4',
  '.engine-scroll-shell', 'height: 560svh', 'position: sticky', '.baseline-machine', '.scale-machine', '.query-computation',
  '@media (max-width: 900px)', '@media (max-width: 760px)', '@media (max-width: 440px)', '@media (prefers-reduced-motion: reduce)'
]);
containsAll('Engine Room mobile safe areas', engineSafeArea, [
  'env(safe-area-inset-top)', 'env(safe-area-inset-bottom)', 'env(safe-area-inset-left)', 'env(safe-area-inset-right)'
]);
for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'localStorage', 'OVERLAP: 68%', 'border-radius: 999px']) {
  assert(!`${landing}\n${engine}`.includes(prohibited), `Engine Room contains prohibited behavior or treatment: ${prohibited}`);
}

containsAll('responsive workspace', workspaceCss, [
  'min-height: 44px', 'env(safe-area-inset-bottom)', '.mobile-bottom-nav', '.intelligence-workspace', '@media (prefers-reduced-motion: reduce)'
]);
containsAll('pricing entitlements', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
containsAll('FAQ contract', faq, ['<details', 'What is Sovereign.OS?', 'Can I correct or remove an interpretation?']);
containsAll('canonical visual imports', main, [
  "import './engine-room-safe-area.css'", "import './engine-room.css'"
]);
assert(main.indexOf("import './engine-room.css'") > main.indexOf("import './engine-room-safe-area.css'"), 'Engine Room must load after its safe-area layer.');
assert(!main.slice(main.indexOf("import './engine-room.css'") + "import './engine-room.css'".length).includes("import './"), 'No local visual layer may load after Engine Room.');
assert(!existsSync(resolve(root, 'apps/web/src/experience-reconciliation.css')), 'Retired visual override was restored.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');

for (const [label, css] of [['workspace', workspaceCss], ['Engine Room', engine], ['Engine Room safe area', engineSafeArea]]) {
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
  canonicalVisualLayers: ['engine-room-safe-area.css', 'engine-room.css'],
  coveredSurfaces: ['home', 'how-it-works', 'pricing', 'faq', 'login', 'signup', 'onboarding', 'invitation', 'workspace', 'privacy', 'terms', 'not-found'],
  responsiveBreakpoints: ['1120px', '900px', '760px', '440px'],
  exactBasis: true,
  contextualCovenant: true,
  continuousEngine: true
}, null, 2));
