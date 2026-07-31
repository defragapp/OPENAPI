import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const authenticated = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const controls = readFileSync(new URL('./AccountControlCenter.tsx', import.meta.url), 'utf8');
const membership = readFileSync(new URL('./SystemMembershipManager.tsx', import.meta.url), 'utf8');
const premiumCss = readFileSync(new URL('./premium-platform-release.css', import.meta.url), 'utf8');
const visualCss = readFileSync(new URL('./sovereign-visual-system.css', import.meta.url), 'utf8');
const viewportCss = readFileSync(new URL('./responsive-viewport-contract.css', import.meta.url), 'utf8');
const densityCss = readFileSync(new URL('./mobile-density-polish.css', import.meta.url), 'utf8');
const publicCss = readFileSync(new URL('../public/premium-public-release.css', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const reactVisualSource = `${premiumCss}\n${visualCss}\n${viewportCss}\n${densityCss}`;

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('premium platform release', () => {
  it('loads the mobile density layer after the responsive viewport contract', () => {
    const premiumImport = "import './premium-platform-release.css';";
    const visualImport = "import './sovereign-visual-system.css';";
    const viewportImport = "import './responsive-viewport-contract.css';";
    const densityImport = "import './mobile-density-polish.css';";
    const premium = main.indexOf(premiumImport);
    const visual = main.indexOf(visualImport);
    const viewport = main.indexOf(viewportImport);
    const density = main.indexOf(densityImport);
    expect(premium).toBeGreaterThan(-1);
    expect(visual).toBeGreaterThan(premium);
    expect(viewport).toBeGreaterThan(visual);
    expect(density).toBeGreaterThan(viewport);
    expect(main.slice(density + densityImport.length)).not.toContain("import './");
  });

  it('covers every production-owned React surface without replacing architecture', () => {
    for (const selector of [
      '.sovereign-landing', '.sovereign-policy', '.public-not-found', '.private-route-gate',
      '.account-shell', '.auth-panel', '.plan-onboarding', '.intelligence-workspace',
      '.today-facet-view', '.explore-editorial', '.relationship-overview', '.system-overview',
      '.baseline-builder', '.baseline-reveal', '.sovereign-answer', '.sovereign-composer',
      '.intelligence-context', '.library-grid', '.account-control-dialog', '.system-membership-dialog'
    ]) expect(reactVisualSource).toContain(selector);

    expect(authenticated).toContain('data-workspace-contract="one-room"');
    expect(authenticated).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
    expect(authenticated).toContain('<AccountControlCenter />');
    expect(authenticated).toContain('<SystemMembershipManager />');
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
  });

  it('resets the retired hero grid and improves phone scale and density', () => {
    expect(viewportCss).toContain('.sovereign-landing .hero-intelligence-stage');
    expect(viewportCss).toContain('display: block;');
    expect(viewportCss).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(viewportCss).toContain('min-height: 0;');
    expect(densityCss).toContain('@media (max-width: 700px)');
    expect(densityCss).toContain('font-size: clamp(3.25rem, 15.8vw, 4.35rem);');
    expect(densityCss).toContain('padding-block: 62px;');
    expect(densityCss).toContain('.sovereign-landing .permission-section');
    expect(densityCss).toContain('display: block;');
  });

  it('uses motion to explain chat, reasoning, and systems while respecting reduced motion', () => {
    for (const selector of ['.visual-demo-window', '.visual-reasoning-panel', '.story-user-message', '.story-assistant-message', '.story-system-map', '.response-thread']) {
      expect(visualCss).toContain(selector);
    }
    expect(visualCss).toContain('@supports (animation-timeline: view())');
    expect(visualCss).toContain('@keyframes sovereign-message-in');
    expect(visualCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(viewportCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(densityCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('preserves working authentication, consent, billing, and Stripe checkout flows', () => {
    expect(app).toContain("path === '/login'");
    expect(app).toContain("path === '/signup'");
    expect(app).toContain("path === '/invitation'");
    expect(app).toContain("path === '/onboarding'");
    expect(app).toContain("data-sitekey={(window as any).__TURNSTILE_SITE_KEY__");
    expect(onboarding).toContain("fetch('/api/v1/billing/checkout'");
    expect(onboarding).toContain("body: JSON.stringify({ interval })");
    expect(controls).toContain("api('/api/v1/billing/portal'");
    expect(membership).toContain("person.activeScopes.includes('system.include')");
    expect(membership).toContain('/members`,');
  });

  it('loads the public composition on every static support page', () => {
    for (const page of [how, pricing, faq, notFound]) expect(page).toContain('/premium-public-release.css?v=20260730-final');
    for (const selector of ['.launch-nav', '.launch-hero', '.journey-steps', '.baseline-explainer', '.pricing-grid', '.price-card', '.plan-comparison-list', '.faq-list', '.launch-callout', '.not-found-stage', '.launch-footer']) {
      expect(publicCss).toContain(selector);
    }
  });

  it('retains responsive, accessible, reduced-motion, high-contrast, and print behavior', () => {
    for (const source of [premiumCss, visualCss, publicCss]) {
      expect(source).toContain('@media (prefers-reduced-motion: reduce)');
      expect(source).toContain('@media (forced-colors: active)');
      expectBalancedCss(source);
    }
    expectBalancedCss(viewportCss);
    expectBalancedCss(densityCss);
    expect(premiumCss).toContain(':focus-visible');
    expect(visualCss).toContain('env(safe-area-inset-bottom)');
    expect(visualCss).toContain('@media print');
    expect(viewportCss).toContain('@media (max-width: 430px)');
    expect(densityCss).toContain('@media (max-width: 430px)');
    expect(publicCss).toContain('min-width: 320px');
    expect(publicCss).toContain('@media (max-width: 620px)');
  });

  it('does not add a dashboard, scoring, mock auth, or fake product behavior', () => {
    const productionVisualSource = `${reactVisualSource}\n${publicCss}`;
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'compatibility-score', 'Math.random', 'localStorage', 'mock-auth', 'fake-answer', 'dashboard-grid']) {
      expect(productionVisualSource).not.toContain(prohibited);
    }
  });
});