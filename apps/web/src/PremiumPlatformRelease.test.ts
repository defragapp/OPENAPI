import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const archiveSha = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const main = read('./main.tsx');
const app = read('./App.tsx');
const landing = read('./PublicLanding.tsx');
const viewportProbe = read('./PublicLandingViewportContract.ts');
const authenticated = read('./AuthenticatedWorkspace.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const controls = read('./AccountControlCenter.tsx');
const membership = read('./SystemMembershipManager.tsx');
const v0Css = read('./v0-visual-port.css');

function expectBalancedCss(source: string) {
  expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
}

describe('founder v0 selective visual port', () => {
  it('loads the archive-backed v0 layer as the final visual authority', () => {
    const importLine = "import './v0-visual-port.css';";
    const index = main.indexOf(importLine);
    expect(index).toBeGreaterThan(-1);
    expect(main.slice(index + importLine.length)).not.toContain("import './");
    expect(v0Css).toContain(`Source archive SHA-256:\n * ${archiveSha}`);
    expectBalancedCss(v0Css);
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
      'className="v0-flow"',
      'className="v0-family-map"',
      'data-viewport-surface="personal-chat"',
      'data-viewport-surface="personal-reasoning"',
      'data-viewport-surface="relationship-chat"',
      'data-viewport-surface="relationship-reasoning"',
      'data-viewport-surface="system-map"',
      'data-viewport-surface="comparison"'
    ]) expect(landing).toContain(marker);
  });

  it('applies the same v0 language to the real platform surfaces', () => {
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
    expect(v0Css).toContain('@media (max-width: 760px)');
    expect(v0Css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('measures the rendered v0 surfaces on narrow viewports', () => {
    for (const surface of ['hero', 'personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'comparison']) {
      expect(viewportProbe).toContain(`'${surface}'`);
    }
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
    const source = `${landing}\n${v0Css}\n${app}\n${workspace}`;
    for (const prohibited of ['Math.random', 'mock-auth', 'fake-answer', 'dashboard-grid', 'Demo User', 'generateAIResponse']) {
      expect(source).not.toContain(prohibited);
    }
  });
});
