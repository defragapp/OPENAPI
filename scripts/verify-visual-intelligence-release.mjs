import { existsSync, readFileSync } from 'node:fs';

const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const authenticatedWorkspace = readFileSync('apps/web/src/AuthenticatedWorkspace.tsx', 'utf8');
const workspace = readFileSync('apps/web/src/SovereignIntelligenceWorkspace.tsx', 'utf8');
const hardening = readFileSync('apps/web/src/premium-surface-hardening.css', 'utf8');
const selectivePort = readFileSync('apps/web/src/selective-visual-port.css', 'utf8');
const workspaceCss = `${readFileSync('apps/web/src/workspace-chat.css', 'utf8')}\n${readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8')}\n${hardening}\n${selectivePort}`;
const landing = readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');
const landingCss = `${readFileSync('apps/web/src/public-landing.css', 'utf8')}\n${readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8')}\n${hardening}\n${selectivePort}`;
const cohesion = readFileSync('apps/web/src/sovereign-cohesion.css', 'utf8');
const contextField = readFileSync('apps/web/public/assets/sovereign-context-field.svg', 'utf8');
const staticExperienceCss = readFileSync('apps/web/public/static-experience.css', 'utf8');
const how = readFileSync('apps/web/public/how-it-works.html', 'utf8');
const pricing = readFileSync('apps/web/public/pricing.html', 'utf8');
const faq = readFileSync('apps/web/public/faq.html', 'utf8');
const tokens = readFileSync('apps/web/src/styles.css', 'utf8');
const membership = readFileSync('apps/web/src/SystemMembershipManager.tsx', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');

function requireAll(label, source, values) {
  for (const value of values) {
    if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
  }
}

requireAll('authenticated app entry', main, [
  "import { AuthenticatedWorkspace } from './AuthenticatedWorkspace'",
  "import './workspace-chat.css'",
  "import './sovereign-cohesion.css'",
  "import './premium-surface-hardening.css'",
  "import './selective-visual-port.css'",
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);

for (const retired of [
  'apps/web/src/experience-reconciliation.css',
  'apps/web/src/sovereign-experience-v3.css',
  'apps/web/src/sovereign-experience-v3-fixes.css'
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

requireAll('canonical cohesion system', cohesion, [
  'Sovereign.OS cohesion release',
  'Canonical presentation layer',
  '--cohesion-night:#080a09',
  '--cohesion-paper:#ece5da',
  '--cohesion-clay:#c98a64',
  '--cohesion-sage:#a5b5a2',
  "url('/assets/sovereign-context-field.svg')",
  '.hero-intelligence-stage',
  '.baseline-context-stage',
  '.scale-experience',
  '.question-section',
  '.permission-field',
  '.intelligence-workspace',
  '.sovereign-composer',
  '.mobile-bottom-nav',
  'grid-template-columns:repeat(6,minmax(0,1fr))',
  '@media(max-width:1180px)',
  '@media(max-width:980px)',
  '@media(max-width:760px)',
  '@media(max-width:560px)',
  '@media(max-width:420px)',
  '@media(prefers-reduced-motion:reduce)',
  'env(safe-area-inset-bottom)'
]);

requireAll('selective visual port layer', `${landing}\n${hardening}\n${selectivePort}`, [
  'STEP 01 · YOU',
  'STEP 02 · YOU + 1',
  'STEP 03 · YOUR WHOLE SYSTEM',
  'visual-reasoning-panel',
  'className="visual-evidence-chips"',
  'className="relationship-baseline-pair"',
  'className="story-system-map"',
  '.sovereign-story-step',
  '.response-thread .answer-baseline',
  '.response-thread .relationship-answer > div:first-child',
  '.system-overview .system-graph',
  '.response-thread .basis-strip',
  '.relationship-baseline-pair',
  '.story-fixture-boundary'
]);

requireAll('workspace layout and accessibility', workspaceCss, [
  'width:224px',
  'width:360px',
  'width:min(100%,1120px)',
  'min-height:44px',
  'font-size:1rem',
  '@media(max-width:980px)',
  '@media(max-width:760px)',
  '@media(max-width:420px)',
  '@media (max-width: 680px)',
  '@media(prefers-reduced-motion:reduce)',
  '@media (prefers-reduced-motion: reduce)',
  'env(safe-area-inset-bottom)'
]);

requireAll('public category clarity', landing, [
  'Know yourself.',
  'Understand the system.',
  'Choose what fits.',
  'private AI for understanding yourself',
  'Why do I keep taking responsibility for everyone else?',
  'EXAMPLE ANSWER',
  'Sanitized demonstration · Not your Baseline',
  'Sanitized product demonstrations · Illustrative Baseline values · Not your personal result',
  'Build my Baseline'
]);
if (landing.indexOf('Sanitized demonstration · Not your Baseline') > landing.indexOf('YOU ASKED')) {
  throw new Error('The public answer boundary must appear before the demonstration question.');
}

requireAll('public product stage', landing, [
  'DIRECT ANSWER',
  'THE PERSONAL CONNECTION',
  'A PRACTICAL NEXT STEP',
  'Why this is personal',
  'Shadow',
  'Gift',
  'Alignment',
  'BASIS',
  'YOUR BASELINE',
  'WHAT MAY BE ACTIVE NOW',
  'YOUR CONFIRMATION',
  'STILL UNKNOWN',
  'WHAT HAPPENS BETWEEN YOU',
  'PRESSURE FIELD',
  'PERMISSION BEFORE COMPARISON'
]);

if (landing.includes('Healing isn’t optional. Holding the pain is.')) {
  throw new Error('The public homepage must not present Sovereign.OS as a healing product.');
}
for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'localStorage']) {
  if (landing.includes(prohibited)) throw new Error(`The public homepage contains prohibited mock or scoring behavior: ${prohibited}`);
}

requireAll('public visual accessibility', landingCss, [
  'font-size:clamp(3.75rem,5.2vw,4.25rem)',
  'min-height:44px',
  'min-width: 320px',
  '.relationship-baseline-pair',
  '.story-person-node[aria-pressed="true"]',
  '@media(max-width:980px)',
  '@media(max-width:760px)',
  '@media(max-width:420px)',
  '@media (max-width: 680px)',
  '@media(prefers-reduced-motion:reduce)',
  '@media (prefers-reduced-motion: reduce)',
  '@media (forced-colors: active)'
]);

requireAll('Sovereign context field asset', contextField, [
  '<title id="title">Sovereign context field</title>',
  'translucent planes and lines reorganizing around a central opening',
  '<linearGradient id="planeA"',
  '<linearGradient id="planeB"',
  '<filter id="depth"',
  'aria-labelledby="title description"'
]);

requireAll('static public support experience', staticExperienceCss, [
  '--paper: #080a09',
  '.pricing-grid',
  '.pricing-page .pricing-hero > p:last-child',
  '.questions-page .questions-hero > p:last-child',
  '.price-card-body',
  '.plan-comparison-list',
  '.faq-list details',
  'border-radius: 2px',
  'min-width: 320px',
  '@media (max-width: 860px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('static page cohesion', `${how}\n${pricing}\n${faq}`, [
  '20260730-cohesion',
  'Private personal, relationship, and system intelligence',
  'Build my Baseline',
  '$20',
  '$99',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  'permission'
]);

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
  if (`${workspace}\n${landing}`.toLowerCase().includes(prohibited.toLowerCase())) {
    throw new Error(`User interface contains prohibited framing: ${prohibited}`);
  }
}

for (const [label, css] of [
  ['premium hardening', hardening],
  ['selective visual port', selectivePort]
]) {
  const open = (css.match(/{/g) ?? []).length;
  const close = (css.match(/}/g) ?? []).length;
  if (open !== close) throw new Error(`${label} CSS has unbalanced braces (${open}/${close}).`);
}

console.log('Sovereign.OS cohesion release visual and product contract verified.');
