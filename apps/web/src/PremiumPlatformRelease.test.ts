import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const authenticated = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const controls = readFileSync(new URL('./AccountControlCenter.tsx', import.meta.url), 'utf8');
const membership = readFileSync(new URL('./SystemMembershipManager.tsx', import.meta.url), 'utf8');
const finalCss = readFileSync(new URL('./premium-platform-release.css', import.meta.url), 'utf8');
const publicCss = readFileSync(new URL('../public/premium-public-release.css', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('premium platform final release', () => {
  it('loads one final composition layer after every existing React visual layer', () => {
    const selective = main.indexOf("import './selective-visual-port.css';");
    const final = main.indexOf("import './premium-platform-release.css';");
    expect(selective).toBeGreaterThan(-1);
    expect(final).toBeGreaterThan(selective);
    expect(main.slice(final).indexOf("import './")).toBe(-1);
  });

  it('covers every production-owned React surface without replacing architecture', () => {
    for (const selector of [
      '.sovereign-landing',
      '.sovereign-policy',
      '.public-not-found',
      '.private-route-gate',
      '.account-shell',
      '.auth-panel',
      '.plan-onboarding',
      '.intelligence-workspace',
      '.today-facet-view',
      '.explore-editorial',
      '.relationship-overview',
      '.system-overview',
      '.baseline-builder',
      '.baseline-reveal',
      '.sovereign-answer',
      '.sovereign-composer',
      '.intelligence-context',
      '.library-grid',
      '.account-control-dialog',
      '.system-membership-dialog'
    ]) expect(finalCss).toContain(selector);

    expect(authenticated).toContain('data-workspace-contract="one-room"');
    expect(authenticated).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
    expect(authenticated).toContain('<AccountControlCenter />');
    expect(authenticated).toContain('<SystemMembershipManager />');
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
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

  it('loads the final public composition on every static support page', () => {
    for (const page of [how, pricing, faq, notFound]) {
      expect(page).toContain('/premium-public-release.css?v=20260730-final');
    }
    for (const selector of [
      '.launch-nav',
      '.launch-hero',
      '.journey-steps',
      '.baseline-explainer',
      '.pricing-grid',
      '.price-card',
      '.plan-comparison-list',
      '.faq-list',
      '.launch-callout',
      '.not-found-stage',
      '.launch-footer'
    ]) expect(publicCss).toContain(selector);
  });

  it('retains responsive, accessible, reduced-motion, high-contrast, and print behavior', () => {
    for (const source of [finalCss, publicCss]) {
      expect(source).toContain('@media (prefers-reduced-motion: reduce)');
      expect(source).toContain('@media (forced-colors: active)');
      expect(source).toContain('min-width: 320px');
      expect(source).toContain(':focus-visible');
      expectBalancedCss(source);
    }
    expect(finalCss).toContain('env(safe-area-inset-bottom)');
    expect(finalCss).toContain('@media print');
    expect(publicCss).toContain('@media (max-width: 620px)');
  });

  it('does not add a dashboard, scoring, mock auth, or fake product behavior', () => {
    const productionVisualSource = `${finalCss}\n${publicCss}`;
    for (const prohibited of [
      'Alignment Score',
      'Stability Index',
      'Growth Rate',
      'compatibility-score',
      'Math.random',
      'localStorage',
      'mock-auth',
      'fake-answer',
      'dashboard-grid'
    ]) expect(productionVisualSource).not.toContain(prohibited);
  });
});
