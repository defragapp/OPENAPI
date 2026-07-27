import { readFileSync } from 'node:fs';
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

const index = read('apps/web/index.html');
const workspace = read('apps/web/src/SovereignWorkspace.tsx');
const workspaceCss = read('apps/web/src/workspace-chat.css');
const orbit = read('apps/web/src/BaselineOrbit.tsx');
const orbitCss = read('apps/web/src/baseline-orbit.css');
const serviceWorker = read('apps/web/public/sw.js');
const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');

containsAll('web index', index, ['/src/main.tsx']);
for (const retired of ['intelligence-ui.js', 'ux-audit-runtime.js', 'recognition-ui.js', 'archetype-clarity.js']) {
  assert(!index.includes(retired), `Legacy DOM runtime remains active: ${retired}`);
}

containsAll('conversation-first workspace', workspace, [
  "api('/api/v1/today')",
  "api('/api/v1/threads')",
  'YOUR BASELINE · AVAILABLE IN EVERY CONVERSATION',
  'What do you want to understand?',
  'className="conversation-shell"',
  'className="chat-composer"',
  'Save to Library',
  'Does this fit?',
  'Manage permissions',
  'Optional Christian and biblical lens for this conversation.'
]);

containsAll('workspace stylesheet', workspaceCss, [
  '.chat-sidebar',
  '.conversation-shell',
  '.workspace-context-panel',
  '.chat-composer',
  '@media (max-width: 800px)',
  '@media (prefers-contrast: more)',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('Baseline visual', orbit, [
  'YOUR BASELINE',
  'SHADOW',
  'LIGHT',
  'ALIGNED',
  'One quality'
]);
containsAll('Baseline visual stylesheet', orbitCss, [
  '.baseline-orbit',
  '.orbit-node-core',
  '.orbit-node-aligned',
  '@media (max-width: 700px)',
  '@media (prefers-reduced-motion: reduce)'
]);

containsAll('Baseline-first agent prompt', prompt, [
  'FOUNDATION ORDER',
  'BASELINE-FIRST FLOW',
  'Do not require the user to explain an incident',
  'choose response_phase "integration" and give a clear answer now',
  'The user’s story shows where the computed framework may be appearing',
  'Shadow and light',
  'Alignment',
  'Relationship',
  'System',
  'Covenant'
]);

assert(!prompt.includes('Unless the current message clearly answers a prior inward question'), 'Incident-first prompt language remains active.');
assert(!workspace.match(/compatibility percentage|numerical score|private thoughts are known/i), 'Disallowed certainty or scoring language is present.');
assert(serviceWorker.includes('sovereign-public-v8'), 'Service worker cache version was not advanced.');
assert(!serviceWorker.includes("'/app'"), 'Private workspace navigation must not be cached.');
assert(!serviceWorker.includes("'/intelligence-ui.js'"), 'Retired visual runtime remains cached.');

for (const [label, css] of [['workspace', workspaceCss], ['Baseline visual', orbitCss]]) {
  const openBraces = (css.match(/{/g) ?? []).length;
  const closeBraces = (css.match(/}/g) ?? []).length;
  assert(openBraces === closeBraces, `${label} CSS has unbalanced braces (${openBraces}/${closeBraces}).`);
}

console.log(JSON.stringify({
  ok: true,
  contract: 'conversation-first-baseline-intelligence-v2',
  assets: ['SovereignWorkspace.tsx', 'BaselineOrbit.tsx'],
  agentFlow: 'baseline-first',
  responsive: true,
  reducedMotion: true,
  highContrast: true
}, null, 2));
