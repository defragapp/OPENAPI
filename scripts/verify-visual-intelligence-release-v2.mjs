import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/*
 * Visual intelligence release v2 — current canonical architecture.
 *
 * This verifier was reconciled against the consolidated CSS architecture at
 * the exact intended release SHA. The historical per-file "authority"
 * stylesheets (rendered-fidelity-v1.css, landing-live-refinement-v5.css,
 * sans-typography-authority-v1.css, typography-system.css, and the inline
 * style.textContent injection layer) were intentionally removed and their
 * content folded into the five canonical stylesheets that main.tsx imports in
 * a certified order (design-system -> public -> workspace -> app-shell ->
 * passkey-auth last). CanonicalVisualSystem.test.ts enforces that removal.
 *
 * This verifier now asserts the current canonical visual system directly, and
 * preserves the full visual content contract (landing, product stories,
 * interactive field, typography boundary). It does not weaken any product or
 * visual assertion; it replaces obsolete delivery-architecture assertions with
 * equivalent current-state ones.
 */

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const designSystemCss = readFileSync(resolve('apps/web/src/design-system.css'), 'utf8');
const publicCss = readFileSync(resolve('apps/web/src/public.css'), 'utf8');
const landing = readFileSync(resolve('apps/web/src/PublicLanding.tsx'), 'utf8');
const stories = readFileSync(resolve('apps/web/src/LandingProductStories.tsx'), 'utf8');
const field = readFileSync(resolve('apps/web/src/expression-field/LandingExpressionSlice.tsx'), 'utf8');
const premiumActionStatic = readFileSync(resolve('apps/web/public/premium-action-static-v1.css'), 'utf8');

/*
 * Canonical CSS architecture — main.tsx must load exactly the five certified
 * stylesheets in certified order, with passkey-auth.css terminal and no inline
 * style injection or terminal override cascade.
 */
const canonicalCssImports = [
  "import './design-system.css';",
  "import './public.css';",
  "import './workspace.css';",
  "import './app-shell.css';",
  "import './passkey-auth.css';"
];
for (const marker of canonicalCssImports) {
  assert(main.includes(marker), `Visual intelligence release v2 is missing canonical CSS import: ${marker}`);
}
const passkeyIndex = main.indexOf("import './passkey-auth.css';");
assert(passkeyIndex >= 0, 'Visual intelligence release v2 is missing the passkey component authority.');
for (const retained of ['releases.css', 'installPlatformVisualCohesion', '?inline', 'style.textContent']) {
  assert(!main.includes(retained), `Visual intelligence release v2 found the retired inline/terminal override layer: ${retained}`);
}
assert(
  !main.slice(passkeyIndex + "import './passkey-auth.css';".length).includes("import './"),
  'Visual intelligence release v2 found a local stylesheet import after the passkey component authority.'
);

/*
 * Typography boundary — the Geist Sans title system is owned by
 * design-system.css tokens. The retired Sovereign Display face must not be an
 * active authority.
 */
for (const marker of ['--font-title:', '--font-body:', '--font-display: var(--font-title);', '--serif: var(--font-title);', 'font-family: var(--font-title) !important', ':root']) {
  assert(designSystemCss.includes(marker), `Design system is missing typography token: ${marker}`);
}
for (const retired of ['font-family: "Sovereign Display"', '/fonts/sovereign-display.woff2']) {
  assert(!designSystemCss.includes(retired), `Visual intelligence release v2 found active Sovereign Display typography: ${retired}`);
}

/*
 * Public landing visual system — the canonical landing sections and the
 * monochrome fidelity / warm-metal / reduced-motion treatments now live in the
 * consolidated public.css.
 */
for (const marker of ['.v0-landing-port', '.v0-hero', '.public-approved-v8']) {
  assert(publicCss.includes(marker), `Public CSS is missing canonical landing component: ${marker}`);
}
for (const marker of [
  '--v8-blue: #d8d0c5 !important',
  "radialGradient[id$='-sphere-fill']",
  '.public-approved-v8 .landing-demo',
  'padding: 54px 0 !important',
  '.landing-workflow__progress',
  '@keyframes sovereign-system-route',
  'scroll-snap-type: inline mandatory',
  'One typeface. Hierarchy comes from weight, scale, and opacity.',
  '.v0-hero h1 > span',
  'font-family: inherit !important',
  '@keyframes sovereign-hero-rise',
  '@keyframes sovereign-field-arrive',
  '.landing-expression-slice__tooltip-panel',
  'width: 104px !important',
  'height: 26px !important',
  '@media (prefers-reduced-motion: reduce)'
]) {
  assert(publicCss.includes(marker), `Public CSS is missing visual intelligence marker: ${marker}`);
}
/* The Georgia display fallback must not resurface as an active title authority. */
assert(!designSystemCss.includes('var(--font-display, Georgia, serif)'), 'Visual intelligence release v2 found the retired display serif fallback.');

/*
 * Public landing narrative — the self -> people -> systems story and the real
 * product questions must be the current narrative.
 */
for (const marker of [
  'data-public-narrative="self-people-systems-v1"',
  'You → your people → the whole system',
  'Start with yourself. Expand outward when it matters.',
  'How do I make decisions that actually fit me?',
  'Most AI starts with the prompt. Sovereign starts with you.',
  'Know yourself. Understand your people. See the whole system.'
]) {
  assert(landing.includes(marker), `Visual intelligence release v2 is missing current landing marker: ${marker}`);
}
for (const retired of ['<BaselineFoundation />', 'One private reference beneath every question.', 'One private foundation. More useful answers across the questions that shape your life.', 'calculated astronomical positions and selected interpretive frameworks']) {
  assert(!landing.includes(retired), `Visual intelligence release v2 found retired root landing language: ${retired}`);
}

/*
 * Product story demonstrations — the isolated personal/relationship/system
 * stories with source details remain subject to the canonical selector
 * contract (landing-story--${suffix} resolves to personal/relationship/system).
 */
for (const marker of [
  '01 · You',
  '02 · You + your people',
  '03 · From 1:1 to the whole system',
  'landing-stories__labels',
  'landing-story__label',
  'landing-story--${suffix}',
  'demo-card',
  'Why do I keep saying yes when I want to say no?',
  'Why does my partner\\\'s silence feel like punishment?',
  'Why do I always end up managing the family crisis?',
  'See source details',
  'Representative example · Not your Baseline Design'
]) {
  assert(stories.includes(marker), `Visual intelligence release v2 is missing product story marker: ${marker}`);
}
for (const retired of ['Separate helping from carrying the outcome.', 'See where responsibility keeps landing.']) {
  assert(!stories.includes(retired), `Visual intelligence release v2 found retired category framing: ${retired}`);
}

/*
 * Interactive 360 field — click-led, minimal endpoint inspection, no hover-gated
 * content and no functional workflow motion gate.
 */
for (const marker of [
  "data-inspecting={hasInspection ? 'true' : 'false'}",
  'setHasInspection(true)',
  'const TOOLTIP_WIDTH = 104',
  'const TOOLTIP_HEIGHT = 26',
  'click a line to inspect it'
]) {
  assert(field.includes(marker), `Visual intelligence release v2 is missing click-led field marker: ${marker}`);
}
assert(!field.includes('onPointerEnter={() => selectAxis(axis.id)}'), 'Visual intelligence release v2 found hover-driven field inspection.');

/*
 * Static premium action surface — the terminal static typography authority
 * remains live as a static asset on the secondary public pages.
 */
for (const marker of ['--static-title-font:', 'font-family: var(--static-title-font) !important']) {
  assert(premiumActionStatic.includes(marker), `Visual intelligence release v2 is missing terminal static typography marker: ${marker}`);
}

console.log('Visual intelligence release v2: canonical visual system verified.');
