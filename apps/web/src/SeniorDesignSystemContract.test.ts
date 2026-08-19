import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const system = read('./senior-design-system-v1.css');
const detailControls = read('./launch-detail-controls-v1.css');
const demoSystem = read('./public-intelligence-demonstration-v2.css');
const finalPolish = read('./launch-polish-final-v1.css');
const staticSystem = read('../public/senior-design-system-static-v1.css');
const staticActions = read('../public/premium-action-static-v1.css');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const brand = read('./BrandMark.tsx');
const stories = read('./LandingProductStories.tsx');

const compact = (source: string) => source.replace(/\s+/g, ' ');

describe('senior design system v1', () => {
  it('loads one terminal launch-polish authority after the senior and demo authorities', () => {
    expect(main).toContain("import './launch-detail-controls-v1.css';");
    expect(main.indexOf("import './launch-detail-controls-v1.css';")).toBeLessThan(main.indexOf("import './passkey-auth.css';"));
    expect(main).toContain("import launchPolishFinalCss from './launch-polish-final-v1.css?inline';");
    const production = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    const senior = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    const demos = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;');
    const final = main.indexOf('style.textContent += `\\n${launchPolishFinalCss}`;');
    expect(senior).toBeGreaterThan(production);
    expect(demos).toBeGreaterThan(senior);
    expect(final).toBeGreaterThan(demos);
    expect(main).toContain("dataset.sovereignVisualAuthority = 'senior-design-system-v1'");
    expect(main).toContain("dataset.sovereignPublicDemoAuthority = 'text-first-v2'");
    expect(main).toContain("dataset.sovereignLaunchPolish = 'final-v1'");
  });

  it('uses one measurable header contract across landing, policies, auth, onboarding, and static routes', () => {
    for (const source of [finalPolish, staticActions]) {
      expect(source).toContain('1180px');
      expect(source).toContain('64px');
      expect(source).toContain('13px');
      expect(source).toMatch(/grid-template-columns:\s*minmax\(180px,1fr\) auto minmax\(180px,1fr\)/);
    }
    expect(finalPolish).toContain('.public-approved-v8 .v0-nav-inner');
    expect(finalPolish).toContain('.public-secondary-page .v0-nav-inner');
    expect(finalPolish).toContain('.account-shell .account-nav');
    expect(finalPolish).toContain('.plan-onboarding .plan-nav');
    expect(staticActions).toContain('body.launch-page .launch-nav-inner');
    expect(staticActions).toContain('body.consent-page .launch-nav-inner');
  });

  it('has one brand typography authority with no component-inline sizing', () => {
    expect(brand).toContain('<span className="brand-mark">SOVEREIGN.OS</span>');
    expect(brand).not.toContain('style=');
    for (const source of [system, finalPolish, staticSystem, staticActions]) {
      expect(source).not.toContain('Optima');
      expect(source).not.toContain('Avenir Next');
      expect(source).not.toContain('Sovereign Display');
      expect(source).not.toContain('Sovereign Sans');
    }
    expect(finalPolish).toContain('letter-spacing: .16em !important');
    expect(staticActions).toContain('letter-spacing:.16em !important');
  });

  it('keeps the three text-first public demonstrations visible without observer state', () => {
    expect(stories).toContain('data-product-stories="text-first-intelligence-v2"');
    expect(stories).not.toContain('function WorkflowPanel(');
    expect(finalPolish).toContain("[data-product-stories='text-first-intelligence-v2']");
    expect(finalPolish).toContain('opacity: 1 !important');
    expect(finalPolish).toContain('visibility: visible !important');
    expect(finalPolish).not.toContain('opacity: 0 !important');
    expect(demoSystem).toContain('@keyframes public-demo-arrive-v2');
    expect(demoSystem).toContain('@media (prefers-reduced-motion: reduce)');
    expect(demoSystem).not.toContain('infinite');
  });

  it('keeps public page density purposeful instead of keynote-scale empty acreage', () => {
    expect(finalPolish).toContain('.public-approved-v8 .landing-story');
    expect(finalPolish).toContain('padding: 68px 0 76px !important');
    expect(finalPolish).toContain('.public-secondary-page .policy-hero');
    expect(finalPolish).toContain('min-height: 390px !important');
    expect(staticActions).toContain('min-height:400px !important');
    expect(staticActions).toContain('padding:60px 0 !important');
    expect(staticActions).toContain('body.questions-page .faq-section');
    expect(staticActions).toContain('padding-top:48px !important');
  });

  it('normalizes actions, forms, and thread controls without rounded SaaS chrome', () => {
    const source = compact(finalPolish);
    expect(source).toContain('.account-shell .account-layout');
    expect(source).toContain('.account-shell .auth-panel');
    expect(source).toContain('.plan-onboarding .plan-layout');
    expect(source).toContain('.invitation-shell');
    expect(source).toContain('.intelligence-topbar');
    expect(source).toContain('.intelligence-sidebar');
    expect(source).toContain('.user-question');
    expect(source).toContain('min-height: 44px !important');
    expect(source).toContain('border-radius: 0 !important');
    expect(source).not.toContain('border-radius:999px');
    expect(source).not.toContain('border-radius: 999px');
  });

  it('removes nested utility-card chrome from Turnstile, invitation scopes, and onboarding plan detail', () => {
    for (const marker of [
      '.account-shell .turnstile-frame',
      '.account-shell .status-note',
      '.invitation-shell :is(.invitation-state,.usage-card,.scope-panel)',
      '.invitation-shell .scope-list > div',
      '.plan-onboarding .onboarding-plan-grid > article',
      'min-height: 0 !important',
      '.plan-onboarding .onboarding-baseline-preview'
    ]) expect(detailControls).toContain(marker);
    expect(detailControls).toContain('border-radius: 0 !important');
    expect(detailControls).toContain('background: transparent !important');
    expect(detailControls).not.toContain('border-radius: 999px');
  });

  it('routes every standalone public page through the same final static authority and header wrapper', () => {
    expect(staticActions.startsWith('@import url("/senior-design-system-static-v1.css?v=20260818-v1");')).toBe(true);
    for (const path of ['../public/how-it-works.html', '../public/pricing.html', '../public/faq.html', '../public/404.html', '../public/consent.html']) {
      const html = read(path);
      expect(html).toContain('/premium-action-static-v1.css?v=20260817-action-v1');
      expect(html).toContain('class="launch-nav-inner"');
    }
  });

  it('preserves product architecture while normalizing every launch page family', () => {
    expect(landing).toContain('<V0Navigation />');
    expect(landing).toContain('<V0Hero />');
    expect(landing).toContain('<LandingProductStories />');
    expect(app).toContain("if (path === '/invitation') return <InvitationPage />;");
    expect(app).toContain("if (path === '/onboarding') return <PlanOnboarding />;");
    for (const marker of [
      '.account-shell .account-layout',
      '.plan-onboarding .plan-layout',
      '.invitation-shell',
      '.intelligence-topbar',
      '.public-not-found'
    ]) expect(finalPolish).toContain(marker);
  });

  it('keeps final presentation files structurally balanced', () => {
    for (const source of [system, detailControls, demoSystem, finalPolish, staticSystem, staticActions]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});