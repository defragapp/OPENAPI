import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const viewportProbe = readFileSync(new URL('./PublicLandingViewportContract.ts', import.meta.url), 'utf8');
const viewportCss = readFileSync(new URL('./responsive-viewport-contract.css', import.meta.url), 'utf8');
const fieldCss = readFileSync(new URL('./landing-expression-field-v3.css', import.meta.url), 'utf8');
const integrationCss = readFileSync(new URL('./landing-expression-field-integration.css', import.meta.url), 'utf8');
const storyCss = readFileSync(new URL('./v0-restored-product-stories.css', import.meta.url), 'utf8');
const approvedCss = readFileSync(new URL('./public-landing-approved-v8.css', import.meta.url), 'utf8');
const landingRefinement = readFileSync(new URL('./landing-refinement-v2.css', import.meta.url), 'utf8');
const workspaceCss = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const workspaceMobileCss = readFileSync(new URL('./workspace-mobile.css', import.meta.url), 'utf8');
const mobileReleaseCss = readFileSync(new URL('./workspace-mobile-release-v3.css', import.meta.url), 'utf8');
const productionReadinessCss = readFileSync(new URL('./production-readiness-visual-v1.css', import.meta.url), 'utf8');
const mobileUtilities = readFileSync(new URL('./WorkspaceMobileUtilities.tsx', import.meta.url), 'utf8');
const compositionCss = readFileSync(new URL('./interface-composition.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const authCss = readFileSync(new URL('./auth-onboarding.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');

describe('production mobile and responsive experience', () => {
  it('loads the integrated field, product stories, and terminal landing refinement in order', () => {
    expect(main).toContain("import './public-landing.css'");
    expect(main).toContain("import './workspace-chat.css'");
    expect(main).toContain("import './workspace-mobile.css'");
    expect(main).toContain("import './auth-onboarding.css'");
    expect(main).toContain("import './responsive-viewport-contract.css'");
    expect(main).toContain("import './landing-expression-field-v3.css'");
    expect(main).toContain("import './landing-expression-field-integration.css'");
    expect(main).toContain("import './v0-restored-product-stories.css'");
    expect(main).toContain("import workspaceMobileReleaseCss from './workspace-mobile-release-v3.css?inline'");
    expect(main).toContain("import productionReadinessVisualCss from './production-readiness-visual-v1.css?inline'");
    expect(main).toContain("import landingRefinementV2Css from './landing-refinement-v2.css?inline'");
    expect(main.indexOf('style.textContent += `\\n${landingRefinementV2Css}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;'));
  });

  it('measures required mobile product surfaces while allowing redundant system reasoning to collapse', () => {
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).toContain('data-viewport-surface="hero"');
    for (const surface of ['expression-slice', 'personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'comparison']) {
      expect(viewportProbe).toContain(`'${surface}'`);
    }
    expect(viewportProbe).toContain('desktopRequiredSurfaces');
    expect(viewportProbe).toContain('narrowRequiredSurfaces');
    expect(viewportProbe).toContain("'system-reasoning'");
    expect(stories).toContain('data-viewport-stage="personal"');
    expect(stories).toContain('data-viewport-stage="relationship"');
    expect(stories).toContain('data-viewport-stage="system"');
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
      'Build a private Baseline once. Sovereign uses the parts that matter to understand patterns, decisions, relationships, and systems—without making you explain yourself from zero every time.',
      'Build your private Baseline once. Use it across the questions that matter next.',
      'Start free · No card required',
      '<MobileCapabilityRail />',
      'Understand yourself',
      'Understand relationships',
      'Understand systems',
      'Your library',
      'Get started'
    ]) expect(landing).toContain(marker);
    expect(landing).not.toContain('capacity beneath');
    expect(landing).not.toContain('Build my Baseline');
    expect(landing).toContain('One private foundation. More useful answers across the questions that shape your life.');
    expect(landing).toContain('<small>{question.scope}</small>');
    expect(landing).toContain('<strong>{question.text}</strong>');
    expect(stories).toContain('id="relationship"');
    expect(stories).toContain('id="system"');
  });

  it('keeps all six workspace surfaces reachable through one mobile menu sheet', () => {
    expect(workspace).toContain('className="mobile-menu-trigger"');
    expect(workspace).toContain('className="workspace-sheet"');
    expect(workspace).toContain('aria-label="Workspace destinations"');
    expect(workspace).toContain('surfaces.map((item)');
    expect(workspace).toContain("{ name: 'You', label: 'You', description: 'Baseline, plan, permissions, and account' }");
    expect(workspace).not.toContain('mobile-bottom-nav');
  });

  it('uses one collapsed mobile control layer instead of simultaneous fixed overlays', () => {
    expect(authenticatedWorkspace).toContain('className="workspace-desktop-plan-status"');
    expect(authenticatedWorkspace).toContain('<WorkspaceMobileUtilities />');
    expect(mobileUtilities).toContain('createPortal');
    expect(mobileUtilities).toContain('<details className="workspace-mobile-utilities">');
    expect(mobileUtilities).toContain('Workspace tools');
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
