import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const stories = read('./LandingProductStories.tsx');
const field = read('./expression-field/LandingExpressionSlice.tsx');
const fieldStyles = read('./landing-expression-field-v3.css');
const integrationStyles = read('./landing-expression-field-integration.css');
const storyStyles = read('./landing-product-stories-v2.css');
const approvedStyles = read('./public-landing-approved-v8.css');
const heroExtension = read('./landing-hero-field-v4.css');
const finalAuthority = read('./public-landing-final-authority.css');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('approved public landing v8', () => {
  it('loads the v0 foundation, field, stories, landing authority, route cohesion, and passkey authority in order', () => {
    const fieldImport = "import './landing-expression-field-v3.css';";
    const integrationImport = "import './landing-expression-field-integration.css';";
    const lineageImport = "import './v0-restored-product-stories.css';";
    const storiesImport = "import './landing-product-stories-v2.css';";
    const approvedImport = "import './public-landing-approved-v8.css';";
    const heroImport = "import './landing-hero-field-v4.css';";
    const routeImport = "import './deployed-route-cohesion.css';";
    const passkeyImport = "import './passkey-auth.css';";
    expect(main.indexOf(integrationImport)).toBeGreaterThan(main.indexOf(fieldImport));
    expect(main.indexOf(lineageImport)).toBeGreaterThan(main.indexOf(integrationImport));
    expect(main.indexOf(storiesImport)).toBeGreaterThan(main.indexOf(lineageImport));
    expect(main.indexOf(approvedImport)).toBeGreaterThan(main.indexOf(storiesImport));
    expect(main.indexOf(heroImport)).toBeGreaterThan(main.indexOf(approvedImport));
    expect(main.indexOf(routeImport)).toBeGreaterThan(main.indexOf(heroImport));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(routeImport));
    expect(main.slice(main.indexOf(passkeyImport) + passkeyImport.length)).not.toContain("import './");
    expect(main).not.toContain("import './public-landing-approved-v7.css';");
  });

  it('renders the approved immersive hero, real-life questions, and three product demonstrations', () => {
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).toContain('data-layout-release="v0-motion-workflows-v8"');
    expect(landing).toContain('<BrandMark />');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<RealLifeQuestions />');
    expect(landing).toContain('<LandingProductStories />');
    expect(landing.indexOf('<RealLifeQuestions />')).toBeLessThan(landing.indexOf('<LandingProductStories />'));
    expect(landing).toContain('Bring the question you actually have.');
    expect(landing).toContain('Why do we keep having the same fight?');
    expect(landing).toContain('<MobileCapabilityRail />');
    expect(landing).toContain('sovereign-opening-capabilities');
    expect(landing).toContain('See the capacity beneath a pattern, how it may express, what happens between people, and what could change.');
    expect(landing).toContain('Private. Secure. Yours.');
    expect(landing).toContain('v0-mobile-menu');
    expect(landing).toContain('title={<BrandMark />}');
    expect(landing).not.toContain('title="<BrandMark />"');
    expect(landing).not.toContain('HERO_CAPABILITIES');
  });

  it('uses one stable center with value-driven 360 Cloudflare-blue measurements', () => {
    for (const marker of [
      'const VIEWBOX_SIZE = 920',
      'const CENTER = VIEWBOX_SIZE / 2',
      'const SPHERE_RADIUS = 286',
      'const MIN_AXIS_LENGTH = 118',
      'const MAX_AXIS_LENGTH = 344',
      'Array.from({ length: count }',
      'data-field-geometry="spherical-360"',
      'onPointerDown={handlePointerDown}',
      'onPointerMove={handlePointerMove}',
      'landing-expression-slice__readout',
      'relative emphasis',
      'buildSphereGrid',
      'requestAnimationFrame'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('<div className="landing-expression-slice__tooltip"');
    expect(field).not.toContain('#8b5cff');
    expect(heroExtension).toContain('.landing-expression-slice__sphere-shell');
    expect(heroExtension).toContain('stroke: #2f93ff');
    expect(heroExtension).toContain('height: 58%');
    expect(heroExtension).toContain('mask-image: linear-gradient');
  });

  it('uses one reasoning flow, relationship perspective context, and a map-first system view', () => {
    for (const marker of [
      'See the capacity beneath the pattern.',
      'Understand what happens between you.',
      'See what keeps the pattern going—and what could change it.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"'
    ]) expect(renderedStories).toContain(marker);
    for (const marker of [
      'Seeing the capacity beneath it',
      'Seeing how it is expressing',
      'Seeing what keeps it going',
      'Seeing what could change',
      'Keeping both people distinct',
      'Clarity may take time.',
      'Clarity may arrive quickly.',
      'Between you',
      'Mapping the people',
      'Roles',
      'Responsibility',
      'Movement'
    ]) expect(stories).toContain(marker);
    expect((stories.match(/<WorkflowPanel /g) ?? []).length).toBe(1);
    expect(stories).toContain('<RelationshipContext />');
    expect(stories).toContain('<SystemContext />');
    expect(stories).not.toContain("name: 'Maya'");
    expect(stories).not.toContain("name: 'Noa'");
    expect(stories).not.toContain("name: 'Ruth'");
    expect(renderedStories).not.toContain('title="Ask about your life."');
  });

  it('keeps source codes as quiet Basis metadata rather than interpretation chips', () => {
    expect(stories).toContain('<strong>Basis</strong>');
    expect(stories).toContain("{ code: 'GK 13.4'");
    expect(stories).toContain("{ code: 'GATE 4.11'");
    expect(stories).toContain("{ code: 'MARS · CANCER'");
    expect(stories).toContain("{ code: 'GATE 22.4'");
    expect(stories).toContain("{ code: 'GATE 57.2'");
    expect(stories).not.toContain('<p>Grounded in</p>');
    expect(stories).not.toContain("code: 'Needs time'");
    expect(stories).not.toContain("code: 'Recognizes quickly'");
    expect(finalAuthority).toContain('.landing-evidence__code');
    expect(finalAuthority).toContain('.landing-demo--context');
    expect(finalAuthority).toContain('.landing-story__stage--system');
  });

  it('holds the screenshot-defined desktop rail, density, and editorial line breaks', () => {
    for (const marker of [
      '@media (min-width: 981px)',
      'min-height: 690px',
      'width: min(176px, calc(100vw - 30px))',
      'width: min(900px, calc(100% - 56px))',
      'min-height: 434px',
      'min-height: 190px',
      '.landing-story--relationship',
      'padding-top: 112px',
      '.landing-story--system',
      'padding-bottom: 52px'
    ]) expect(approvedStyles).toContain(marker);
    expect(landing).toContain('Generic AI<br />sees the<br />prompt.<br />');
    expect(landing).toContain('<span>Sovereign<br />sees the<br />context.</span>');
    expect(landing).toContain('Your thoughts<br />deserve<br />a better place to live.');
  });

  it('plays the single reasoning workflow once, then settles', () => {
    expect(stories).toContain('useWorkflowProgress(panelRef, steps.length)');
    expect(stories).toContain('timers.push(window.setTimeout');
    expect(stories).toContain("data-motion-state={visibleIndex >= steps.length - 1 ? 'settled' : 'running'}");
    expect(stories).not.toContain('window.setInterval');
    expect(approvedStyles).toContain('v8-message-in');
    expect(approvedStyles).toContain(".landing-story[data-visible='true'] .landing-message");
    expect(approvedStyles).toContain('.landing-workflow > li.is-active');
  });

  it('gives iPhone the same approved opening with stable viewport sizing, rotating questions, and natural story stacking', () => {
    for (const marker of [
      '@media (max-width: 760px)',
      'min-height: max(776px, calc(100svh - 68px))',
      '.v0-wordmark--mobile',
      '.v0-mobile-menu[open] > .v0-mobile-menu__panel',
      '.sovereign-opening-copy--mobile',
      '.sovereign-opening-capabilities',
      '.landing-expression-slice__ambient--mobile',
      'grid-template-columns: repeat(4, minmax(0, 1fr))',
      'width: calc(100% - 28px)',
      'flex-direction: column',
      'height: auto',
      'min-height: 0',
      '.landing-workflow__copy > span',
      'display: none',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(approvedStyles).toContain(marker);
    for (const marker of [
      '--v8-stable-viewport-height',
      'min-height: max(900px, calc(var(--v8-stable-viewport-height) - 68px + env(safe-area-inset-bottom)))',
      'touch-action: pan-y pinch-zoom',
      '@media (max-width: 980px) and (orientation: landscape) and (max-height: 560px)',
      '.landing-question-orbit__stage',
      '@keyframes landing-real-question'
    ]) expect(heroExtension).toContain(marker);
    expect(main).toContain('function installMobileViewportStability()');
    expect(main).toContain('window.visualViewport');
    expect(approvedStyles).toContain('border-radius: 999px');
    expect(main).toContain("dataset.sovereignLayoutRelease = 'approved-public-v8'");
    expect(main).toContain("dataset.sovereignProductStories = 'isolated-mobile-first-v2'");
    expect(main).toContain("dataset.sovereignMotionRelease = 'v0-motion-workflows-v8'");
  });

  it('keeps every active CSS layer structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, approvedStyles, heroExtension, finalAuthority]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
