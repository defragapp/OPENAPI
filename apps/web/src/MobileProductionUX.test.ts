import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const viewportProbe = readFileSync(new URL('./PublicLandingViewportContract.ts', import.meta.url), 'utf8');
const viewportCss = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const fieldCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const integrationCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const approvedCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const landingRefinement = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const workspaceCss = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const workspaceMobileCss = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const mobileReleaseCss = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const productionReadinessCss = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const mobileUtilities = readFileSync(new URL('./WorkspaceMobileUtilities.tsx', import.meta.url), 'utf8');
const compositionCss = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const authCss = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');

describe('production mobile and responsive experience', () => {
  it('loads the integrated field, product stories, and terminal landing refinement in order', () => {
    expect(main).toContain("import './design-system.css';");
    expect(main).toContain("import './public.css';");
    expect(main).toContain("import './workspace.css';");
    expect(main).toContain("import './app-shell.css';");
    expect(main).toContain("import './passkey-auth.css';");
  });

  it('measures required mobile product surfaces while allowing redundant system reasoning to collapse', () => {
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).toContain('data-viewport-surface="hero"');
    for (const surface of ['expression-slice', 'demo-card', 'comparison']) {
      expect(viewportProbe).toContain(`'${surface}'`);
    }
    expect(viewportProbe).toContain('desktopRequiredSurfaces');
    expect(viewportProbe).toContain('narrowRequiredSurfaces');
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportCss).toContain('.sovereign-landing [data-viewport-surface]');
  });

  it('shortens mobile landing proof instead of creating a desktop wall on a phone', () => {
    expect(landingRefinement).toContain('@media (max-width: 760px)');
    expect(landingRefinement).toContain('grid-auto-flow: column !important');
    expect(landingRefinement).toContain('grid-auto-columns: minmax(252px, 82vw) !important');
    expect(landingRefinement).toContain('scroll-snap-type: inline mandatory !important');
    expect(landingRefinement).toContain('.landing-demo--system-context');
    expect(landingRefinement).toContain('display: none !important');
    expect(landingRefinement).toContain('.landing-expression-slice__tooltip {\n    display: none !important;');
    expect(landingRefinement).toContain('min-height: 372px !important');
  });

  it('keeps the same product identity but uses concise mobile hero language', () => {
    for (const marker of [
      'v0-wordmark--mobile',
      'v0-mobile-menu',
      'Sovereign.OS is a private personal AI for understanding yourself, your relationships, your decisions, and the systems around you.',
      'Start free · No card required · Review, correct, or reject any interpretation',
      '<MobileCapabilityRail />',
      'Explore yourself',
      'Understand your people',
      'See the whole system',
      'Keep what matters',
      'Build your Baseline'
    ]) expect(landing).toContain(marker);
    expect(landing).not.toContain('Build my Baseline');
    expect(landing).not.toContain('One private foundation. More useful answers across the questions that shape your life.');
    expect(landing).not.toContain('Build a private Baseline once.');
    expect(landing).toContain('<small>{question.scope}</small>');
    expect(landing).toContain('<strong>{question.text}</strong>');
    expect(stories).toContain('landing-stories__labels');
    expect(stories).toContain('demo-card');
  });

  it('keeps all six workspace surfaces reachable through one mobile menu sheet', () => {
    expect(workspace).toContain('className="mobile-menu-trigger"');
    expect(workspace).toContain('className="workspace-sheet"');
    expect(workspace).toContain('aria-label="Navigate"');
    expect(workspace).toContain('surfaces.map((item)');
    expect(workspace).toContain("{ name: 'You', label: 'You', description: 'Baseline, plan, permissions, and account' }");
    expect(workspace).not.toContain('mobile-bottom-nav');
  });

  it('uses one collapsed mobile control layer instead of simultaneous fixed overlays', () => {
    expect(authenticatedWorkspace).toContain('className="workspace-desktop-plan-status"');
    expect(authenticatedWorkspace).toContain('<WorkspaceMobileUtilities />');
    expect(mobileUtilities).toContain('createPortal');
    expect(mobileUtilities).toContain('<details className="workspace-mobile-utilities">');
    expect(mobileUtilities).toContain('Tools');
    expect(mobileUtilities).toContain('Expression Field');
    expect(mobileUtilities).toContain('System members');
    expect(mobileUtilities).toContain('Account & Library');
    expect(mobileReleaseCss).toContain('.workspace-desktop-plan-status');
    expect(mobileReleaseCss).toContain('display: none !important');
    expect(productionReadinessCss).toContain('.workspace-mobile-utilities > summary');
  });

  it('keeps the composer compact and Today/Explore readable on phones', () => {
    expect(mobileReleaseCss).toContain('.composer-context-line');
    expect(productionReadinessCss).toContain('grid-template-columns: minmax(0, 1fr) 44px');
    expect(productionReadinessCss).toContain('height: 44px !important');
    expect(productionReadinessCss).toContain('bottom: max(8px, env(safe-area-inset-bottom))');
    expect(productionReadinessCss).toContain('font-size: clamp(2rem, 8.8vw, 2.85rem)');
    expect(workspace).toContain('className="today-steady"');
    expect(workspace).toContain('surface-home explore-home');
  });

  it('protects notched edges and touch targets', () => {
    expect(workspaceCss).toContain('env(safe-area-inset-bottom)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-left)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-right)');
    expect(productionReadinessCss).toContain('env(safe-area-inset-left)');
    expect(productionReadinessCss).toContain('env(safe-area-inset-right)');
    expect(viewportCss).toContain('env(safe-area-inset-left)');
    expect(fieldCss).toContain('env(safe-area-inset-top)');
    expect(integrationCss).toContain('@media (max-width: 760px)');
    expect(workspaceMobileCss).toContain('min-height: 44px');
    expect(authCss).toContain('.auth-panel');
    expect(landingCss).toContain('min-width: 320px');
    expect(fieldCss).toContain('stroke-width: 34');
    expect(storyCss).toContain('min-height: 44px');
  });

  it('retains reduced-motion support and horizontal overflow protection', () => {
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(landingCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceMobileCss).toContain('overflow-x: clip');
    expect(productionReadinessCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(compositionCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(viewportCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(fieldCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(storyCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(landingRefinement).toContain('@media (prefers-reduced-motion: reduce)');
    expect(approvedCss).toContain('founder story on one quiet editorial rail');
  });
});
