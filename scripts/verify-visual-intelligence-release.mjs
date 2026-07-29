import { readFileSync } from 'node:fs';

const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const workspace = readFileSync('apps/web/src/SovereignIntelligenceWorkspace.tsx', 'utf8');
const workspaceCss = readFileSync('apps/web/src/workspace-chat.css', 'utf8');
const landing = readFileSync('apps/web/src/PublicLanding.tsx', 'utf8');
const landingCss = readFileSync('apps/web/src/public-landing.css', 'utf8');
const tokens = readFileSync('apps/web/src/styles.css', 'utf8');
const membership = readFileSync('apps/web/src/SystemMembershipManager.tsx', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');

function requireAll(label, source, values) {
  for (const value of values) {
    if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
  }
}

requireAll('authenticated app entry', main, [
  "import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace'",
  "import { SystemMembershipManager } from './SystemMembershipManager'",
  "import './workspace-chat.css'",
  "location.pathname === '/app'",
  '<SovereignIntelligenceWorkspace />',
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
  'width: 272px',
  'width: 390px',
  'width: min(100%, 916px)',
  'min-height: 44px',
  'font-size: 1rem',
  '@media (max-width: 1180px)',
  '@media (max-width: 920px)',
  '@media (max-width: 700px)',
  '@media (max-width: 360px)',
  '@media (prefers-reduced-motion: reduce)',
  'env(safe-area-inset-bottom)'
]);

requireAll('public category clarity', landing, [
  'PERSONAL AI FOR REAL LIFE',
  'Ask about your life.',
  'Get an answer built around you.',
  'private personal AI',
  'Why do I keep taking responsibility for everyone else?',
  'EXAMPLE SOVEREIGN ANSWER',
  'Build my Baseline'
]);

requireAll('public product stage', landing, [
  'Direct answer',
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
  'font-size: clamp(3.4rem, 5.1vw, 4.25rem)',
  'min-height: 44px',
  'min-width: 320px',
  '@media (max-width: 1040px)',
  '@media (max-width: 760px)',
  '@media (max-width: 440px)',
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
