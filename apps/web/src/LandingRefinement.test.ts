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
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('approved public landing v8', () => {
  it('loads the v0 foundation, integrated field, isolated stories, approved authority, and passkey authority in order', () => {
    const fieldImport = "import './landing-expression-field-v3.css';";
    const integrationImport = "import './landing-expression-field-integration.css';";
    const lineageImport = "import './v0-restored-product-stories.css';";
    const storiesImport = "import './landing-product-stories-v2.css';";
    const approvedImport = "import './public-landing-approved-v8.css';";
    const passkeyImport = "import './passkey-auth.css';";
    expect(main.indexOf(integrationImport)).toBeGreaterThan(main.indexOf(fieldImport));
    expect(main.indexOf(lineageImport)).toBeGreaterThan(main.indexOf(integrationImport));
    expect(main.indexOf(storiesImport)).toBeGreaterThan(main.indexOf(lineageImport));
    expect(main.indexOf(approvedImport)).toBeGreaterThan(main.indexOf(storiesImport));
    expect(main.indexOf(passkeyImport)).toBeGreaterThan(main.indexOf(approvedImport));
    expect(main.slice(main.indexOf(passkeyImport) + passkeyImport.length)).not.toContain("import './");
    expect(main).not.toContain("import './public-landing-approved-v7.css';");
  });

  it('renders the approved immersive hero followed by the three product demonstrations', () => {
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).toContain('data-layout-release="v0-motion-workflows-v8"');
    expect(landing).toContain('SOVEREIGN.OS');
    expect(landing).toContain('Healing isn’t optional.');
    expect(landing).toContain('Holding onto the pain is.');
    expect(landing).toContain('<LandingExpressionSlice />');
    expect(landing).toContain('<LandingProductStories />');
    expect(landing).toContain('<MobileCapabilityRail />');
    expect(landing).toContain('sovereign-opening-capabilities');
    expect(landing).toContain('Sovereign helps you see what’s really happening so you can choose differently.');
    expect(landing).toContain('Private. Secure. Yours.');
    expect(landing).toContain('v0-mobile-menu');
    expect(landing).not.toContain('HERO_CAPABILITIES');
  });

  it('uses one lower-center point with Cloudflare-blue vectors and no globe or horizon', () => {
    for (const marker of [
      'const VIEWBOX_HEIGHT = 780',
      'const CENTER_X = 600',
      'const CENTER_Y = 680',
      'Array.from({ length: 36 }',
      'Array.from({ length: 28 }',
      'Eight interactive vectors',
      'onPointerDown={handlePointerDown}',
      'onPointerMove={handlePointerMove}',
      'landing-expression-slice__tooltip',
      'Baseline value',
      'Live change',
      'Current'
    ]) expect(field).toContain(marker);
    expect(field).not.toContain('landing-expression-slice__horizon');
    expect(field).not.toContain('landing-expression-slice__grid');
    expect(field).not.toContain('Array.from({ length: 88 }');
    expect(field).not.toContain('sphere');
    expect(field).not.toContain('globe');
    expect(field).not.toContain('#8b5cff');
    expect(approvedStyles).toContain('.landing-expression-slice__horizon');
    expect(approvedStyles).toContain('display: none');
  });

  it('uses the approved narrative and v0 chat/workflow language', () => {
    for (const marker of [
      'See what keeps happening.',
      'Understand what happens between you.',
      'See the whole system.',
      'surface="personal-chat"',
      'surface="personal-reasoning"',
      'surface="relationship-chat"',
      'surface="relationship-reasoning"',
      'surface="system-map"',
      'surface="system-reasoning"'
    ]) expect(renderedStories).toContain(marker);
    for (const marker of [
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
      'Showing the whole system'
    ]) expect(stories).toContain(marker);
    expect(renderedStories).not.toContain('title="Ask about your life."');
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

  it('plays chat and workflow motion once, then settles', () => {
    expect(stories).toContain('useWorkflowProgress(panelRef, steps.length)');
    expect(stories).toContain('timers.push(window.setTimeout');
    expect(stories).toContain("data-motion-state={visibleIndex >= steps.length - 1 ? 'settled' : 'running'}");
    expect(stories).not.toContain('window.setInterval');
    expect(approvedStyles).toContain('v8-message-in');
    expect(approvedStyles).toContain(".landing-story[data-visible='true'] .landing-message");
    expect(approvedStyles).toContain('.landing-workflow > li.is-active');
  });

  it('gives iPhone a purpose-built opening field, then naturally stacks product stories', () => {
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
    expect(approvedStyles).toContain('border-radius: 999px');
    expect(main).toContain("dataset.sovereignLayoutRelease = 'approved-public-v8'");
    expect(main).toContain("dataset.sovereignProductStories = 'isolated-mobile-first-v2'");
    expect(main).toContain("dataset.sovereignMotionRelease = 'v0-motion-workflows-v8'");
  });

  it('keeps every active CSS layer structurally balanced', () => {
    for (const source of [fieldStyles, integrationStyles, storyStyles, approvedStyles]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });
});
