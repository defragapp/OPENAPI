import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;
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
const v0MotionCss = read('./v0-motion-accessibility.css');
const v0GlobalCss = read('./v0-global-experience.css');
const fieldCss = read('./landing-expression-field-v3.css');
const integrationCss = read('./landing-expression-field-integration.css');
const lineageStoryCss = read('./v0-restored-product-stories.css');
const isolatedStoryCss = read('./landing-product-stories-v2.css');
const approvedCss = read('./public-landing-approved-v8.css');
const heroExtension = read('./landing-hero-field-v4.css');
const finalAuthority = read('./public-landing-final-authority.css');
const refinement = read('./experience-refinement-v1.css');
const renderedFidelity = read('./rendered-fidelity-v1.css');
const landingRefinementV2 = read('./landing-refinement-v2.css');
const invitationFidelity = read('./invitation-rendered-fidelity-v1.css');
const passkeyCss = read('./passkey-auth.css');
const routeCohesionCss = read('./deployed-route-cohesion.css');
const staticV0Css = read('../public/v0-public-port.css');
const staticAuthority = read('../public/premium-public-release.css');
const staticRefinement = read('../public/experience-static-refinement-v1.css');

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('founder v0 selective visual port — approved public v8', () => {
  it('loads the founder stack and appends current rendered authorities in order', () => {
    const imports = [
      "import './v0-platform-port.css';",
      "import './v0-motion-accessibility.css';",
      "import './v0-visual-port.css';",
      "import './v0-global-experience.css';",
      "import './landing-expression-field-v3.css';",
      "import './landing-expression-field-integration.css';",
      "import './v0-restored-product-stories.css';",
      "import './landing-product-stories-v2.css';",
      "import './public-landing-approved-v8.css';",
      "import './landing-hero-field-v4.css';",
      "import './deployed-route-cohesion.css';",
      "import './passkey-auth.css';"
    ];
    let previous = -1;
    for (const marker of imports) {
      const index = main.indexOf(marker);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(main.slice(previous + imports.at(-1)!.length)).not.toContain("import './");
    expect(main).toContain("import renderedFidelityCss from './rendered-fidelity-v1.css?inline';");
    expect(main).toContain("import landingRefinementV2Css from './landing-refinement-v2.css?inline';");
    expect(main).toContain("import invitationRenderedFidelityCss from './invitation-rendered-fidelity-v1.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${landingRefinementV2Css}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;'));
    expect(main.indexOf('style.textContent += `\\n${invitationRenderedFidelityCss}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${landingRefinementV2Css}`;'));
    for (const source of [v0PlatformCss, v0MotionCss, v0Css, v0GlobalCss, fieldCss, integrationCss, lineageStoryCss, isolatedStoryCss, approvedCss, heroExtension, finalAuthority, refinement, renderedFidelity, landingRefinementV2, invitationFidelity, passkeyCss, routeCohesionCss, staticRefinement]) expectBalancedCss(source);
  });

  it('preserves the archive compatibility fingerprint as historical provenance', () => {
    expect(fingerprint).toContain(`V0_ARCHIVE_SHA256 = '${archiveSha}'`);
    expect(fingerprint).toContain(`V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`);
    expect(fingerprint).toContain("PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'");
    expect(fingerprint).toContain("PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'");
    expect(main).toContain('installV0ReleaseFingerprint();');
  });

  it('keeps the founder hero while translating the product into ordinary use cases', () => {
    expect(landing).toContain(`const V0_ARCHIVE_SHA = '${archiveSha}'`);
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Sovereign uses your Baseline to help make sense of real questions about yourself, relationships, decisions, and family or group dynamics.');
    expect(landing).toContain('Built for real situations');
    expect(landing).toContain('Start with what’s actually happening.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(landing).not.toContain('capacity beneath');
  });

  it('keeps the 360 Baseline field interactive and exposes one compact endpoint label', () => {
    for (const marker of [
      'const CENTER = VIEWBOX_SIZE / 2',
      'const SPHERE_RADIUS = 286',
      'const MIN_AXIS_LENGTH = 118',
      'const MAX_AXIS_LENGTH = 344',
      'data-field-geometry="spherical-360"',
      'data-inspecting="true"',
      'buildSphereGrid',
      'buildAmbientRays',
      'requestAnimationFrame',
      'onPointerEnter={() => selectAxis(axis.id)}',
      'landing-expression-slice__tooltip-title',
      'landing-expression-slice__tooltip-value',
      '{selected.axis.value}',
      'select a line to see its name and relative value'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('measurement lines');
    expect(field).not.toContain('stable blue sphere');
    expect(landingRefinementV2).toContain('width: 132px !important');
    expect(landingRefinementV2).toContain('height: 34px !important');
  });

  it('shows product behavior rather than static demo cards', () => {
    for (const marker of [
      'Separate helping from carrying the outcome.',
      'How Sovereign gets there',
      'What your Baseline supports',
      'Where responsibility shifts',
      'A cleaner boundary',
      'Understand what happens between you.',
      'See where responsibility keeps landing.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Keeping both people distinct',
      'What Sovereign separates',
      'Observed route',
      'Testable change',
      'Selected observation',
      'What to test',
      '360 + step * 900',
      'data-motion-state'
    ]) expect(stories).toContain(marker);
    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(stories).toContain('landing-workflow__progress');
    expect(stories).not.toContain("role: 'Stabilizer'");
    expect(stories).not.toContain("role: 'Catalyst'");
    expect(stories).not.toContain("role: 'Observer'");
    expect(stories).not.toContain("role: 'Anchor'");
    expect(stories).not.toContain('capacity beneath');
  });

  it('keeps public Basis quiet and relationship/system boundaries explicit', () => {
    for (const marker of ["{ code: 'GK 13.4'", "{ code: 'GATE 4.11'", "{ code: 'MARS · CANCER'", "{ code: 'GATE 22.4'", "{ code: 'GATE 57.2'"]) expect(stories).toContain(marker);
    expect(stories).toContain('<strong>Basis</strong>');
    expect(stories).toContain('Shared with permission');
    expect(stories).toContain('Illustrative supplied context');
    expect(stories).toContain('Each person controls what may be included');
    expect(stories).toContain('That is a system pattern—not proof that any one person is the cause.');
    expect(finalAuthority).toContain('.landing-evidence__code');
  });

  it('makes desktop demonstrations larger and mobile demonstrations shorter', () => {
    expect(landingRefinementV2).toContain('width: min(1280px, calc(100% - 64px)) !important');
    expect(landingRefinementV2).toContain('font-size: 0.92rem !important');
    expect(landingRefinementV2).toContain('grid-template-columns: minmax(0, 1.34fr) minmax(320px, 0.66fr) !important');
    expect(landingRefinementV2).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinementV2).toContain('.landing-demo--system-context');
    expect(landingRefinementV2).toContain('display: none !important');
    expect(landingRefinementV2).toContain('@media (prefers-reduced-motion: reduce)');
    expect(main).toContain('function installMobileViewportStability()');
    expect(main).toContain('window.visualViewport');
  });

  it('measures the complete rendered landing at desktop and phone widths', () => {
    for (const surface of ['hero', 'expression-slice', 'personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'system-reasoning', 'comparison']) expect(viewportProbe).toContain(`'${surface}'`);
    expect(viewportProbe).toContain('const narrow = snapshot.viewportWidth <= narrowViewportMaximum');
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportProbe).toContain('comparisonStacked');
  });

  it('preserves the real OPENAPI architecture and production behavior', () => {
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

  it('does not import mock runtime or unsupported scoring', () => {
    const source = `${landing}\n${stories}\n${field}\n${v0Css}\n${v0PlatformCss}\n${app}\n${workspace}`;
    for (const prohibited of ['Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid', 'Demo User', 'generateAIResponse', 'Alignment Score', 'Stability Index']) expect(source).not.toContain(prohibited);
    expect(staticAuthority).toContain("@import url('/v0-public-port.css?v=20260801-founder-v0')");
    expect(staticV0Css).toContain('body.launch-page');
  });
});
