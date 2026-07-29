import { readFileSync } from 'node:fs';

const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const authenticatedWorkspace = readFileSync('apps/web/src/AuthenticatedWorkspace.tsx', 'utf8');
const workspace = readFileSync('apps/web/src/SovereignIntelligenceWorkspace.tsx', 'utf8');
const workspaceCss = `${readFileSync('apps/web/src/workspace-chat.css', 'utf8')}\n${readFileSync('apps/web/src/experience-reconciliation.css', 'utf8')}`;
const landing = readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');
const landingCss = `${readFileSync('apps/web/src/public-landing.css', 'utf8')}\n${readFileSync('apps/web/src/experience-reconciliation.css', 'utf8')}`;
const experienceV3 = `${readFileSync('apps/web/src/sovereign-experience-v3.css', 'utf8')}\n${readFileSync('apps/web/src/sovereign-experience-v3-fixes.css', 'utf8')}`;
const contextField = readFileSync('apps/web/public/assets/sovereign-context-field.svg', 'utf8');
const staticExperienceCss = readFileSync('apps/web/public/static-experience.css', 'utf8');
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
  "import './experience-reconciliation.css'",
  "import './sovereign-experience-v3.css'",
  "import './sovereign-experience-v3-fixes.css'",
  "location.pathname === '/app'",
  '<AuthenticatedWorkspace />'
]);

requireAll('authenticated workspace gate', authenticatedWorkspace, [
  "import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace'",
  "import { AccountControlCenter } from './AccountControlCenter'",
  "import { SystemMembershipManager } from './SystemMembershipManager'",
  "fetch('/api/v1/account/onboarding'",
  "location.replace(`/login?returnTo=",
  "location.replace('/onboarding')",
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

requireAll('workspace layout and accessibility', workspaceCss, [
  'width: 220px',
  'width: 360px',
  'width: min(100%, 1120px)',
  'min-height: 44px',
  'font-size: 1rem',
  '@media (max-width: 1180px)',
  '@media (max-width: 980px)',
  '@media (max-width: 760px)',
  '@media (max-width: 420px)',
  '@media (prefers-reduced-motion: reduce)',
  'env(safe-area-inset-bottom)'
]);

requireAll('public category clarity', landing, [
  'PERSONAL AI FOR REAL LIFE',
  'Ask about your life.',
  'Get an answer built around you.',
  'private personal AI',
  'Why do I keep taking responsibility for everyone else?',
  'EXAMPLE ANSWER',
  'Sanitized demonstration · Not your Baseline',
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
  'PRESSURE FIELD'
]);

requireAll('public brand hierarchy', landing, [
  'Healing isn’t optional. Holding the pain is.',
  'WHY THIS AI IS DIFFERENT',
  'Most AI starts with a blank prompt. Sovereign starts with you.',
  'Know yourself. Understand the system. Choose what fits.'
]);

requireAll('public visual accessibility', landingCss, [
  'font-size: clamp(3.45rem, 5vw, 4.7rem)',
  'min-height: 44px',
  'min-width: 320px',
  '@media (max-width: 980px)',
  '@media (max-width: 760px)',
  '@media (max-width: 420px)',
  '@media (prefers-reduced-motion: reduce)'
]);

requireAll('Sovereign v3 product environment', experienceV3, [
  'context reorganizes around the question',
  "url('/assets/sovereign-context-field.svg')",
  '.landing-hero::before',
  '.living-answer',
  '.question-section',
  '.public-answer-stage',
  '.baseline-now-visual::before',
  '.baseline-invitation::after',
  '.sovereign-composer',
  '.mobile-bottom-nav',
  '@media (max-width: 560px)',
  '@media (prefers-reduced-motion: reduce)',
  'env(safe-area-inset-bottom)'
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
  '--paper: #0a0c0b',
  '.pricing-grid',
  '.pricing-page .pricing-hero > p:last-child',
  '.questions-page .questions-hero > p:last-child',
  '.questions-page .faq-section',
  '.price-card-body',
  '.plan-comparison-list',
  '.faq-list details',
  'border-radius: 1px',
  'margin-inline: 0',
  '@media (max-width: 860px)',
  '@media (prefers-reduced-motion: reduce)'
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

console.log('Sovereign category-first product stage and workspace visual contract verified.');
