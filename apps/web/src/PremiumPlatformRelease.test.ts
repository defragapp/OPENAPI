import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const main = read('./main.tsx');
const fingerprint = read('./v0-release-fingerprint.ts');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const viewportProbe = read('./PublicLandingViewportContract.ts');
const authenticated = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const controls = read('./AccountControlCenter.tsx');
const membership = read('./SystemMembershipManager.tsx');
const v0Css = read('./v0-visual-port.css');
const v0PlatformCss = read('./v0-platform-port.css');
const landingRefinementV5 = read('./landing-live-refinement-v5.css');
const typography = read('./typography-system.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const seniorSystem = read('./senior-design-system-v1.css');
const demoV2 = read('./public-intelligence-demonstration-v2.css');
const staticAuthority = read('../public/premium-public-release.css');
const staticV0Css = read('../public/v0-public-port.css');

function balanced(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('premium platform release — current public product contract', () => {
  it('preserves founder lineage while current rendered authorities remain explicit', () => {
    expect(fingerprint).toContain(`V0_ARCHIVE_SHA256 = '${archiveSha}'`);
    expect(fingerprint).toContain("PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'");
    expect(main).toContain("import seniorDesignSystemCss from './senior-design-system-v1.css?inline';");
    expect(main).toContain("import publicIntelligenceDemonstrationV2Css from './public-intelligence-demonstration-v2.css?inline';");
    const senior = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    const demos = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;');
    expect(demos).toBeGreaterThan(senior);
    expect(main).toContain("document.documentElement.dataset.sovereignVisualAuthority = 'senior-design-system-v1';");
    expect(main).toContain("document.documentElement.dataset.sovereignPublicDemoAuthority = 'text-first-v2';");
  });

  it('keeps the founder statement and public capability progression', () => {
    for (const marker of [
      'Healing isn’t optional.',
      'Holding onto the pain is.',
      'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
      'You → your people → the whole system',
      'Start with yourself. Expand outward when it matters.',
      '<LandingExpressionSlice />',
      '<RealLifeQuestions />',
      '<LandingProductStories />'
    ]) expect(landing).toContain(marker);
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).not.toContain('capacity beneath');
  });

  it('keeps the hero Baseline field interactive without hover-only meaning', () => {
    for (const marker of [
      'data-field-geometry="spherical-360"',
      "data-inspecting={hasInspection ? 'true' : 'false'}",
      'onPointerDown={handlePointerDown}',
      'onPointerMove={handlePointerMove}',
      'setHasInspection(true)',
      'click a line to inspect it',
      'const TOOLTIP_WIDTH = 104',
      'const TOOLTIP_HEIGHT = 26'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
  });

  it('uses native sans typography across the mature product system', () => {
    for (const source of [typography, sansAuthority, seniorSystem]) {
      expect(source).toContain('-apple-system');
      expect(source).toContain('"SF Pro Display"');
      expect(source).not.toContain('\n    Optima,');
      expect(source).not.toContain('\n    "Avenir Next",');
      expect(source).not.toContain('font-family: "Sovereign Display"');
    }
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(demoV2).toContain('var(--sds-title, system-ui, sans-serif)');
  });

  it('makes the three public demonstrations immediate AI product proof rather than workflow tutorials', () => {
    for (const marker of [
      '01 · You',
      'Explore how you think, decide, communicate, create, connect, and grow.',
      'How do I make decisions that actually fit me?',
      'The right decision may not be the easiest one to explain.',
      '02 · You + your people',
      'See why the same moment lands differently—and how to bridge the gap.',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'You may both be trying to reach clarity in opposite ways.',
      '03 · From 1:1 to the whole system',
      'See the whole system.',
      'What changes when I stop playing the role everyone expects?',
      'When one person changes roles, the system has to find another route.',
      '<DecisionField />',
      '<RelationshipField />',
      '<SystemField />',
      'Does this fit?',
      '<strong>See source details</strong>'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('function WorkflowPanel(');
    expect(stories).not.toContain('useWorkflowProgress');
    expect(stories).not.toContain('landing-demo__traffic');
  });

  it('keeps People and Systems permission-safe and does not invent private states or inferred system roles', () => {
    for (const marker of [
      'Both people choose what they share',
      'No compatibility score',
      'Only they can say what they actually felt or intended',
      'Roles and events are supplied in the example',
      'Each person controls whether their Baseline can be included',
      'What you told Sovereign'
    ]) expect(stories).toContain(marker);
    for (const prohibited of ['compatibilityPercent', 'compatibilityScore', 'alignmentScore', 'missing perspective', 'authority as']) expect(stories.toLowerCase()).not.toContain(prohibited.toLowerCase());
  });

  it('preserves fixture-backed sources as collapsed supporting detail', () => {
    for (const marker of ["{ code: 'HD G13.1'", "{ code: 'GK ACT13'", "{ code: '☉ CAN 04.2°'", "{ code: 'HD G22.4'", "{ code: 'HD G57.2'", "{ code: 'REL ☿ □ ☿ 1.8°'"]) expect(stories).toContain(marker);
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).toContain('These values are not visitor data.');
    expect(stories).not.toContain('<strong>Basis</strong>');
  });

  it('renders one progressively richer visual grammar with finite motion and mobile intelligence intact', () => {
    for (const marker of [
      '.landing-understanding--decision',
      '.decision-field__choice',
      '.landing-understanding--relationship',
      '.relationship-field__center',
      '.relationship-field__bridge',
      '.landing-understanding--system',
      '.system-field__state--current',
      '.system-field__state--changed',
      '@keyframes public-demo-arrive-v2',
      '@keyframes public-demo-line-v2',
      '@media (max-width: 760px)',
      '@media (prefers-reduced-motion: reduce)',
      'min-width: 44px !important',
      'min-height: 44px !important'
    ]) expect(demoV2).toContain(marker);
    expect(demoV2).not.toContain('infinite');
    balanced(demoV2);
    balanced(seniorSystem);
  });

  it('keeps viewport release measurement attached to self, relationship, and system proof', () => {
    for (const surface of ['personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'system-reasoning']) {
      expect(viewportProbe).toContain(`'${surface}'`);
      expect(stories).toContain(`"${surface}"`);
    }
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportProbe).toContain('const narrow = snapshot.viewportWidth <= narrowViewportMaximum');
  });

  it('preserves the real OPENAPI architecture and authenticated product behavior', () => {
    expect(authenticated).toContain('data-workspace-contract="one-room"');
    expect(authenticated).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
    expect(workspace).toContain("type Surface = 'Today' | 'Explore' | 'People' | 'Systems' | 'Library' | 'You'");
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
    for (const path of ['/api/v1/today', '/api/v1/people', '/api/v1/systems', '/api/v1/threads/']) expect(workspace).toContain(path);
    for (const route of ["path === '/login'", "path === '/signup'", "path === '/invitation'", "path === '/onboarding'"]) expect(app).toContain(route);
    expect(app).toContain('__TURNSTILE_SITE_KEY__');
    expect(onboarding).toContain('/api/v1/billing/checkout');
    expect(controls).toContain('/api/v1/billing/portal');
    expect(membership).toContain("person.activeScopes.includes('system.include')");
  });

  it('keeps plain Sources UI in the authenticated product while retaining internal Basis transport', () => {
    expect(workspace).toContain('<strong>Sources</strong>');
    expect(workspace).toContain('<h2 id="basis-title">Source details</h2>');
    expect(workspace).toContain('basis: BasisValue[]');
    expect(workspace).toContain('basis_refs: string[]');
    expect(workspace).not.toContain('<strong>Basis</strong>');
  });

  it('does not introduce mock runtime, unsupported scoring, or a second product architecture', () => {
    const source = `${landing}\n${stories}\n${field}\n${v0Css}\n${v0PlatformCss}\n${app}\n${workspace}`;
    for (const prohibited of ['Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid', 'Demo User', 'generateAIResponse', 'Alignment Score', 'Stability Index']) expect(source).not.toContain(prohibited);
    expect(staticAuthority).toContain("@import url('/v0-public-port.css?v=20260801-founder-v0')");
    expect(staticV0Css).toContain('body.launch-page');
  });
});