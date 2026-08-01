import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const viewportProbe = read('./PublicLandingViewportContract.ts');
const authenticated = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const controls = read('./AccountControlCenter.tsx');
const membership = read('./SystemMembershipManager.tsx');
const premiumCss = read('./premium-platform-release.css');
const visualCss = read('./sovereign-visual-system.css');
const viewportCss = read('./responsive-viewport-contract.css');
const editorialCss = read('./public-landing-editorial.css');
const publicCss = read('../public/premium-public-release.css');
const how = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const notFound = read('../public/404.html');
const reactVisualSource = `${premiumCss}\n${visualCss}\n${viewportCss}\n${editorialCss}`;

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('premium platform release', () => {
  it('loads one canonical public landing contract after the responsive foundation', () => {
    const visualImport = "import './sovereign-visual-system.css';";
    const typographyImport = "import './typography-system.css';";
    const viewportImport = "import './responsive-viewport-contract.css';";
    const editorialImport = "import './public-landing-editorial.css';";
    const visual = main.indexOf(visualImport);
    const typography = main.indexOf(typographyImport);
    const viewport = main.indexOf(viewportImport);
    const editorial = main.indexOf(editorialImport);

    expect(visual).toBeGreaterThan(-1);
    expect(typography).toBeGreaterThan(visual);
    expect(viewport).toBeGreaterThan(typography);
    expect(editorial).toBeGreaterThan(viewport);
    expect(main.slice(editorial + editorialImport.length)).not.toContain("import './");
    expect(main).not.toContain('landing-live-correction.css');
    expect(main).not.toContain('mobile-density-contract.css');
    expect(main).not.toMatch(/final|refinement|polish.*css|landing-v2/i);
  });

  it('recomposes the real public landing surfaces for phone-width rendering', () => {
    for (const value of [
      'data-viewport-contract="public-landing-v1"',
      'className="story-product-stage"',
      'data-viewport-surface="permission"',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"'
    ]) expect(landing).toContain(value);
    expect(viewportCss).toContain('.sovereign-landing .sovereign-story-step');
    expect(viewportCss).toContain('.sovereign-landing [data-viewport-surface]');
    expect(viewportCss).toContain('width: calc(100% - var(--public-mobile-left) - var(--public-mobile-right));');
    expect(viewportCss).toContain('min-height: 0;');
    expect(viewportCss).toContain('transform: none;');
    expect(editorialCss).toContain('.sovereign-landing .landing-hero');
    expect(editorialCss).toContain('.sovereign-landing .hero-intelligence-stage');
    expect(editorialCss).toContain('--editorial-page:#0f0f0f');
    expect(editorialCss).toContain('--editorial-cream:#e8ddd0');
    expect(editorialCss).toContain('@media(max-width:1024px)');
    expect(editorialCss).toContain('@media(max-width:760px)');
    expect(editorialCss).toContain('@media(max-width:430px)');
  });

  it('measures the rendered viewport instead of checking CSS strings alone', () => {
    expect(main).toContain('installPublicLandingViewportContract();');
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportProbe).toContain('node.offsetWidth');
    expect(viewportProbe).toContain('doc.documentElement.scrollWidth');
    expect(viewportProbe).toContain('permissionStacked');
    expect(viewportProbe).toContain("new URLSearchParams(location.search).get('viewport-contract') !== '1'");
    for (const surface of ['hero-answer', 'baseline', 'personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'permission']) {
      expect(viewportProbe).toContain(`'${surface}'`);
    }
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

  it('uses motion while respecting reduced motion', () => {
    expect(visualCss).toContain('@supports (animation-timeline: view())');
    expect(visualCss).toContain('@keyframes sovereign-message-in');
    expect(visualCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(viewportCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(editorialCss).toContain('@media(prefers-reduced-motion:reduce)');
    expect(editorialCss).toContain('@keyframes sovereign-hero-field');
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
    for (const source of [premiumCss, visualCss, viewportCss, editorialCss, publicCss]) expectBalancedCss(source);
    expect(premiumCss).toContain(':focus-visible');
    expect(visualCss).toContain('env(safe-area-inset-bottom)');
    expect(visualCss).toContain('@media print');
    expect(viewportCss).toContain('env(safe-area-inset-left)');
    expect(viewportCss).toContain('env(safe-area-inset-right)');
    expect(viewportCss).toContain('@media (max-width: 430px)');
    expect(editorialCss).toContain(':focus-visible');
  });

  it('does not add dashboard scoring or mock behavior', () => {
    const source = `${reactVisualSource}\n${publicCss}\n${landing}`;
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'compatibility-score', 'Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid']) expect(source).not.toContain(prohibited);
  });
});
