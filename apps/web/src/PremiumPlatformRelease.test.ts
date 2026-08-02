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
const passkeyCss = read('./passkey-auth.css');
const staticV0Css = read('../public/v0-public-port.css');
const staticAuthority = read('../public/premium-public-release.css');

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('founder v0 selective visual port — approved public v8', () => {
  it('loads one approved landing authority, hero extension, then passkey authority', () => {
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
      "import './passkey-auth.css';"
    ];
    let previous = -1;
    for (const marker of imports) {
      const index = main.indexOf(marker);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(main.slice(previous + imports.at(-1)!.length)).not.toContain("import './");
    expect(main).not.toContain("import './public-landing-approved-v7.css';");
    expect(main).not.toContain("import './public-landing-premium-v4.css';");
    expect(main).not.toContain("import './public-landing-premium-v5.css';");
    expect(main).not.toContain("import './public-landing-premium-v6.css';");
    for (const source of [v0PlatformCss, v0MotionCss, v0Css, v0GlobalCss, fieldCss, integrationCss, lineageStoryCss, isolatedStoryCss, approvedCss, heroExtension, passkeyCss]) {
      expectBalancedCss(source);
    }
  });

  it('emits the exact archive and v3 compatibility fingerprint', () => {
    expect(fingerprint).toContain(`V0_ARCHIVE_SHA256 = '${archiveSha}'`);
    expect(fingerprint).toContain(`V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`);
    expect(fingerprint).toContain("PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'");
    expect(fingerprint).toContain("PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'");
    expect(main).toContain('installV0ReleaseFingerprint();');
  });

  it('keeps the approved hero, 360 Baseline field, and real-life questions first', () => {
    expect(landing).toContain(`const V0_ARCHIVE_SHA = '${archiveSha}'`);
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(landing).toContain('Why do I keep taking responsibility for everyone around me?');
    expect(landing).toContain('<MobileCapabilityRail />');
    expect(landing).toContain('sovereign-opening-capabilities');
    expect(landing).not.toContain('HERO_CAPABILITIES');
    expect(field).toContain('const CENTER = VIEWBOX_SIZE / 2');
    expect(field).toContain('const SPHERE_RADIUS = 286');
    expect(field).toContain('const MIN_AXIS_LENGTH = 118');
    expect(field).toContain('const MAX_AXIS_LENGTH = 344');
    expect(field).toContain('data-field-geometry="spherical-360"');
    expect(field).toContain('buildSphereGrid');
    expect(field).toContain('buildAmbientRays');
    expect(field).toContain('requestAnimationFrame');
    expect(field).not.toContain('<div className="landing-expression-slice__tooltip"');
    expect(field).not.toContain('#8b5cff');
    expect(integrationCss).toContain('background: transparent');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(heroExtension).toContain('stroke: #2f93ff');
  });

  it('uses the approved narrative and v0 motion workflow demonstrations', () => {
    expect(landing).toContain('<LandingProductStories />');
    for (const marker of [
      'See what keeps happening.',
      'Understand what happens between you.',
      'See the whole system.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'Reading your Baseline',
      'Finding the pattern',
      'Building the distinction',
      'Answering the real question',
      'Keeping both people distinct',
      'Reading each perspective',
      'Finding the interaction',
      'Showing what happens between you',
      'Mapping the people',
      'Reading roles and responsibility',
      'Tracing the recurring pattern',
      'Showing the whole system',
      'timers.push(window.setTimeout',
      'data-motion-state'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('window.setInterval');
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('enforces the immersive hero, product windows, questions, and mobile opening', () => {
    for (const marker of [
      '.public-approved-v8 .v0-hero.sovereign-opening-field',
      'min-height: max(820px, calc(100svh - 74px))',
      '.public-approved-v8 .landing-expression-slice',
      '.public-approved-v8 .landing-story__stage',
      'grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr)',
      '.public-approved-v8 .landing-demo',
      'border-radius: 16px',
      '.public-approved-v8 .landing-workflow::before',
      '.public-approved-v8 .landing-workflow > li.is-active',
      'v8-message-in',
      '@media (max-width: 760px)',
      'min-height: max(776px, calc(100svh - 68px))',
      '.v0-wordmark--mobile',
      '.v0-mobile-menu[open] > .v0-mobile-menu__panel',
      '.sovereign-opening-capabilities',
      '.landing-expression-slice__ambient--mobile',
      'grid-template-columns: repeat(4, minmax(0, 1fr))',
      'flex-direction: column',
      '.landing-workflow__copy > span',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(approvedCss).toContain(marker);
    for (const marker of [
      'min-height: max(940px, calc(100svh - 74px))',
      'height: 58%',
      '.landing-expression-slice__readout',
      '.landing-question-orbit__stage',
      '@keyframes landing-real-question',
      'min-height: 1040px'
    ]) expect(heroExtension).toContain(marker);
    expect(approvedCss).toContain('border-radius: 999px');
    expect(main).toContain("dataset.sovereignLayoutRelease = 'approved-public-v8'");
    expect(main).toContain("dataset.sovereignMotionRelease = 'v0-motion-workflows-v8'");
  });

  it('applies the same founder language to the platform and standalone routes', () => {
    for (const selector of ['.v0-hero', '.v0-story-grid', '.intelligence-workspace', '.intelligence-sidebar', '.sovereign-composer', '.account-shell', '.auth-panel', '.workspace-sheet']) expect(v0Css).toContain(selector);
    for (const selector of ['body:has(.plan-onboarding)', 'body:has(.sovereign-policy)', '.plan-nav', '.onboarding-plan-grid', '.policy-hero', '.email-code-fallback']) expect(v0PlatformCss).toContain(selector);
    for (const selector of ['body.launch-page', '.launch-nav', '.launch-hero', '.journey-steps', '.pricing-grid', '.faq-list details', '.launch-footer']) expect(staticV0Css).toContain(selector);
    expect(staticAuthority).toContain("@import url('/v0-public-port.css?v=20260801-founder-v0')");
    expectBalancedCss(staticV0Css);
  });

  it('measures the complete rendered landing at desktop and phone widths', () => {
    for (const surface of ['hero', 'expression-slice', 'personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'system-reasoning', 'comparison']) {
      expect(viewportProbe).toContain(`'${surface}'`);
    }
    expect(viewportProbe).toContain('const narrow = snapshot.viewportWidth <= narrowViewportMaximum');
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportProbe).toContain('node.offsetWidth');
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

  it('does not import the archive mock runtime or unsupported scoring', () => {
    const source = `${landing}\n${stories}\n${field}\n${v0Css}\n${v0PlatformCss}\n${app}\n${workspace}`;
    for (const prohibited of ['Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid', 'Demo User', 'generateAIResponse', 'Alignment Score', 'Stability Index']) {
      expect(source).not.toContain(prohibited);
    }
  });
});
