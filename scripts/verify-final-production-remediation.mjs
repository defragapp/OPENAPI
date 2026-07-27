import { existsSync, readFileSync } from 'node:fs';

const workspace = readFileSync('apps/web/src/SovereignIntelligenceWorkspace.tsx', 'utf8');
const agent = readFileSync('apps/sovereign-worker/src/agent/sovereign.ts', 'utf8');
const alignment = readFileSync('apps/sovereign-worker/src/agent/alignment-contract.ts', 'utf8');
const threads = readFileSync('apps/sovereign-worker/src/db/threads.ts', 'utf8');
const auth = readFileSync('apps/sovereign-worker/src/auth-public.ts', 'utf8');
const account = readFileSync('apps/web/src/ReleaseAccountPage.tsx', 'utf8');
const membership = readFileSync('apps/web/src/SystemMembershipManager.tsx', 'utf8');
const runtime = readFileSync('apps/sovereign-worker/src/runtime-entry.ts', 'utf8');
const indexHtml = readFileSync('apps/web/index.html', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

function requireAll(label, source, values) {
  for (const value of values) if (!source.includes(value)) throw new Error(`${label} is missing ${value}`);
}

requireAll('thread-bound workspace', workspace, [
  'startNewThread(next',
  'previous response keeps its original context',
  'lastContext?.surface ?? surfaceFromContextKind',
  'message.context?.surface',
  'personId: context.personId',
  'systemId: context.systemId'
]);

requireAll('context-preserving visual responses', workspace, [
  'today={workspace.today}',
  'people={workspace.people}',
  'latestAssistant.interfaceActions?.alignment',
  'decodeSovereignResponse(raw)'
]);

if (workspace.includes('alignmentFromText') || workspace.includes('text.length > 900') || workspace.includes('text.length > 420')) {
  throw new Error('Alignment still derives direction or confidence from prose heuristics.');
}

requireAll('validated alignment contract', `${agent}\n${alignment}`, [
  'alignmentResultSchema',
  'alignmentJsonContract()',
  'parseAlignmentResult(raw)',
  'supporting_factors',
  'counter_factors',
  'missing_context',
  'confidence: alignment.confidence',
  'encodeResponseMetadata(text, alignment, plan)'
]);

requireAll('persisted message context', threads, [
  'covenantEnabled',
  'activeContext = payloadContext(payload, activeContext)',
  'decodeResponseMetadata(rawText)',
  'surfaceFromContextKind'
]);

requireAll('reachable controls', workspace, [
  'People & Permissions',
  "window.dispatchEvent(new CustomEvent('sovereign:open-consent-controls'))",
  "method: 'DELETE'",
  'Rename this saved understanding',
  'Delete account',
  '/api/v1/deletion-jobs'
]);

requireAll('auth return continuity', `${auth}\n${account}`, [
  'safeReturnTo',
  'returnTo',
  "redeem.searchParams.set('returnTo', returnTo)",
  "onboarding?.onboarding_completed_at ? returnTo ?? '/app' : '/onboarding'",
  'aria-invalid={emailInvalid}',
  'aria-invalid={nameInvalid}'
]);

requireAll('system membership detail', membership, [
  'Authority',
  'Responsibility',
  'formalRole: role',
  'authority,',
  'responsibility,',
  "event.key !== 'Tab'"
]);

requireAll('public discovery and mobile navigation', `${runtime}\n${indexHtml}`, [
  'HTMLRewriter',
  '/release-public.css',
  '/release-public.js',
  'rel="canonical"',
  'og:image',
  'twitter:card'
]);

for (const file of ['apps/web/public/robots.txt', 'apps/web/public/sitemap.xml', 'apps/web/public/og-sovereign.svg', 'apps/web/public/release-public.css', 'apps/web/public/release-public.js']) {
  if (!existsSync(file)) throw new Error(`Production discovery asset is missing: ${file}`);
}

if (!(packageJson.scripts?.['verify:cloudflare-build'] ?? '').includes('verify:final-release')) {
  throw new Error('Cloudflare verification does not include the final remediation gate.');
}

console.log('Final production remediation verified.');
