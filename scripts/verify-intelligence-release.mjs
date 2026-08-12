import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const containsAll = (label, text, values) => values.forEach((value) => assert(text.includes(value), `${label} is missing: ${value}`));

const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;
const workspace = read('apps/web/src/SovereignIntelligenceWorkspace.tsx');
const landing = read('apps/web/src/PublicLanding.tsx');
const stories = read('apps/web/src/LandingProductStories.tsx');
const field = read('apps/web/src/expression-field/LandingExpressionSlice.tsx');
const fingerprint = read('apps/web/src/v0-release-fingerprint.ts');
const v0Platform = read('apps/web/src/v0-platform-port.css');
const v0Motion = read('apps/web/src/v0-motion-accessibility.css');
const v0Visual = read('apps/web/src/v0-visual-port.css');
const v0Global = read('apps/web/src/v0-global-experience.css');
const fieldCss = read('apps/web/src/landing-expression-field-v3.css');
const fieldIntegration = read('apps/web/src/landing-expression-field-integration.css');
const storyCss = read('apps/web/src/v0-restored-product-stories.css');
const heroVisual = read('apps/web/src/landing-hero-field-v4.css');
const passkeyCss = read('apps/web/src/passkey-auth.css');
const staticAuthority = read('apps/web/public/premium-public-release.css');
const staticV0 = read('apps/web/public/v0-public-port.css');
const main = read('apps/web/src/main.tsx');
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

containsAll('founder v0 runtime fingerprint', fingerprint, [
  `V0_ARCHIVE_SHA256 = '${archiveSha}'`,
  `V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`,
  "PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'",
  "PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'",
  "dataset.sovereignVisualContract = 'v0-landing-selective-port'",
  'dataset.sovereignV0Archive = V0_ARCHIVE_SHA256',
  'dataset.sovereignV0Sequence = V0_SEQUENCE_FINGERPRINT'
]);

containsAll('founder v0 public product contract', landing, [
  `const V0_ARCHIVE_SHA = '${archiveSha}'`,
  'data-visual-contract="v0-landing-selective-port"',
  'data-viewport-contract="v0-public-landing-v3"',
  'Healing isn’t optional.',
  'Holding onto the pain is.',
  '<LandingExpressionSlice />',
  '<RealLifeQuestions />',
  'Bring the question you actually have.',
  'Why do we keep having the same fight?',
  'What is mine, what is theirs, and what happens between us?',
  '<LandingProductStories />',
  '<ComparisonStory />',
  '<FinalCallToAction />',
  'Other AI answers',
  'everyone the same.',
  'Your thoughts deserve',
  'a better place to live.'
]);

containsAll('restored product stories', stories, [
  '<PersonalStory />',
  '<RelationshipStory />',
  '<SystemStory />',
  'Ask about your life.',
  'Get an answer built for you.',
  'Understand what happens',
  'between you.',
  'From one person',
  'to the whole system.',
  'surface="personal-chat"',
  'surface="personal-reasoning"',
  'surface="relationship-chat"',
  'surface="relationship-reasoning"',
  'surface="system-map"',
  'surface="system-reasoning"',
  'Seeing the capacity beneath it',
  'Keeping both people distinct',
  'Mapping the people',
  'Illustrative permitted Baselines',
  'No compatibility score',
  'Each person controls what may be included',
  'className="v0-baseline-trace"',
  'v0-workflow-panel',
  'v0-family-system-map'
]);

containsAll('interactive 360 hero field', `${field}\n${fieldCss}\n${fieldIntegration}\n${heroVisual}`, [
  'landing-expression-field-v3',
  'data-field-geometry="spherical-360"',
  'onPointerDown={handlePointerDown}',
  'onPointerMove={handlePointerMove}',
  'landing-expression-slice__readout',
  'MIN_AXIS_LENGTH',
  'MAX_AXIS_LENGTH',
  'Math.pow(normalized, 1.32)',
  'buildSphereGrid',
  'requestAnimationFrame',
  '.landing-expression-slice__ambient',
  '.landing-expression-slice__sphere-shell',
  '.landing-expression-slice__sphere-grid path',
  'stroke: #2f93ff',
  'background: transparent',
  'border-radius: 0'
]);
assert(!field.includes('<div className="landing-expression-slice__tooltip"'), 'The retired floating tooltip returned.');
for (const prohibited of ['Math.random', 'giftExpression', 'shadowExpression']) {
  assert(!field.includes(prohibited), `Interactive field contains prohibited ${prohibited}.`);
}
containsAll('real-life question visual authority', heroVisual, [
  '.landing-question-orbit',
  '.landing-question-orbit__stage',
  '@keyframes landing-real-question',
  '@media (prefers-reduced-motion: reduce)'
]);

assert(!stories.includes('LandingExpressionFieldPreview'), 'Restored stories reintroduced the retired Expression Field preview.');
for (const prohibited of ['sphere', 'globe']) {
  assert(!stories.includes(prohibited), `Restored stories contain prohibited ${prohibited} visual language.`);
}

containsAll('founder v0 visual components', `${landing}\n${stories}\n${v0Visual}\n${storyCss}\n${heroVisual}`, [
  'className="v0-baseline-trace"',
  'v0-window v0-flow v0-workflow-panel',
  'v0-family-system-map',
  'className="v0-comparison-grid"',
  '.v0-hero',
  '.v0-story-grid',
  '.landing-question-orbit',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.account-shell',
  '@media (max-width: 760px)',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('founder v0 application route coverage', v0Platform, [
  'body:has(.plan-onboarding)',
  'body:has(.sovereign-policy)',
  'body:has(.email-code-fallback)',
  '.onboarding-plan-grid',
  '.policy-grid',
  '.email-code-fallback',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('founder v0 standalone route coverage', `${staticAuthority}\n${staticV0}`, [
  "@import url('/v0-public-port.css?v=20260801-founder-v0')",
  `Archive SHA-256: ${archiveSha}`,
  'body.launch-page',
  '.launch-nav',
  '.launch-hero',
  '.journey-steps',
  '.pricing-grid',
  '.faq-list details',
  '.launch-footer'
]);

for (const prohibited of ['Know yourself.', 'Understand the system.', 'Choose what fits.', 'Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'generateAIResponse', 'Demo User']) {
  assert(!`${landing}\n${stories}`.includes(prohibited), `Public landing contains rejected reconstruction, mock, or scoring behavior: ${prohibited}`);
}

containsAll('final v0 visual import', main, [
  "import { installV0ReleaseFingerprint } from './v0-release-fingerprint'",
  "import './v0-platform-port.css'",
  "import './v0-motion-accessibility.css'",
  "import './v0-visual-port.css'",
  "import './v0-global-experience.css'",
  "import './landing-expression-field-v3.css'",
  "import './landing-expression-field-integration.css'",
  "import './v0-restored-product-stories.css'",
  "import './landing-hero-field-v4.css'",
  "import './passkey-auth.css'",
  'installV0ReleaseFingerprint();'
]);
const platformImport = "import './v0-platform-port.css';";
const motionImport = "import './v0-motion-accessibility.css';";
const v0Import = "import './v0-visual-port.css';";
const globalImport = "import './v0-global-experience.css';";
const fieldImport = "import './landing-expression-field-v3.css';";
const integrationImport = "import './landing-expression-field-integration.css';";
const storiesImport = "import './v0-restored-product-stories.css';";
const heroImport = "import './landing-hero-field-v4.css';";
const passkeyImport = "import './passkey-auth.css';";
assert(main.indexOf(platformImport) < main.indexOf(motionImport), 'Platform route coverage must load before reduced-motion coverage.');
assert(main.indexOf(motionImport) < main.indexOf(v0Import), 'Reduced-motion coverage must load before the founder v0 foundation.');
assert(main.indexOf(v0Import) < main.indexOf(globalImport), 'Global product authority must load after the founder v0 foundation.');
assert(main.indexOf(globalImport) < main.indexOf(fieldImport), 'Landing field must load after global product authority.');
assert(main.indexOf(fieldImport) < main.indexOf(integrationImport), 'Landing field integration must load after the field geometry.');
assert(main.indexOf(integrationImport) < main.indexOf(storiesImport), 'Restored product story authority must load after field integration.');
assert(main.indexOf(storiesImport) < main.indexOf(heroImport), 'Hero interaction authority must load after public story authority.');
assert(main.indexOf(heroImport) < main.indexOf(passkeyImport), 'Passkey styling must load after hero interaction authority.');
assert(!main.slice(main.indexOf(passkeyImport) + passkeyImport.length).includes("import './"), 'A local visual file loads after the passkey-specific final authority.');

for (const [label, document] of [['How it works', how], ['Pricing', pricing], ['FAQ', faq]]) {
  containsAll(label, document, ['Sovereign.OS', 'Build my Baseline', '/premium-public-release.css?v=20260730-final']);
}
containsAll('Pricing entitlements', pricing, ['$0', '$20', '$99 / year', '10 Sovereign AI turns each month', '300 Sovereign AI turns each month']);
containsAll('FAQ contract', faq, ['<details', 'What is Sovereign.OS?', 'Can I correct or remove an interpretation?']);

assert(!existsSync(resolve(root, 'apps/web/src/experience-reconciliation.css')), 'Retired visual override was restored.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');

for (const [label, css] of [
  ['founder v0 platform', v0Platform],
  ['founder v0 motion', v0Motion],
  ['founder v0 foundation', v0Visual],
  ['founder v0 global product', v0Global],
  ['landing field', fieldCss],
  ['landing field integration', fieldIntegration],
  ['restored product stories', storyCss],
  ['hero field and questions', heroVisual],
  ['passkey-specific authority', passkeyCss],
  ['founder v0 standalone', staticV0]
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
  visualAuthority: 'founder-v0-selective-port',
  publicLandingContract: 'v0-public-landing-v3',
  publicField: 'landing-expression-field-v3-spherical-360',
  questionTreatment: 'rotating-real-life-questions',
  archiveSha256: archiveSha,
  sequenceFingerprint,
  mockRuntimeImported: false,
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  canonicalVisualLayers: ['v0-platform-port.css', 'v0-motion-accessibility.css', 'v0-visual-port.css', 'v0-global-experience.css', 'landing-expression-field-v3.css', 'landing-expression-field-integration.css', 'v0-restored-product-stories.css', 'landing-hero-field-v4.css', 'passkey-auth.css', 'v0-public-port.css'],
  coveredSurfaces: ['home', 'how-it-works', 'pricing', 'faq', 'login', 'signup', 'onboarding', 'invitation', 'workspace', 'privacy', 'terms', 'not-found'],
  exactBasis: true,
  contextualCovenant: true,
  selectiveVisualPort: true
}, null, 2));
