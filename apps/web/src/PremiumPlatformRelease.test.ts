import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const sequenceFingerprint = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|rotating-real-life-questions|ask-about-your-life|get-an-answer-built-for-you|see-the-space-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${archiveSha}`;
const main = read('./main.tsx');
const fingerprint = read('./v0-release-fingerprint.ts');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const viewportProbe = read('./PublicLandingViewportContract.ts');
const authenticated = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const controls = read('./AccountControlCenter.tsx');
const membership = read('./SystemMembershipManager.tsx');
const v0Css = read('./v0-visual-port.css');
const v0PlatformCss = read('./v0-platform-port.css');
const staticV0Css = read('../public/v0-public-port.css');
const staticAuthority = read('../public/premium-public-release.css');

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('founder v0 selective visual port', () => {
  it('loads complete route coverage before the final visual authority', () => {
    const platformImport = "import './v0-platform-port.css';";
    const visualImport = "import './v0-visual-port.css';";
    const platformIndex = main.indexOf(platformImport);
    const visualIndex = main.indexOf(visualImport);
    expect(platformIndex).toBeGreaterThan(-1);
    expect(visualIndex).toBeGreaterThan(platformIndex);
    expect(main.slice(visualIndex + visualImport.length)).not.toContain("import './");
    expect(v0Css).toContain(`Source archive SHA-256:\n * ${archiveSha}`);
    expectBalancedCss(v0PlatformCss);
    expectBalancedCss(v0Css);
  });

  it('emits the exact archive and sequence fingerprint at runtime', () => {
    expect(fingerprint).toContain(`V0_ARCHIVE_SHA256 = '${archiveSha}'`);
    expect(fingerprint).toContain(`V0_SEQUENCE_FINGERPRINT = '${sequenceFingerprint}'`);
    expect(fingerprint).toContain("dataset.sovereignVisualContract = 'v0-landing-selective-port'");
    expect(fingerprint).toContain('dataset.sovereignV0Archive = V0_ARCHIVE_SHA256');
    expect(fingerprint).toContain('dataset.sovereignV0Sequence = V0_SEQUENCE_FINGERPRINT');
    expect(main).toContain("import { installV0ReleaseFingerprint } from './v0-release-fingerprint'");
    expect(main).toContain('installV0ReleaseFingerprint();');
  });

  it('ports the actual v0 landing headings and sequence', () => {
    expect(landing).toContain(`const V0_ARCHIVE_SHA = '${archiveSha}'`);
    expect(landing).toContain('data-visual-contract="v0-landing-selective-port"');
    const markers = [
      'Healing isn’t optional.',
      'Holding onto the pain is.',
      '<RotatingQuestions />',
      '<PersonalStory />',
      '<RelationshipStory />',
      '<SystemStory />',
      '<ComparisonStory />',
      '<FinalCallToAction />'
    ];
    let previous = -1;
    for (const marker of markers) {
      const index = landing.indexOf(marker);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
    for (const copy of [
      'Ask about your life.',
      'Get an answer built for you.',
      'See the space',
      'between you.',
      'From one person',
      'to the whole system.',
      'Other AI answers',
      'everyone the same.',
      'Your thoughts deserve',
      'a better place to live.'
    ]) expect(landing).toContain(copy);
  });

  it('ports the v0 demonstrations rather than a generic marketing reconstruction', () => {
    for (const marker of [
      'className="v0-story-grid"',
      'className="v0-baseline-trace"',
      'function ProcessingFlow(',
      'className="v0-window v0-flow"',
      'className="v0-family-map"',
      'data-viewport-surface="personal-chat"',
      'data-viewport-surface="personal-reasoning"',
      'data-viewport-surface="relationship-chat"',
      'data-viewport-surface="relationship-reasoning"',
      'data-viewport-surface="system-map"',
      'data-viewport-surface="comparison"'
    ]) expect(landing).toContain(marker);
  });

  it('applies the same v0 language to the real platform and standalone routes', () => {
    for (const selector of [
      '.v0-hero',
      '.v0-story-grid',
      '.v0-family-map',
      '.intelligence-workspace',
      '.intelligence-sidebar',
      '.sovereign-composer',
      '.account-shell',
      '.auth-panel',
      '.workspace-sheet'
    ]) expect(v0Css).toContain(selector);
    for (const selector of [
      'body:has(.plan-onboarding)',
      'body:has(.sovereign-policy)',
      '.plan-nav',
      '.onboarding-plan-grid',
      '.plan-visual',
      '.policy-hero',
      '.policy-grid',
      '.policy-contact',
      '.email-code-fallback'
    ]) expect(v0PlatformCss).toContain(selector);
    for (const selector of ['body.launch-page', '.launch-nav', '.launch-hero', '.journey-steps', '.pricing-grid', '.faq-list details', '.launch-footer']) {
      expect(staticV0Css).toContain(selector);
    }
    expect(staticAuthority).toContain("@import url('/v0-public-port.css?v=20260801-founder-v0')");
    expect(v0Css).toContain('@media (max-width: 760px)');
    expect(v0PlatformCss).toContain('@media (max-width: 700px)');
    expect(v0Css).toContain('@media (prefers-reduced-motion: reduce)');
    expectBalancedCss(staticV0Css);
  });

  it('measures the rendered v0 surfaces at desktop and phone widths', () => {
    for (const surface of ['hero', 'personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'comparison']) {
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

  it('does not import the archive mock runtime', () => {
    const source = `${landing}\n${v0Css}\n${v0PlatformCss}\n${app}\n${workspace}`;
    for (const prohibited of ['Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid', 'Demo User', 'generateAIResponse']) {
      expect(source).not.toContain(prohibited);
    }
  });
});