import { existsSync, readFileSync } from 'node:fs';

const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const authenticatedWorkspace = readFileSync('apps/web/src/AuthenticatedWorkspace.tsx', 'utf8');
const workspace = readFileSync('apps/web/src/SovereignIntelligenceWorkspace.tsx', 'utf8');
const productCss = readFileSync('apps/web/src/sovereign-product-v2.css', 'utf8');
const precisionCss = readFileSync('apps/web/src/sovereign-product-precision.css', 'utf8');
const workspaceCss = `${readFileSync('apps/web/src/workspace-chat.css', 'utf8')}\n${readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8')}\n${productCss}\n${precisionCss}`;
const landing = readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');
const landingCss = `${readFileSync('apps/web/src/public-landing.css', 'utf8')}\n${readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8')}\n${productCss}\n${precisionCss}`;
const staticExperienceCss = readFileSync('apps/web/public/static-experience.css', 'utf8');
const staticProductCss = readFileSync('apps/web/public/sovereign-product-v2.css', 'utf8');
const staticPrecisionCss = readFileSync('apps/web/public/sovereign-product-precision.css', 'utf8');
const how = readFileSync('apps/web/public/how-it-works.html', 'utf8');
const pricing = readFileSync('apps/web/public/pricing.html', 'utf8');
const faq = readFileSync('apps/web/public/faq.html', 'utf8');
const tokens = readFileSync('apps/web/src/styles.css', 'utf8');
const membership = readFileSync('apps/web/src/SystemMembershipManager.tsx', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');

function requireAll(label, source, values) {
  for (const value of values) if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
}

function balanced(label, source) {
  const open = (source.match(/{/g) ?? []).length;
  const close = (source.match(/}/g) ?? []).length;
  if (open !== close) throw new Error(`${label} has unbalanced braces (${open}/${close})`);
}

requireAll('authenticated app entry', main, [
  "import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'",
  "import './workspace-chat.css'",
  "import './sovereign-product-v2.css'",
  "import './sovereign-product-precision.css'",
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);

for (const retired of [
  'apps/web/src/experience-reconciliation.css',
  'apps/web/src/sovereign-experience-v3.css',
  'apps/web/src/sovereign-experience-v3-fixes.css',
  'apps/web/src/engine-room.css'
]) {
  if (existsSync(retired)) throw new Error(`Retired visual override remains: ${retired}`);
  if (main.includes(retired.split('/').pop())) throw new Error(`Retired visual override is still imported: ${retired}`);
}

requireAll('authenticated workspace gate', authenticatedWorkspace, [
  "import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace'",
  "import { AccountControlCenter } from './AccountControlCenter'",
  "import { SystemMembershipManager } from './SystemMembershipManager'",
  "fetch('/api/v1/account/onboarding'",
  "location.replace(`/login?returnTo=",
  "location.replace('/onboarding')",
  'data-workspace-contract="one-room"',
  '<SovereignIntelligenceWorkspace onboardingVerified />',
  '<AccountControlCenter />',
  '<SystemMembershipManager />'
]);

requireAll('shared tokens', tokens, [
  '--sov-page: #0d0d0e',
  '--sov-panel: #151516',
  '--sov-raised: #1c1c1e',
  '--sov-paper: #eee8df',
  '--sov-clay: #dda273',
  '--sov-sage: #9fbaa1',
  '--sov-danger: #d19a9a'
]);

requireAll('answer renderer', workspace, [
  'className={`sovereign-answer answer-${answer.mode}`}',
  'className="direct-answer"',
  'Supports the fit',
  'Pulls against it',
  'The real tradeoff',
  'You may be bringing',
  'They may be bringing',
  'What happens between you',
  'className="system-graph"',
  'className="basis-strip"',
  'values.slice(0, limit)',
  'const limit = mobile ? 3 : 5',
  'role="dialog"',
  'aria-modal="true"'
]);

requireAll('reconciled product system', productCss, [
  'Sovereign.OS product reconciliation v2',
  '--s2-bg:#0a0d0c',
  '.product-v2 .landing-hero',
  '.product-v2 .answer-product',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.mobile-bottom-nav',
  '@media(max-width:760px)',
  '@media(prefers-reduced-motion:reduce)'
]);

requireAll('precision system', precisionCss, [
  'Sovereign.OS precision pass',
  '--precision-display',
  '--precision-text',
  '--precision-mono',
  '--s2-bg:#070908',
  '.product-v2 .answer-product',
  '.intelligence-workspace',
  'border-radius:0!important',
  '@media(max-width:760px)',
  '@media(prefers-reduced-motion:reduce)'
]);
if (precisionCss.includes('Iowan Old Style')) throw new Error('The precision layer restored rejected serif typography.');

requireAll('workspace layout and accessibility', workspaceCss, [
  'min-height:44px',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.mobile-bottom-nav',
  '@media(max-width:760px)',
  'env(safe-area-inset-bottom)',
  '@media(prefers-reduced-motion:reduce)'
]);

requireAll('public category clarity', landing, [
  'Ask about your life.',
  'Get an answer built around you.',
  'private personal AI for understanding yourself, your relationships, your decisions, and the groups around you',
  'Why do I keep taking responsibility for everyone else?',
  'Your ability to create direction is real. The problem begins when responsibility reaches you without matching authority.',
  'Sanitized demonstration · Not your Baseline',
  'Build my Baseline'
]);
if (landing.includes('INIT_BASELINE')) throw new Error('Rejected Engine Room vocabulary remains on the homepage.');
if (landing.includes('Know yourself.<br />Understand the system.')) throw new Error('The enduring brand line is being used as the homepage explanation.');

requireAll('public product stage', landing, [
  'DIRECT ANSWER',
  'WHAT MAY BE STEADY',
  'WHAT MAY BE ACTIVE NOW',
  'STILL UNKNOWN',
  'WHAT HAPPENS BETWEEN YOU',
  'PRESSURE FIELD',
  'PERMISSION BEFORE COMPARISON',
  '<PublicAnswerStage',
  '<PermissionField />',
  '<SystemMap />',
  'BASIS'
]);

requireAll('public visual accessibility', landingCss, [
  'min-width:320px',
  'min-height:44px',
  '.product-v2 .landing-hero',
  '.product-v2 .answer-product',
  '@media(max-width:760px)',
  '@media(prefers-reduced-motion:reduce)'
]);

requireAll('static support experience', `${staticExperienceCss}\n${staticProductCss}\n${staticPrecisionCss}`, [
  '.pricing-grid',
  '.questions-page .faq-section',
  '.price-card',
  '.faq-list details',
  '--precision-display',
  'min-width:320px',
  '@media(max-width:760px)',
  '@media(prefers-reduced-motion:reduce)'
]);

requireAll('static page cohesion', `${how}\n${pricing}\n${faq}`, [
  '/sovereign-product-v2.css?v=20260730-reconciliation',
  '/sovereign-product-precision.css?v=20260730-precision',
  'Private personal, relationship, and system intelligence',
  'Build my Baseline',
  '$20',
  '$99',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  'permission'
]);
if (pricing.includes('Begin with yourself. Expand when other people matter.')) throw new Error('Rejected pricing positioning remains.');

requireAll('system membership manager', membership, [
  "person.identityBound === true",
  "person.activeScopes.includes('system.include')",
  '/members`,',
  'Add only permitted people.',
  'Add permitted member'
]);

requireAll('consent-safe system projection', product, [
  'FROM system_memberships sm',
  "cg.scope = 'system.include'",
  "i.status = 'accepted'",
  'cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL',
  'p.bound_account_id IS NOT NULL',
  "await requireConsent(env, accountId, personId, 'system.include')"
]);

for (const prohibited of ['God is telling you', 'They secretly want', 'This proves', 'You are incompatible']) {
  if (`${workspace}\n${landing}`.toLowerCase().includes(prohibited.toLowerCase())) throw new Error(`User interface contains prohibited framing: ${prohibited}`);
}

for (const [label, source] of [
  ['product CSS', productCss],
  ['precision CSS', precisionCss],
  ['workspace CSS', workspaceCss],
  ['landing CSS', landingCss],
  ['static product CSS', staticProductCss],
  ['static precision CSS', staticPrecisionCss]
]) balanced(label, source);

console.log('Sovereign.OS reconciled product, typography, responsiveness, and consent contract verified.');
