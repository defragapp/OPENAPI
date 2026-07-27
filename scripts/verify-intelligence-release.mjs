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
const ui = read('apps/web/public/intelligence-ui.js');
const css = read('apps/web/public/intelligence-ui.css');
const serviceWorker = read('apps/web/public/sw.js');
const prompt = read('apps/sovereign-worker/src/agent/prompt-v1.ts');

new Function(ui);

containsAll('web index', index, [
  '/intelligence-ui.css?v=20260726-baseline-first-r1',
  '/intelligence-ui.js?v=20260726-baseline-first-r1',
  '/recognition-ui.js',
  '/archetype-clarity.js'
]);

containsAll('visual intelligence runtime', ui, [
  "fetch('/api/v1/today'",
  'YOUR BASELINE, ALIVE TODAY',
  'baseline-core-object',
  'live-sky-halo',
  'ALIGNMENT NEEDLE',
  'SHADOW–LIGHT RAIL',
  'perspective-split',
  'system-map-preview',
  'structured-response-grid',
  'sovereign-context-bar'
]);

containsAll('visual intelligence stylesheet', css, [
  '.baseline-orbit',
  '.alignment-instrument',
  '.shadow-light-instrument',
  '.perspective-split',
  '.system-map-preview',
  '.structured-response-grid',
  '@media (max-width: 680px)',
  '@media (prefers-contrast: more)',
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
assert(!ui.match(/compatibility percentage|numerical score|private thoughts are known/i), 'Disallowed certainty or scoring language is present.');
assert(serviceWorker.includes("sovereign-public-v6"), 'Service worker cache version was not advanced.');
assert(serviceWorker.includes("'/intelligence-ui.css'"), 'Visual intelligence CSS is not cached.');
assert(serviceWorker.includes("'/intelligence-ui.js'"), 'Visual intelligence JS is not cached.');

const openBraces = (css.match(/{/g) ?? []).length;
const closeBraces = (css.match(/}/g) ?? []).length;
assert(openBraces === closeBraces, `Visual intelligence CSS has unbalanced braces (${openBraces}/${closeBraces}).`);

console.log(JSON.stringify({
  ok: true,
  contract: 'baseline-first-visual-intelligence-v1',
  assets: ['intelligence-ui.js', 'intelligence-ui.css'],
  agentFlow: 'baseline-first',
  responsive: true,
  reducedMotion: true,
  highContrast: true
}, null, 2));