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
const intelligenceDemoCss = read('./public-intelligence-demonstration-v1.css');
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
  it('loads the founder stack and keeps production visual authority terminal', () => {
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
    expect(main).toContain("import publicIntelligenceDemonstrationCss from './public-intelligence-demonstration-v1.css?inline';");
    const productCohesion = main.indexOf('style.textContent += `\\n${productionProductCohesionCss}`;');
    const intelligenceDemo = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationCss}`;');
    const productionVisual = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    expect(intelligenceDemo).toBeGreaterThan(productCohesion);
    expect(productionVisual).toBeGreaterThan(intelligenceDemo);
    expect(main.slice(productionVisual + 'style.textContent += `\\n${productionVisualAuthorityCss}`;'.length)).not.toContain('style.textContent +=');
    for (const source of [v0PlatformCss, v0MotionCss, v0Css, v0GlobalCss, fieldCss, integrationCss, lineageStoryCss, isolatedStoryCss, approvedCss, heroExtension, finalAuthority, refinement, renderedFidelity, landingRefinementV2, landingRefinementV5, intelligenceDemoCss, invitationFidelity, sansAuthority, typography, passkeyCss, routeCohesionCss, staticRefinement]) expectBalancedCss(source);
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
    expect(landing).toContain('Healing isn\u2019t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).toContain('<LandingProductStories />');
    expect(landing).not.toContain('<BaselineFoundation />');
    expect(landing).not.toContain('One private reference beneath every question.');
    expect(landing).not.toContain('One private foundation.');
    expect(landing).not.toContain('calculated astronomical positions');
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

  it('shows broad self exploration, relationship intelligence, and whole-system intelligence in approved language', () => {
    for (const marker of [
      '01 · YOU',
      '02 · YOU & YOUR PEOPLE',
      '03 · WHOLE SYSTEM',
      'demo-selector',
      'demo-card',
      'See source details',
      'Representative example · Not your Baseline Design'
    ]) expect(stories).toContain(marker);
    expect((stories.match(/<WorkflowPanel/g) ?? []).length).toBe(0);
    expect(stories).not.toContain('landing-workflow__progress');
    expect(stories).not.toContain('<FamilySystemMap />');
    expect(stories).not.toContain('capacity beneath');
    expect(stories).not.toContain('permitted perspectives');
    expect(stories).not.toContain('confirmed responsibilities');
  });

  it('keeps public source details exact, fixture-backed, and collapsed by default', () => {
    for (const marker of ["{ code: 'tenderness'", "{ code: 'responsibility'", "{ code: 'boundaries'", "{ code: 'clarity □ steadiness'"]) expect(stories).toContain(marker);
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).toContain('These values are not visitor data.');
    expect(stories).not.toContain('<strong>Example Basis</strong>');
    expect(stories).not.toContain("chips: ['HD G13.1'");
    expect(stories).not.toContain('GATE 4.11');
    expect(finalAuthority).toContain('.landing-evidence__code');
    expect(intelligenceDemoCss).toContain('.landing-evidence > summary');
  });

  it('places simplified demo before source details and anchors the composer outside the answer body', () => {
    expect(stories).toContain('demo-selector');
    expect(stories).toContain('demo-card');
    expect(stories).toContain('landing-evidence');
    expect(intelligenceDemoCss).toContain('grid-template-columns: minmax(320px, .88fr) minmax(0, 1.12fr) !important;');
    expect(intelligenceDemoCss).toContain('.landing-demo__composer-shell');
    expect(intelligenceDemoCss).toContain('@media (max-width: 900px)');
  });

  it('measures the complete rendered landing at desktop and phone widths', () => {
    for (const surface of ['hero', 'expression-slice', 'demo-card', 'comparison']) expect(viewportProbe).toContain(`'${surface}'`);
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

  it('requires plain Sources UI in the authenticated product while preserving internal Basis transport', () => {
    expect(workspace).toContain('<strong>Sources</strong>');
    expect(workspace).toContain('<h2 id="basis-title">Source details</h2>');
    expect(workspace).toContain('These are the source values Sovereign used for this answer.');
    expect(workspace).not.toContain('<strong>Basis</strong>');
    expect(workspace).not.toContain('aria-label={`Basis. Open ${available.length} source values.`}');
    expect(workspace).toContain('basis: BasisValue[]');
    expect(workspace).toContain('basis_refs: string[]');
  });

  it('does not import mock runtime or unsupported scoring', () => {
    const source = `${landing}\n${stories}\n${field}\n${v0Css}\n${v0PlatformCss}\n${app}\n${workspace}`;
    for (const prohibited of ['Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid', 'Demo User', 'generateAIResponse', 'Alignment Score', 'Stability Index']) expect(source).not.toContain(prohibited);
    expect(staticAuthority).toContain("@import url('/v0-public-port.css?v=20260801-founder-v0')");
    expect(staticV0Css).toContain('body.launch-page');
  });
});