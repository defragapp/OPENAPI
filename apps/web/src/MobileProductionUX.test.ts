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
  it('loads the integrated field, product story, and final responsive authority in order', () => {
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
    expect(main.indexOf("import './v0-restored-product-stories.css'"))
      .toBeGreaterThan(main.indexOf("import './landing-expression-field-integration.css'"));
    expect(main).toContain('${workspaceMobileReleaseCss}\\n${productionReadinessVisualCss}');
  });

  it('measures the field and every restored product surface in the rendered DOM', () => {
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).toContain('data-viewport-surface="hero"');
    for (const surface of ['expression-slice', 'personal-chat', 'personal-reasoning', 'relationship-chat', 'relationship-reasoning', 'system-map', 'system-reasoning', 'comparison']) {
      expect(viewportProbe).toContain(`'${surface}'`);
    }
    expect(stories).toContain('data-viewport-stage="personal"');
    expect(stories).toContain('data-viewport-stage="relationship"');
    expect(stories).toContain('data-viewport-stage="system"');
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportProbe).toContain('node.offsetWidth');
    expect(viewportProbe).toContain('doc.documentElement.scrollWidth');
    expect(viewportCss).toContain('.sovereign-landing [data-viewport-surface]');
  });

  it('organizes public, account, onboarding, and workspace surfaces with one hierarchy', () => {
    expect(storyCss).toContain('.v0-story-heading');
    expect(storyCss).toContain('.v0-workflow-panel');
    expect(compositionCss).toContain('.account-layout');
    expect(compositionCss).toContain('.plan-choice');
    expect(compositionCss).toContain('.surface-heading');
    expect(compositionCss).toContain('.answer-sections');
    expect(productionReadinessCss).toContain('.public-secondary-page .policy-hero h1');
    expect(productionReadinessCss).toContain('.account-shell .account-intro h1');
    expect(productionReadinessCss).toContain('.sovereign-app-runtime .surface-heading h1');
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
    expect(mobileUtilities).toContain("'.intelligence-context .context-scroll'");
    expect(mobileUtilities).toContain('<details className="workspace-mobile-utilities">');
    expect(mobileUtilities).toContain('Workspace tools');
    expect(mobileUtilities).toContain('workspace-mobile-utilities-content');
    expect(mobileUtilities).toContain('<VerifiedPlanStatus expanded />');
    expect(mobileUtilities).toContain('Expression Field');
    expect(mobileUtilities).toContain('System members');
    expect(mobileUtilities).toContain('Account & Library');
    expect(mobileReleaseCss).toContain('.workspace-desktop-plan-status');
    expect(mobileReleaseCss).toContain('.sovereign-app-runtime > .expression-field-launcher');
    expect(mobileReleaseCss).toContain('.sovereign-app-runtime .system-membership-trigger');
    expect(mobileReleaseCss).toContain('display: none !important');
    expect(mobileReleaseCss).toContain('visibility: hidden !important');
    expect(mobileReleaseCss).toContain('pointer-events: none !important');
    expect(mobileReleaseCss).toContain('.intelligence-workspace.context-open .intelligence-context');
    expect(productionReadinessCss).toContain('.workspace-mobile-utilities > summary');
    expect(productionReadinessCss).toContain('.workspace-mobile-utilities[open] > summary::after');
  });

  it('keeps the composer compact and reserves the complete fixed-control footprint', () => {
    expect(mobileReleaseCss).toContain('.composer-context-line');
    expect(productionReadinessCss).toContain('grid-template-columns: minmax(0, 1fr) 44px');
    expect(productionReadinessCss).toContain('height: 44px !important');
    expect(productionReadinessCss).toContain('bottom: max(8px, env(safe-area-inset-bottom))');
    expect(productionReadinessCss).toContain('calc(178px + env(safe-area-inset-bottom))');
  });

  it('keeps mobile Today and Explore content readable without oversized headings or clipping', () => {
    expect(mobileReleaseCss).toContain('.today-facet-view > header');
    expect(mobileReleaseCss).toContain('min-height: 0 !important');
    expect(productionReadinessCss).toContain('font-size: clamp(2rem, 8.8vw, 2.85rem)');
    expect(productionReadinessCss).toContain('font-size: clamp(1.9rem, 8.6vw, 2.55rem)');
    expect(productionReadinessCss).not.toContain('font-size: clamp(2.45rem, 10.4vw, 3.55rem)');
    expect(productionReadinessCss).not.toContain('font-size: clamp(3.15rem, 15.2vw, 4.55rem)');
    expect(workspace).toContain('className="today-steady"');
    expect(workspace).toContain('className="today-current"');
    expect(workspace).toContain('surface-home explore-home');
    expect(workspace).toContain('composerExamples');
    expect(mobileReleaseCss).not.toContain('.explore-mode-list');
  });

  it('protects public and workspace controls around notched edges', () => {
    expect(workspaceCss).toContain('env(safe-area-inset-bottom)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-left)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-right)');
    expect(productionReadinessCss).toContain('env(safe-area-inset-left)');
    expect(productionReadinessCss).toContain('env(safe-area-inset-right)');
    expect(viewportCss).toContain('env(safe-area-inset-left)');
    expect(viewportCss).toContain('env(safe-area-inset-right)');
    expect(fieldCss).toContain('env(safe-area-inset-top)');
    expect(fieldCss).toContain('env(safe-area-inset-bottom)');
    expect(integrationCss).toContain('@media (max-width: 760px)');
  });

  it('keeps mobile interactions usable and avoids pill-shaped primary controls', () => {
    expect(workspaceMobileCss).toContain('min-height: 44px');
    expect(workspaceCss).toContain('font-size: 1rem');
    expect(authCss).toContain('.auth-panel');
    expect(landingCss).toContain('min-width: 320px');
    expect(fieldCss).toContain('stroke-width: 34');
    expect(fieldCss).toContain('touch-action: none');
    expect(storyCss).toContain('min-height: 44px');
    expect(storyCss).toContain('border-radius: 4px');
    expect(storyCss).toContain('@media (max-width: 390px)');
  });

  it('renders the screenshot-defined mobile opening without changing the desktop narrative', () => {
    for (const marker of [
      'v0-wordmark--mobile',
      'v0-mobile-menu',
      'See the capacity beneath a pattern, how it may be expressing, what happens between people, and what could change.',
      'Start free · No card required',
      '<MobileCapabilityRail />',
      'Understand yourself',
      'Understand relationships',
      'Understand systems',
      'Your library'
    ]) expect(landing).toContain(marker);
    for (const marker of [
      '.v0-wordmark--mobile',
      '.v0-mobile-menu[open] > .v0-mobile-menu__panel',
      '.sovereign-opening-copy--mobile',
      '.sovereign-opening-capabilities',
      '.landing-expression-slice__ambient--mobile',
      'grid-template-columns: repeat(4, minmax(0, 1fr))'
    ]) expect(approvedCss).toContain(marker);
    expect(productionReadinessCss).toContain('min-height: max(660px');
    expect(productionReadinessCss).toContain('width: min(660px, 165vw)');
    expect(productionReadinessCss).not.toContain('220vw');
    expect(landing).toContain('Sovereign begins with the capacity beneath a pattern. It shows how that capacity may be expressing, what happens between people, and what may be keeping the pattern in place—so you can see what could change.');
    expect(stories).toContain('id="relationship"');
    expect(stories).toContain('id="system"');
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
  });
});
