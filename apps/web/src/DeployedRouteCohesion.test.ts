import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const main = read('./main.tsx');
const reactAuthority = read('./deployed-route-cohesion.css');
const staticAuthority = read('../public/deployed-route-cohesion.css');
const howItWorks = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const policy = read('./PublicPolicy.tsx');
const app = read('./App.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const authenticatedWorkspace = read('./AuthenticatedWorkspace.tsx');
const routeVerifier = read('../../../scripts/verify-live-route-cohesion.mjs');
const secondaryVerifier = read('../../../scripts/verify-live-secondary-public.mjs');
const productionRelease = read('../../../scripts/cloudflare-production-release.mjs');
const packageJson = JSON.parse(read('../../../package.json')) as { scripts?: Record<string, string> };

const staticPages = [
  ['How it works', howItWorks],
  ['Pricing', pricing],
  ['FAQ', faq]
] as const;

describe('deployed route cohesion', () => {
  it('loads one final scoped authority after the legacy account and passkey layers', () => {
    const passkey = main.indexOf("import './passkey-auth.css';");
    const cohesion = main.indexOf("import './deployed-route-cohesion.css';");
    expect(passkey).toBeGreaterThan(-1);
    expect(cohesion).toBeGreaterThan(passkey);
    expect(main.slice(cohesion + 1)).not.toContain("import './");
  });

  it('keeps the frozen landing outside the new React route authority', () => {
    expect(reactAuthority).toContain('.account-shell');
    expect(reactAuthority).toContain('.plan-onboarding');
    expect(reactAuthority).toContain('.invitation-shell');
    expect(reactAuthority).toContain('.public-not-found');
    expect(reactAuthority).toContain('.private-route-gate');
    expect(reactAuthority).toContain('.public-secondary-page');
    expect(reactAuthority).toContain('.sovereign-app-runtime');
    expect(reactAuthority).not.toContain('.public-approved-v8 .v0-hero');
    expect(reactAuthority).not.toContain('.landing-story--personal');
    expect(reactAuthority).not.toContain('.landing-story--relationship');
    expect(reactAuthority).not.toContain('.landing-story--system');
  });

  it('uses one route token system for typography, spacing, and brand color', () => {
    for (const marker of [
      '--route-page: #090b0e',
      '--route-ink: #f1e9de',
      '--route-blue: #2f93ff',
      '--route-blue-bright: #78c7ff',
      '--route-shell: min(1120px',
      'font-family: var(--font-display',
      '.account-layout',
      '.plan-layout',
      '.public-secondary-page .policy-grid',
      '.sovereign-app-runtime .intelligence-topbar h1',
      '@media (max-width: 650px)'
    ]) {
      expect(reactAuthority).toContain(marker);
    }
  });

  it.each(staticPages)('%s loads the same final static route authority', (_label, document) => {
    expect(document).toContain('data-route-cohesion="v1"');
    expect(document).toContain('/deployed-route-cohesion.css?v=20260803-route-v1');
    expect(document.indexOf('/deployed-route-cohesion.css')).toBeGreaterThan(document.indexOf('/v0-public-static.css'));
  });

  it('organizes each static page for its actual content instead of using one generic grid', () => {
    expect(staticAuthority).toContain('body.how-page .journey-steps');
    expect(staticAuthority).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(staticAuthority).toContain('body.pricing-page .price-card');
    expect(staticAuthority).toContain('body.pricing-page .plan-comparison-list > div');
    expect(staticAuthority).toContain('body.questions-page .faq-section');
    expect(staticAuthority).toContain('body.questions-page .faq-list summary');
    expect(staticAuthority).toContain('@media (max-width: 650px)');
  });

  it('covers the real deployed React route roots', () => {
    expect(policy).toContain('public-secondary-page');
    expect(app).toContain('className="account-shell"');
    expect(app).toContain('className="invitation-shell"');
    expect(app).toContain('className="public-not-found"');
    expect(onboarding).toContain('className="plan-onboarding"');
    expect(authenticatedWorkspace).toContain('className="private-route-gate"');
    expect(authenticatedWorkspace).toContain('className="sovereign-app-runtime"');
  });

  it('audits every deployed page family at rendered desktop and phone widths', () => {
    for (const route of [
      'how-it-works',
      'pricing',
      'faq',
      'privacy',
      'terms',
      'login',
      'signup',
      'invitation',
      'onboarding-gate',
      'workspace-gate',
      'not-found'
    ]) {
      expect(routeVerifier).toContain(`name: '${route}'`);
    }
    expect(routeVerifier).toContain('width: 1440, height: 900');
    expect(routeVerifier).toContain('width: 390, height: 844');
    expect(routeVerifier).toContain('bodyCopyPresent');
    expect(routeVerifier).toContain("includes('Sovereign Display')");
    expect(routeVerifier).toContain('paragraphSize >= 14');
    expect(routeVerifier).toContain('paragraphLineHeight >= audit.typography.paragraphSize * 1.42');
    expect(routeVerifier).toContain('overflowX <= 1');
  });

  it('makes both fast and rendered route verification production-authoritative', () => {
    expect(secondaryVerifier).toContain("const routeCssPath = '/deployed-route-cohesion.css?v=20260803-route-v1'");
    expect(secondaryVerifier).toContain('data-route-cohesion="v1"');
    expect(secondaryVerifier).toContain('body.how-page .journey-steps');
    expect(secondaryVerifier).toContain('body.pricing-page .price-card');
    expect(secondaryVerifier).toContain('body.questions-page .faq-section');
    expect(productionRelease).toContain("['verify-route-cohesion', 'scripts/verify-live-route-cohesion.mjs']");
    expect(packageJson.scripts?.['verify:live-route-cohesion']).toBe('node scripts/verify-live-route-cohesion.mjs');
  });
});
