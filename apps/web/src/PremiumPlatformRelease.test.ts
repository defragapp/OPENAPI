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
const openingCss = read('./sovereign-opening-field.css');
const premiumPublicV4Css = read('./public-landing-premium-v4.css');
const premiumPublicV5Css = read('./public-landing-premium-v5.css');
const premiumPublicV6Css = read('./public-landing-premium-v6.css');
const passkeyCss = read('./passkey-auth.css');
const staticV0Css = read('../public/v0-public-port.css');
const staticAuthority = read('../public/premium-public-release.css');

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('founder v0 selective visual port', () => {
  it('loads the certified visual cascade in order', () => {
    const imports = [
      "import './v0-platform-port.css';",
      "import './v0-motion-accessibility.css';",
      "import './v0-visual-port.css';",
      "import './v0-global-experience.css';",
      "import './landing-expression-field-v3.css';",
      "import './landing-expression-field-integration.css';",
      "import './v0-restored-product-stories.css';",
      "import './landing-product-stories-v2.css';",
      "import './sovereign-opening-field.css';",
      "import './public-landing-premium-v4.css';",
      "import './public-landing-premium-v5.css';",
      "import './public-landing-premium-v6.css';",
      "import './passkey-auth.css';"
    ];
    let previous = -1;
    for (const marker of imports) {
      const index = main.indexOf(marker);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    expect(main.slice(previous + imports.at(-1)!.length)).not.toContain("import './");
    for (const source of [
      v0PlatformCss,
      v0MotionCss,
      v0Css,
      v0GlobalCss,
      fieldCss,
      integrationCss,
      lineageStoryCss,
      isolatedStoryCss,
      openingCss,
      premiumPublicV4Css,
      premiumPublicV5Css,
      premiumPublicV6Css,
      passkeyCss
    ]) expectBalancedCss(source);
  });

  it('emits the exact archive and v3 landing fingerprint at runtime', () => {
    expect(fingerprint).toContain(`V0_ARCHIVE_SHA256 = '${archiveSha}'`);
    expect(fingerprint).toContain(`V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`);
    expect(fingerprint).toContain("PUBLIC_LANDING_CONTRACT = 'v0-public-landing-v3'");
    expect(fingerprint).toContain("PUBLIC_LANDING_FIELD_CONTRACT = 'landing-expression-field-v3'");
    expect(main).toContain('installV0ReleaseFingerprint();');
  });

  it('keeps the approved hero and integrated field first', () => {
    expect(landing).toContain(`const V0_ARCHIVE_SHA = '${archiveSha}'`);
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(field).toContain('onPointerDown={handlePointerDown}');
    expect(field).toContain('landing-expression-slice__tooltip');
    expect(field).not.toContain('sphere');
    expect(integrationCss).toContain('background: transparent');
  });

  it('restores the v0 product demonstrations and active workflows', () => {
    expect(landing).toContain('<LandingProductStories />');
    for (const marker of [
      'Ask about your life.',
      'Get an answer built for you.',
      'Understand what happens',
      'between you.',
      'From one person',
      'to the whole system.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"',
      'v0-baseline-trace',
      'v0-workflow-panel',
      'v0-family-system-map'
    ]) expect(stories).toContain(marker);
    expect(stories).not.toContain('LandingExpressionFieldPreview');
    expect(stories).not.toContain('sphere');
    expect(stories).not.toContain('globe');
  });

  it('enforces the editorial premium v6 page rather than a repeated card stack', () => {
    expect(landing).toContain('public-premium-v4 public-premium-v5 public-premium-v6');
    expect(landing).toContain('data-public-release="premium-public-v6"');
    expect(landing.match(/SOVEREIGN\.OS/g)?.length).toBeGreaterThanOrEqual(3);
    expect(main).toContain("dataset.sovereignLayoutRelease = 'premium-public-v6'");

    for (const marker of [
      '.public-premium-v6 .v0-wordmark',
      'font-size: 1rem',
      '.public-premium-v6 .sovereign-opening-field .v0-hero-content',
      'align-items: flex-start',
      '.public-premium-v6 .landing-story__stage',
      'gap: 1px',
      'border: 1px solid var(--v6-line-strong)',
      '.public-premium-v6 .landing-story--relationship .landing-demo--chat',
      'order: 2',
      '.public-premium-v6 .landing-demo__traffic',
      'display: none',
      "content: 'SOVEREIGN.OS'",
      '.public-premium-v6 .landing-message--assistant > div',
      'background: transparent',
      '.public-premium-v6 .landing-story__heading h2 span',
      '-webkit-text-stroke: 0',
      '.public-premium-v6 .v0-final',
      'text-align: left',
      '@media (max-width: 760px)'
    ]) expect(premiumPublicV6Css).toContain(marker);

    expect(premiumPublicV6Css).not.toContain('border-radius: 999px');
    expect(premiumPublicV6Css).toContain('flex-direction: column');
    expect(premiumPublicV6Css).toContain('min-height: 290px');
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