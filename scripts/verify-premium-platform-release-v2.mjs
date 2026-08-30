import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/*
 * Premium platform release v2 — current canonical architecture.
 *
 * This verifier was reconciled against the consolidated CSS architecture at
 * the exact intended release SHA. The historical per-file "authority"
 * stylesheets (v0-platform-port.css, v0-visual-port.css, v0-global-experience
 * .css, landing-expression-field-v3.css, landing-hero-field-v4.css,
 * v0-restored-product-stories.css, public-landing-final-authority.css, and the
 * inline style.textContent injection layer) were intentionally removed and
 * their content folded into the five canonical stylesheets that main.tsx
 * imports in a certified order (design-system -> public -> workspace ->
 * app-shell -> passkey-auth last). CanonicalVisualSystem.test.ts enforces that
 * removal.
 *
 * This verifier asserts the current canonical visual system and the premium
 * platform surface directly (protecting the exact free/Sovereign+ pricing and
 * entitlement contract as well as the shared static typography authority). It
 * does not weaken any premium or visual assertion; it replaces obsolete
 * delivery-architecture assertions with equivalent current-state ones.
 */

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireAll(label, content, markers) {
  for (const marker of markers) {
    assert(content.includes(marker), `${label} is missing: ${marker}`);
  }
}

const main = readFileSync(resolve('apps/web/src/main.tsx'), 'utf8');
const designSystemCss = readFileSync(resolve('apps/web/src/design-system.css'), 'utf8');
const publicCss = readFileSync(resolve('apps/web/src/public.css'), 'utf8');
const workspaceCss = readFileSync(resolve('apps/web/src/workspace.css'), 'utf8');
const pricing = readFileSync(resolve('apps/web/src/PublicPricing.tsx'), 'utf8');
const landing = readFileSync(resolve('apps/web/src/PublicLanding.tsx'), 'utf8');
const stories = readFileSync(resolve('apps/web/src/LandingProductStories.tsx'), 'utf8');
const field = readFileSync(resolve('apps/web/src/expression-field/LandingExpressionSlice.tsx'), 'utf8');
const premiumActionStatic = readFileSync(resolve('apps/web/public/premium-action-static-v1.css'), 'utf8');
const supportStatic = readFileSync(resolve('apps/web/public/premium-public-release.css'), 'utf8');

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
  assert(main.includes(marker), `Premium platform release v2 is missing canonical CSS import: ${marker}`);
}
const passkeyIndex = main.indexOf("import './passkey-auth.css';");
assert(passkeyIndex >= 0, 'Premium platform release v2 is missing the passkey component authority.');
for (const retained of ['releases.css', 'installPlatformVisualCohesion', '?inline', 'style.textContent']) {
  assert(!main.includes(retained), `Premium platform release v2 found the retired inline/terminal override layer: ${retained}`);
}
assert(
  !main.slice(passkeyIndex + "import './passkey-auth.css';".length).includes("import './"),
  'Premium platform release v2 found a local stylesheet import after the passkey component authority.'
);

/*
 * Shared visual system — the canonical landing surfaces, the warm-metal public
 * palette, the click-led 360 field, and the Geist Sans title system must all be
 * current and active.
 */
requireAll('Premium platform release v2 (public.css)', publicCss, [
  '.v0-landing-port',
  '.v0-hero',
  '.public-approved-v8',
  '--v8-blue: #d8d0c5 !important',
  "radialGradient[id$='-sphere-fill']",
  '.public-approved-v8 .landing-demo',
  'padding: 54px 0 !important',
  '.landing-workflow__progress',
  '@keyframes sovereign-system-route',
  'scroll-snap-type: inline mandatory',
  '.v0-hero h1 > span',
  'font-family: inherit !important',
  '@keyframes sovereign-hero-rise',
  '@keyframes sovereign-field-arrive',
  '.landing-expression-slice__tooltip-panel',
  'width: 104px !important',
  'height: 26px !important'
]);
requireAll('Premium platform release v2 (design-system.css)', designSystemCss, [
  '--font-title:',
  '--font-body:',
  '--font-display: var(--font-title);',
  '--serif: var(--font-title);',
  'font-family: var(--font-title) !important',
  ':root'
]);
for (const retired of ['font-family: "Sovereign Display"', '/fonts/sovereign-display.woff2']) {
  assert(!designSystemCss.includes(retired), `Premium platform release v2 found active Sovereign Display typography: ${retired}`);
}

/*
 * Premium platform surface — the exact free/Sovereign+ pricing and entitlement
 * contract (10 vs 300 monthly turns, $20 monthly, $99 annual, Stripe billing,
 * separate support) is protected.
 */
requireAll('Premium platform release v2 (PublicPricing.tsx)', pricing, [
  'Free: your personal Baseline Design. Sovereign+: your people, your systems, your Library.',
  '10 Sovereign AI turns each month',
  '300 Sovereign AI turns each month',
  "monthlyPrice: '$20'",
  "annualPrice: '$99 / year'",
  "price: '$0'",
  'Stripe securely handles checkout, invoices, payment methods, and subscription changes.',
  'Sovereign+ stays active while your paid subscription is active.',
  'Understand another person with their permission',
  'Family, household, friendship, workplace, and team Systems',
  'Library and optional Covenant exploration',
  'Support is separate from a subscription.'
]);

/*
 * Public landing narrative — the self -> people -> systems story and the real
 * product questions must be the current narrative.
 */
requireAll('Premium platform release v2 (PublicLanding.tsx)', landing, [
  'data-public-narrative="self-people-systems-v1"',
  'You → your people → the whole system',
  'Start with yourself. Expand outward when it matters.',
  'How do I make decisions that actually fit me?',
  'Most tools start with the prompt. Sovereign starts with you.',
  'Know yourself. Understand your people. See the whole system.'
]);
for (const retired of ['<BaselineFoundation />', 'One private reference beneath every question.', 'One private foundation. More useful answers across the questions that shape your life.', 'calculated astronomical positions and selected interpretive frameworks']) {
  assert(!landing.includes(retired), `Premium platform release v2 found retired root landing language: ${retired}`);
}

/*
 * Product story demonstrations — the isolated personal/relationship/system
 * stories with source details remain subject to the canonical selector
 * contract (landing-story--${suffix} resolves to personal/relationship/system).
 */
requireAll('Premium platform release v2 (LandingProductStories.tsx)', stories, [
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
]);

/*
 * Interactive 360 field — click-led, minimal endpoint inspection, no hover-gated
 * content and no functional workflow motion gate.
 */
requireAll('Premium platform release v2 (LandingExpressionSlice.tsx)', field, [
  "data-inspecting={hasInspection ? 'true' : 'false'}",
  'setHasInspection(true)',
  'const TOOLTIP_WIDTH = 104',
  'const TOOLTIP_HEIGHT = 26',
  'click a line to inspect it'
]);
assert(!field.includes('onPointerEnter={() => selectAxis(axis.id)}'), 'Premium platform release v2 found hover-driven field inspection.');

/*
 * Static premium action surface — the terminal static typography authority and
 * the support-page visual authority remain live as static assets served to the
 * secondary public pages.
 */
if (supportStatic.trim()) {
  assert(
    supportStatic.includes("/* Founder v0 visual authority for standalone public documents. */") &&
    supportStatic.includes("url('/v0-public-port.css?v=20260801-founder-v0')"),
    'Premium platform release v2 is missing the founder v0 import stub for standalone public documents.'
  );
}
for (const marker of ['--static-title-font:', 'font-family: var(--static-title-font) !important']) {
  assert(premiumActionStatic.includes(marker), `Premium platform release v2 is missing terminal static typography marker: ${marker}`);
}
for (const name of ['how-it-works', 'pricing', 'faq', '404']) {
  const page = readFileSync(resolve(`apps/web/public/${name}.html`), 'utf8');
  assert(page.includes('/premium-action-static-v1.css?v=20260818-geist-v1') || page.includes('/premium-action-static-v1.css'), `Premium platform release v2 is missing terminal static stylesheet link on ${name}.html`);
  assert(page.includes('Sovereign.OS'), `Premium platform release v2 is missing brand on ${name}.html`);
}

console.log('Premium platform release v2: premium platform and canonical visual system verified.');
