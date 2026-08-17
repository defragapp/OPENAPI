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
const landingRefinementV5 = read('./landing-live-refinement-v5.css');
const invitationFidelity = read('./invitation-rendered-fidelity-v1.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const typography = read('./typography-system.css');
const passkeyCss = read('./passkey-auth.css');
const routeCohesionCss = read('./deployed-route-cohesion.css');
const staticV0Css = read('../public/v0-public-port.css');
const staticAuthority = read('../public/premium-public-release.css');
const staticRefinement = read('../public/experience-static-refinement-v1.css');

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('founder visual port — public positioning reset', () => {
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
    expect(main).toContain("import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;'));
    for (const source of [v0PlatformCss, v0MotionCss, v0Css, v0GlobalCss, fieldCss, integrationCss, lineageStoryCss, isolatedStoryCss, approvedCss, heroExtension, finalAuthority, refinement, renderedFidelity, landingRefinementV2, landingRefinementV5, invitationFidelity, sansAuthority, typography, passkeyCss, routeCohesionCss, staticRefinement]) expectBalancedCss(source);
  });

  it('preserves the archive compatibility fingerprint as historical provenance only', () => {
    expect(fingerprint).toContain(`V0_ARCHIVE_SHA256 = '${archiveSha}'`);
    expect(fingerprint).toContain(`V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`);
    expect(fingerprint).toContain("PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'");
    expect(fingerprint).toContain("PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'");
    expect(main).toContain('installV0ReleaseFingerprint();');
  });

  it('keeps the founder statement while making self exploration, People, and Systems explicit', () => {
    expect(landing).toContain(`const V0_ARCHIVE_SHA = '${archiveSha}'`);
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).toContain('data-public-narrative="self-people-systems-v1"');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.');
    expect(landing).toContain('Start with you');
    expect(landing).toContain('Explore yourself.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).toContain('<LandingProductStories />');
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).not.toContain('One private reference beneath every question.');
    expect(landing).not.toContain('One private foundation.');
    expect(landing).not.toContain('calculated astronomical positions');
    expect(landing).not.toContain('capacity beneath');
  });

  it('keeps the 360 Baseline field interactive and exposes one compact endpoint label only after selection', () => {
    for (const marker of [
      'const CENTER = VIEWBOX_SIZE / 2',
      'const SPHERE_RADIUS = 286',
      'const MIN_AXIS_LENGTH = 118',
      'const MAX_AXIS_LENGTH = 344',
      'const TOOLTIP_WIDTH = 104',
      'const TOOLTIP_HEIGHT = 26',
      'data-field-geometry="spherical-360"',
      "data-inspecting={hasInspection ? 'true' : 'false'}",
      'buildSphereGrid',
      'buildAmbientRays',
      'requestAnimationFrame',
      'onClick={(event) =>',
      'setHasInspection(true)',
      'landing-expression-slice__tooltip-title',
      'landing-expression-slice__tooltip-value',
      '{selected.axis.value}',
      'click a line to inspect it'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('onPointerEnter={() => selectAxis(axis.id)}');
    expect(field).not.toContain('measurement lines');
    expect(field).not.toContain('stable blue sphere');
    expect(landingRefinementV5).toContain('width: 104px !important');
    expect(landingRefinementV5).toContain('height: 26px !important');
  });

  it('uses one sans hero system and constrained entry motion', () => {
    for (const marker of [
      'One typeface. Hierarchy comes from weight, scale, and opacity.',
      '.v0-hero h1 > span',
      '.v0-hero h1 > em',
      'font-family: inherit !important',
      '@keyframes sovereign-hero-rise',
      '@keyframes sovereign-field-arrive',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(landingRefinementV5).toContain(marker);
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(landingRefinementV5).not.toContain('.landing-baseline-intro');
    expect(typography).not.toContain('font-family: "Sovereign Display"');
    expect(sansAuthority).toContain('.public-approved-v8 .v0-hero h1 > em');
  });

  it('shows broad self exploration, relationship intelligence, and whole-system intelligence', () => {
    for (const marker of [
      '01 · You',
      'Explore how you think, decide, create, connect, and grow.',
      'How Sovereign explores the question',
      'How you tend to create',
      'What feels aligned',
      '02 · You + your people',
      'Understand what happens between you.',
      '03 · From 1:1 to the whole system',
      'See the whole system.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Keeping both people distinct',
      'Seeing the whole system',
      'Roles',
      'Authority + expectations',
      'Missing perspective',
      '360 + step * 900',
      'data-motion-state'
    ]) expect(stories).toContain(marker);
    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(stories).toContain('landing-workflow__progress');
    expect(stories).not.toContain('Separate helping from carrying the outcome.');
    expect(stories).not.toContain('See where responsibility keeps landing.');
    expect(stories).not.toContain('capacity beneath');
  });

  it('keeps public Basis quiet and relationship/system boundaries explicit', () => {
    for (const marker of ["{ code: 'GK 13.4'", "{ code: 'GATE 4.11'", "{ code: 'MARS · CANCER'", "{ code: 'GATE 22.4'", "{ code: 'GATE 57.2'"]) expect(stories).toContain(marker);
    expect(stories).toContain('<strong>Basis</strong>');
    expect(stories).toContain('Shared with permission');
    expect(stories).toContain('Illustrative supplied context');
    expect(stories).toContain('Each person controls what may be included');
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
    expect(landingRefinementV5).toContain('@media (max-width: 760px)');
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
