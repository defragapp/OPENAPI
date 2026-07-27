import { readFileSync } from 'node:fs';

const main = readFileSync('apps/web/src/main.tsx', 'utf8');
const workspace = readFileSync('apps/web/src/SovereignIntelligenceWorkspace.tsx', 'utf8');
const workspaceCss = readFileSync('apps/web/src/visual-intelligence.css', 'utf8');
const membership = readFileSync('apps/web/src/SystemMembershipManager.tsx', 'utf8');
const membershipCss = readFileSync('apps/web/src/system-membership.css', 'utf8');
const product = readFileSync('apps/sovereign-worker/src/db/product.ts', 'utf8');

function requireAll(label, source, values) {
  for (const value of values) {
    if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
  }
}

requireAll('authenticated app entry', main, [
  "import { SovereignIntelligenceWorkspace } from './SovereignIntelligenceWorkspace'",
  "import { SystemMembershipManager } from './SystemMembershipManager'",
  "import './visual-intelligence.css'",
  "import './system-membership.css'",
  "location.pathname === '/app'",
  '<SovereignIntelligenceWorkspace />',
  '<SystemMembershipManager />'
]);

requireAll('visual intelligence workspace', workspace, [
  'YOUR BASELINE, ALIVE TODAY',
  'YOUR BASELINE CORE',
  'LIVE SKY',
  'Bring a choice into view',
  'Shadow pull',
  'Aligned expression',
  'TWO PEOPLE · TWO BASELINES · ONE RELATIONSHIP',
  'Possible perspective based only on information they permitted.',
  'SEE THE WHOLE SYSTEM',
  'KEEP WHAT CHANGES HOW YOU UNDERSTAND',
  'Scripture, teaching, and application',
  'This interpretation is a possibility grounded in the available context.',
  "api('/api/v1/today')",
  "api('/api/v1/people')",
  "api('/api/v1/systems')",
  "api('/api/v1/library')",
  "api('/api/v1/billing/entitlements')",
  "api('/api/v1/threads')",
  'Does this fit?',
  "saveCorrection('partly')",
  "bibleTranslation: enabled ? 'WEB' : undefined",
  'No compatibility score. No winner and loser.'
]);

requireAll('visual intelligence accessibility', workspaceCss, [
  'font-size: 17px',
  'min-height: 44px',
  'width: 44px',
  'height: 44px',
  '@media (max-width: 820px)',
  '@media (max-width: 640px)',
  '@media (prefers-contrast: more)',
  '@media (prefers-reduced-motion: reduce)',
  'env(safe-area-inset-bottom)',
  ':focus-visible'
]);

requireAll('system membership manager', membership, [
  "person.identityBound === true",
  "person.activeScopes.includes('system.include')",
  "api('/api/v1/systems')",
  "api('/api/v1/people')",
  '/members`,',
  'Add only permitted people.',
  'Add permitted member',
  'consent active'
]);

requireAll('system membership accessibility', membershipCss, [
  'min-height:44px',
  'min-height:46px',
  'min-height:48px',
  '@media(max-width:560px)',
  'env(safe-area-inset-bottom)'
]);

requireAll('consent-safe system projection', product, [
  'FROM system_memberships sm',
  "cg.scope = 'system.include'",
  "i.status = 'accepted'",
  'cg.granted_at IS NOT NULL AND cg.revoked_at IS NULL',
  'p.bound_account_id IS NOT NULL',
  'members: membersBySystem.get(row.id) ?? []',
  "await requireConsent(env, accountId, personId, 'system.include')"
]);

for (const forbidden of [
  'God is telling you',
  'They secretly want',
  'This proves',
  'You are incompatible'
]) {
  if (workspace.toLowerCase().includes(forbidden.toLowerCase())) {
    throw new Error(`Visual intelligence workspace contains prohibited framing: ${forbidden}`);
  }
}

console.log('Visual intelligence release verified.');
