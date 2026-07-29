import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
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
const workspaceCss = read('apps/web/src/workspace-chat.css');
const landing = read('apps/web/src/PublicLanding.tsx');
const landingCss = read('apps/web/src/public-landing.css');
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
  'version: z.literal(BASELINE_SOURCE_VERSION)',
  'version: z.literal(BASELINE_FACET_CONTRACT_VERSION)',
  'shadowExpression',
  'giftExpression',
  'alignmentMarkers',
  'basisRefs'
]);

containsAll('runtime prompt', prompt, [
  'A user does not need to report a problem',
  'Keep four layers separate',
  'Give the direct answer first',
  'Do not turn every answer into an action plan',
  'Alignment is not a score or rule',
  'Keep the people and the interaction distinct',
  'Select IDs only in basis_refs'
]);

containsAll('canonical workspace', workspace, [
  "version: 'sovereign-answer.v2'",
  "accept': 'application/vnd.sovereign.answer+json'",
  '<SovereignAnswerView',
  '<AlignmentView',
  '<RelationshipAnswer',
  '<SystemAnswer',
  '<BasisStrip',
  'Explore this through Covenant?',
  'Use for this question',
  "action.type === 'save_to_library'",
  "locationPrecision: 'geocentric'",
  'Remove current context',
  'Birth-time certainty',
  'Unknown time is supported.'
]);

containsAll('relationship and system intelligence', relational, [
  'pairFacetPairs',
  'sharedNeeds',
  'differentRoutes',
  'responsibilityAuthorityMismatch',
  'relationshipGraph: buildSupportedEdges',
  "hasConsent(env, accountId, personId, 'framework.display')"
]);

containsAll('contextual actions', actions, [
  'covenantFamilySignals',
  'covenantRelationalSignals',
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

containsAll('public product moment', landing, [
  'PRIVATE AI, BUILT AROUND YOUR BASELINE',
  'Know yourself.',
  'Understand the system.',
  'Choose what fits.',
  '<LivingSovereignAnswer />',
  'Sanitized demonstration fixture',
  'TWO PEOPLE · TWO BASELINES · ONE INTERACTION',
  '<SystemMap />',
  'No compatibility score. No mind-reading.'
]);

containsAll('responsive workspace', workspaceCss, [
  'width: 272px',
  'width: 390px',
  'grid-template-columns: repeat(5, 1fr)',
  'min-height: 44px',
  'env(safe-area-inset-bottom)',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('responsive landing', landingCss, [
  'min-width: 320px',
  '@media (max-width: 760px)',
  '@media (max-width: 440px)',
  '@media (prefers-reduced-motion: reduce)'
]);

assert(!main.match(/production-polish|baseline-orbit|visual-intelligence|refinement|landing-v2/), 'Obsolete style override remains imported.');
assert(!existsSync(resolve(root, 'apps/web/src/SovereignWorkspace.tsx')), 'Duplicate authenticated workspace remains.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');

const forbidden = [
  ['tar', 'ot'].join(''),
  ['visual', 'story'].join('_'),
  ['visual', 'story'].join(''),
  ['arch', 'etype'].join(''),
  ['alignment', 'from', 'text'].join(''),
  ['alignment', 'needle'].join(''),
  ['x-sovereign', 'visual', 'story'].join('-')
];
const scanRoots = ['apps', 'docs', 'packages'];
for (const file of scanRoots.flatMap((directory) => files(resolve(root, directory)))) {
  if (!/\.(?:ts|tsx|js|mjs|md|html|css|sql)$/.test(file)) continue;
  const source = readFileSync(file, 'utf8').toLowerCase();
  for (const token of forbidden) assert(!source.includes(token.toLowerCase()), `Removed presentation token remains in ${file.replace(`${root}/`, '')}.`);
}

for (const [label, css] of [['workspace', workspaceCss], ['landing', landingCss]]) {
  const openBraces = (css.match(/{/g) ?? []).length;
  const closeBraces = (css.match(/}/g) ?? []).length;
  assert(openBraces === closeBraces, `${label} CSS has unbalanced braces (${openBraces}/${closeBraces}).`);
}

console.log(JSON.stringify({
  ok: true,
  answerContract: 'sovereign-answer.v2',
  baselineContracts: ['baseline-source.v1', 'baseline-facets.v1'],
  canonicalWorkspace: 'SovereignIntelligenceWorkspace',
  exactBasis: true,
  contextualCovenant: true,
  removedPresentationSurface: true
}, null, 2));

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}
