import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const app = read('./App.tsx');
const authenticated = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const controls = read('./AccountControlCenter.tsx');
const membership = read('./SystemMembershipManager.tsx');
const premiumCss = read('./premium-platform-release.css');
const visualCss = read('./sovereign-visual-system.css');
const viewportCss = read('./responsive-viewport-contract.css');
const densityCss = read('./mobile-density-contract.css');
const publicCss = read('../public/premium-public-release.css');
const how = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const notFound = read('../public/404.html');
const reactVisualSource = `${premiumCss}\n${visualCss}\n${viewportCss}\n${densityCss}`;

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('premium platform release', () => {
  it('loads the neutral mobile density contract last', () => {
    const visualImport = "import './sovereign-visual-system.css';";
    const viewportImport = "import './responsive-viewport-contract.css';";
    const densityImport = "import './mobile-density-contract.css';";
    const visual = main.indexOf(visualImport);
    const viewport = main.indexOf(viewportImport);
    const density = main.indexOf(densityImport);
    expect(visual).toBeGreaterThan(-1);
    expect(viewport).toBeGreaterThan(visual);
    expect(density).toBeGreaterThan(viewport);
    expect(main.slice(density + densityImport.length)).not.toContain("import './");
    expect(main).not.toMatch(/final|refinement|polish.*css|landing-v2/i);
  });

  it('covers every production-owned React surface without replacing architecture', () => {
    for (const selector of ['.sovereign-landing', '.intelligence-workspace', '.today-facet-view', '.explore-editorial', '.relationship-overview', '.system-overview', '.baseline-builder', '.baseline-reveal', '.sovereign-answer', '.sovereign-composer', '.intelligence-context', '.library-grid']) {
      expect(reactVisualSource).toContain(selector);
    }
    expect(authenticated).toContain('data-workspace-contract="one-room"');
    expect(authenticated).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
  });

  it('repairs the mobile hero and increases phone density', () => {
    expect(viewportCss).toContain('.sovereign-landing .hero-intelligence-stage');
    expect(viewportCss).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(viewportCss).toContain('min-height: 0;');
    expect(densityCss).toContain('@media (max-width: 700px)');
    expect(densityCss).toContain('font-size: clamp(3.15rem, 15.6vw, 4.55rem);');
    expect(densityCss).toContain('.sovereign-landing .visual-demo-window');
    expect(densityCss).toContain('.sovereign-landing .permission-section');
    expect(densityCss).toContain('display: block;');
  });

  it('uses motion while respecting reduced motion', () => {
    expect(visualCss).toContain('@supports (animation-timeline: view())');
    expect(visualCss).toContain('@keyframes sovereign-message-in');
    expect(visualCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(viewportCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(densityCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('preserves authentication, consent, and billing', () => {
    for (const route of ["path === '/login'", "path === '/signup'", "path === '/invitation'", "path === '/onboarding'"]) expect(app).toContain(route);
    expect(app).toContain('__TURNSTILE_SITE_KEY__');
    expect(onboarding).toContain('/api/v1/billing/checkout');
    expect(controls).toContain('/api/v1/billing/portal');
    expect(membership).toContain("person.activeScopes.includes('system.include')");
  });

  it('loads the public composition on every support page', () => {
    for (const page of [how, pricing, faq, notFound]) expect(page).toContain('/premium-public-release.css?v=20260730-final');
  });

  it('retains responsive and accessible behavior', () => {
    for (const source of [premiumCss, visualCss, viewportCss, densityCss, publicCss]) expectBalancedCss(source);
    expect(premiumCss).toContain(':focus-visible');
    expect(visualCss).toContain('env(safe-area-inset-bottom)');
    expect(visualCss).toContain('@media print');
    expect(densityCss).toContain('@media (max-width: 430px)');
  });

  it('does not add dashboard scoring or mock behavior', () => {
    const source = `${reactVisualSource}\n${publicCss}`;
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'compatibility-score', 'Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid']) expect(source).not.toContain(prohibited);
  });
});