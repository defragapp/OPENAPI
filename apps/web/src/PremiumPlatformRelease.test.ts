import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const engine = read('./engine-room.css');
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
  it('loads Engine Room after every inherited public landing layer', () => {
    const inherited = "import './public-landing-editorial.css';";
    const lock = "import './public-landing-production-lock.css';";
    const engineImport = "import './engine-room.css';";
    expect(main.indexOf(inherited)).toBeGreaterThan(-1);
    expect(main.indexOf(lock)).toBeGreaterThan(main.indexOf(inherited));
    expect(main.indexOf(engineImport)).toBeGreaterThan(main.indexOf(lock));
    expect(main.slice(main.indexOf(engineImport) + engineImport.length)).not.toContain("import './");
  });

  it('renders one continuous five-state intelligence environment', () => {
    expect(landing).toContain('data-viewport-contract="engine-room-v1"');
    expect(landing).toContain('className="sovereign-landing engine-room"');
    for (const component of ['<TechnicalGrid />', '<DataPointField />', '<HeroState />', '<BaselineState />', '<ConnectedScalesState />', '<LiveQueryState />', '<ReadyState />']) {
      expect(landing).toContain(component);
    }
    expect(engine).toContain('.engine-scroll-shell { min-height: 600svh; }');
    expect(engine).toContain('position: sticky');
    expect(engine).not.toContain('border-radius: 999px');
  });

  it('uses scroll-linked reversible state changes and a mobile-specific composition', () => {
    expect(landing).toContain('resolveState(next)');
    expect(landing).toContain("window.addEventListener('scroll', requestUpdate, { passive: true })");
    expect(landing).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    expect(engine).toContain('@media (max-width: 680px)');
    expect(engine).toMatch(/@media \(max-width: 680px\)[\s\S]*?\.engine-state,[\s\S]*?position: relative;/);
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
    expectBalancedCss(publicCss);
    expect(engine).toContain(':focus-visible');
    expect(engine).toContain('min-height: 44px');
    expect(engine).toContain('@media (forced-colors: active)');
    const source = `${engine}\n${landing}`;
    for (const prohibited of ['Alignment Score', 'Stability Index', 'Growth Rate', 'compatibility-score', 'OVERLAP: 68%', 'Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid']) {
      expect(source).not.toContain(prohibited);
    }
  });
});
