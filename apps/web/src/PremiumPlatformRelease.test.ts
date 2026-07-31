import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const landingCss = read('./public-landing.css');
const viewportProbe = read('./PublicLandingViewportContract.ts');
const authenticated = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const controls = read('./AccountControlCenter.tsx');
const membership = read('./SystemMembershipManager.tsx');
const premiumCss = read('./premium-platform-release.css');
const visualCss = read('./sovereign-visual-system.css');
const viewportCss = read('./responsive-viewport-contract.css');
const publicCss = read('../public/premium-public-release.css');
const supportPages = ['how-it-works', 'pricing', 'faq', '404'].map((name) => read(`../public/${name}.html`));

const retiredLandingLayers = [
  'mobile-density-contract.css',
  'landing-v2.css',
  'experience-reconciliation.css',
  'public-landing-final.css'
] as const;

function balanced(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('premium platform release', () => {
  it('gives the public route one isolated visual owner', () => {
    expect(main).toContain("import './public-landing.css'");
    expect(landing).toContain('className="sovereign-public"');
    expect(landing).toContain('data-visual-contract="v0-editorial-reconciliation"');
    expect(landingCss).toContain('.sovereign-public');
    for (const laterLayer of [premiumCss, visualCss, viewportCss]) expect(laterLayer).not.toContain('.sovereign-public');
    for (const retiredLayer of retiredLandingLayers) expect(main).not.toContain(retiredLayer);
  });

  it('matches the approved v0 editorial sequence without changing product truth', () => {
    for (const value of [
      'Know yourself.', 'Understand the system.', 'Choose what fits.',
      'Your intelligence begins with your Baseline.',
      'Ask about your life.', 'See the space', 'From one person',
      'Another person remains a person—not a data source you control.',
      '$20', '$99 / year', 'No compatibility score.', 'No mind-reading.', 'No one-sided access.'
    ]) expect(landing).toContain(value);
    for (const prohibited of ['Healing isn', 'compatibility-score', 'Alignment Score', 'Stability Index', 'Growth Rate', 'Math.random', 'mock-auth', 'fake-answer']) expect(landing).not.toContain(prohibited);
  });

  it('renders substantial product scenes and a prominent system instrument', () => {
    for (const value of [
      'className="product-window chat-window"',
      'className="product-window workflow-window"',
      'className="workflow-branches"',
      'className="between-field"',
      'className="system-instrument"',
      'className="system-center"',
      'className={`system-member ${member.position}`}',
      'data-viewport-surface="system-instrument"'
    ]) expect(landing).toContain(value);
    expect(landingCss).toContain('grid-template-columns:minmax(0,1.55fr) minmax(260px,.45fr)');
    expect(landingCss).toContain('min-height:520px');
  });

  it('measures the rendered viewport and keeps motion accessible', () => {
    expect(main).toContain('installPublicLandingViewportContract();');
    for (const value of ['getBoundingClientRect()', 'node.offsetWidth', 'doc.documentElement.scrollWidth', 'consentStacked']) expect(viewportProbe).toContain(value);
    expect(landingCss).toContain('@supports (animation-timeline:view())');
    expect(landingCss).toContain('@media (prefers-reduced-motion:reduce)');
    expect(landingCss).toContain('@media (max-width:720px)');
    expect(landingCss).toContain('@media (max-width:390px)');
  });

  it('preserves authentication, billing, consent, and the canonical workspace', () => {
    for (const route of ["path === '/login'", "path === '/signup'", "path === '/invitation'", "path === '/onboarding'"]) expect(app).toContain(route);
    expect(app).toContain('__TURNSTILE_SITE_KEY__');
    expect(onboarding).toContain('/api/v1/billing/checkout');
    expect(controls).toContain('/api/v1/billing/portal');
    expect(membership).toContain("person.activeScopes.includes('system.include')");
    expect(authenticated).toContain('data-workspace-contract="one-room"');
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
  });

  it('keeps support pages and CSS structurally valid', () => {
    supportPages.forEach((page) => expect(page).toContain('/premium-public-release.css?v=20260730-final'));
    for (const source of [landingCss, premiumCss, visualCss, viewportCss, publicCss]) balanced(source);
  });
});
