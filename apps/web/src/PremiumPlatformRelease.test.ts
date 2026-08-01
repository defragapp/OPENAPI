import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
const safeArea = read('./engine-room-safe-area.css');
const authenticated = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const controls = read('./AccountControlCenter.tsx');
const membership = read('./SystemMembershipManager.tsx');
const publicCss = read('../public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`../public/${name}.html`));

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('premium platform release', () => {
  it('loads the canonical Engine Room after every inherited visual layer', () => {
    const safeAreaImport = "import './engine-room-safe-area.css';";
    const engineImport = "import './engine-room.css';";
    expect(main).toContain(safeAreaImport);
    expect(main).toContain(engineImport);
    expect(main.indexOf(engineImport)).toBeGreaterThan(main.indexOf(safeAreaImport));
    expect(main.slice(main.indexOf(engineImport) + engineImport.length)).not.toContain("import './");
  });

  it('renders one continuous intelligence environment rather than a stacked campaign page', () => {
    expect(landing).toContain('className="sovereign-landing engine-room"');
    for (const component of ['<TechnicalGrid />', '<DataPointField />', '<HeroIntelligenceStage />', '<BaselineContextStage />', '<ConnectedScalesStage', '<PublicAnswerStage />', '<TerminalStage />']) {
      expect(landing).toContain(component);
    }
    expect(engine).toContain('height: 560svh');
    expect(engine).toContain('position: sticky');
    expect(engine).not.toContain('border-radius: 999px');
    expect(landing).not.toContain('landing-foundation');
    expect(landing).not.toContain('pricing-preview');
  });

  it('uses scroll-linked reversible state changes and keyboard-accessible scales', () => {
    expect(landing).toContain("window.addEventListener('scroll', requestUpdate, { passive: true })");
    expect(landing).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(landing).toContain('role="tablist"');
    expect(landing).toContain('onKeyDown');
    expect(landing).toContain('ArrowRight');
    expect(engine).toContain('@media (max-width: 760px)');
    expect(engine).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('preserves the one-room authenticated architecture', () => {
    expect(authenticated).toContain('data-workspace-contract="one-room"');
    expect(authenticated).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
  });

  it('preserves authentication, consent, and billing', () => {
    for (const route of ["path === '/login'", "path === '/signup'", "path === '/invitation'", "path === '/onboarding'"]) expect(app).toContain(route);
    expect(app).toContain('__TURNSTILE_SITE_KEY__');
    expect(onboarding).toContain('/api/v1/billing/checkout');
    expect(controls).toContain('/api/v1/billing/portal');
    expect(membership).toContain("person.activeScopes.includes('system.include')");
  });

  it('loads the public composition on support pages', () => {
    for (const page of supportPages) expect(page).toContain('/premium-public-release.css?v=20260730-final');
  });

  it('retains accessible controls and avoids fake scoring', () => {
    expectBalancedCss(engine);
    expectBalancedCss(safeArea);
    expectBalancedCss(publicCss);
    expect(engine).toContain(':focus-visible');
    expect(engine).toContain('min-height: 44px');
    expect(safeArea).toContain('env(safe-area-inset-bottom)');
    const source = `${engine}\n${landing}`;
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'compatibility-score', 'OVERLAP: 68%', 'Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid']) {
      expect(source).not.toContain(prohibited);
    }
  });
});
