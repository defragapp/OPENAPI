import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const system = read('./senior-design-system-v1.css');
const demoSystem = read('./public-intelligence-demonstration-v2.css');
const staticSystem = read('../public/senior-design-system-static-v1.css');
const staticActions = read('../public/premium-action-static-v1.css');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');

const compact = (source: string) => source.replace(/\s+/g, ' ');

describe('senior design system v1', () => {
  it('is an off-production presentation authority over the existing product DOM with a narrow demo sub-authority', () => {
    expect(main).toContain("import seniorDesignSystemCss from './senior-design-system-v1.css?inline';");
    expect(main).toContain("import publicIntelligenceDemonstrationV2Css from './public-intelligence-demonstration-v2.css?inline';");
    const production = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    const senior = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    const demos = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;');
    expect(senior).toBeGreaterThan(production);
    expect(demos).toBeGreaterThan(senior);
    expect(main).toContain("document.documentElement.dataset.sovereignVisualAuthority = 'senior-design-system-v1';");
    expect(main).toContain("document.documentElement.dataset.sovereignPublicDemoAuthority = 'text-first-v2';");
    expect(landing).toContain('<V0Navigation />');
    expect(landing).toContain('<V0Hero />');
    expect(landing).toContain('<LandingProductStories />');
    expect(app).toContain("if (path === '/invitation') return <InvitationPage />;");
    expect(app).toContain("if (path === '/onboarding') return <PlanOnboarding />;");
  });

  it('uses one native sans, palette, shell, and 64px brand chrome across page families', () => {
    for (const source of [system, staticSystem]) {
      expect(source).toContain('"SF Pro Display"');
      expect(source).toContain('"Segoe UI Variable Display"');
      expect(source).toContain('#080a0d');
      expect(source).toContain('#f2ece3');
      expect(source).toContain('1180px');
      expect(source).not.toContain('Optima');
      expect(source).not.toContain('Avenir Next');
      expect(source).not.toContain('Sovereign Display');
      expect(source).not.toContain('Sovereign Sans');
    }
    expect(system).toContain('height: 64px !important');
    expect(staticSystem).toContain('height:64px !important');
    expect(demoSystem).toContain('var(--sds-title, system-ui, sans-serif)');
    expect(demoSystem).toContain('var(--sds-body, system-ui, sans-serif)');
  });

  it('removes rounded SaaS chrome from primary actions, threads, invitation, and workspace', () => {
    const source = compact(system);
    expect(source).toContain('.account-shell .primary-button');
    expect(source).toContain('border-radius:0 !important');
    expect(source).toContain('.user-question');
    expect(source).toContain('border-left:1px solid var(--sds-line-strong) !important');
    expect(source).toContain('.topbar-actions button');
    expect(source).toContain('.answer-actions button');
    expect(source).toContain('.sovereign-composer');
    expect(source).toContain('border-radius:var(--sds-radius) !important');
    expect(source).not.toContain('border-radius:999px');
    expect(source).not.toContain('border-radius: 999px');
  });

  it('keeps the three public product demonstrations text-first inside the same mature visual grammar', () => {
    expect(stories).toContain('data-product-stories="text-first-intelligence-v2"');
    expect(stories).not.toContain('function WorkflowPanel(');
    for (const marker of [
      '.landing-intelligence-demo',
      '.landing-demo-question',
      '.landing-demo-core',
      '.landing-understanding--decision',
      '.landing-understanding--relationship',
      '.landing-understanding--system',
      '.landing-fit-check',
      '.landing-evidence',
      '@keyframes public-demo-arrive-v2',
      '@keyframes public-demo-line-v2',
      '@keyframes public-demo-resolve-v2',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(demoSystem).toContain(marker);
    expect(demoSystem).not.toContain('infinite');
  });

  it('reduces keynote-scale public typography and vertical acreage without rewriting the rest of the landing content', () => {
    expect(system).toContain('min-height: 680px !important');
    expect(system).toContain('font-size: clamp(3.6rem, 5.5vw, 5rem) !important');
    expect(system).toContain('.public-approved-v8 .landing-story');
    expect(system).toContain('padding: 82px 0 88px !important');
    expect(staticSystem).toContain('min-height:470px !important');
    expect(staticSystem).toContain('font-size:clamp(3.35rem,5vw,4.75rem) !important');
    expect(staticSystem).toContain('padding:72px 0 !important');
    expect(staticSystem).toContain('body.questions-page .faq-section');
    expect(staticSystem).toContain('padding-top:64px !important');
  });

  it('routes every existing static page through one final static authority without editing its architecture', () => {
    expect(staticActions.startsWith('@import url("/senior-design-system-static-v1.css?v=20260818-v1");')).toBe(true);
    for (const path of ['../public/how-it-works.html', '../public/pricing.html', '../public/faq.html', '../public/404.html', '../public/consent.html']) {
      const html = read(path);
      expect(html).toContain('/premium-action-static-v1.css?v=20260817-action-v1');
      expect(html).not.toContain('/senior-design-system-static-v1.css');
    }
  });

  it('normalizes auth, invitation, onboarding, error, and workspace into the same geometry', () => {
    for (const marker of [
      '.account-shell .account-layout',
      '.account-shell .auth-panel',
      '.invitation-shell .auth-panel',
      '.plan-onboarding .plan-layout',
      '.intelligence-workspace',
      '.intelligence-topbar',
      '.public-not-found',
      '.private-route-gate'
    ]) expect(system).toContain(marker);
    expect(system).toContain('--sds-radius: 4px');
  });

  it('keeps presentation files structurally balanced', () => {
    for (const source of [system, demoSystem, staticSystem]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});