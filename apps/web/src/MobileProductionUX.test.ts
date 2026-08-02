import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const viewportProbe = readFileSync(new URL('./PublicLandingViewportContract.ts', import.meta.url), 'utf8');
const viewportCss = readFileSync(new URL('./responsive-viewport-contract.css', import.meta.url), 'utf8');
const publicReleaseCss = readFileSync(new URL('./v0-single-example-release.css', import.meta.url), 'utf8');
const workspaceCss = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const workspaceMobileCss = readFileSync(new URL('./workspace-mobile.css', import.meta.url), 'utf8');
const compositionCss = readFileSync(new URL('./interface-composition.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const authCss = readFileSync(new URL('./auth-onboarding.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('production mobile and responsive experience', () => {
  it('loads route-owned mobile hardening without retired override layers', () => {
    expect(main).toContain("import './public-landing.css'");
    expect(main).toContain("import './workspace-chat.css'");
    expect(main).toContain("import './workspace-mobile.css'");
    expect(main).toContain("import './auth-onboarding.css'");
    expect(main).toContain("import './interface-composition.css'");
    expect(main).toContain("import './responsive-viewport-contract.css'");
    expect(main).toContain("import './v0-single-example-release.css'");
    expect(main).not.toContain('v0-product-demo-polish.css');
    expect(main).not.toContain('v0-ios-public-release.css');
    expect(main).not.toContain('mobile-density-contract.css');
    const localCssImports = [...main.matchAll(/import ['"]\.\/([^'"]+\.css)['"]/g)].map((match) => match[1]);
    for (const retired of ['experience-reconciliation.css', 'sovereign-experience-v3.css', 'sovereign-experience-v3-fixes.css', 'landing-v2.css']) {
      expect(localCssImports).not.toContain(retired);
    }
  });

  it('measures the single public example and actual phone overflow in the rendered DOM', () => {
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v2"');
    expect(landing).toContain('data-viewport-surface="hero"');
    expect(landing).toContain('data-viewport-surface="capability-summary"');
    expect(viewportProbe).toContain("'expression-slice'");
    expect(viewportProbe).toContain("'capability-summary'");
    expect(viewportProbe).toContain('Historical source-verification markers only');
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportProbe).toContain('node.offsetWidth');
    expect(viewportProbe).toContain('doc.documentElement.scrollWidth');
    expect(viewportProbe).toContain('comparisonStacked');
    expect(viewportCss).toContain('.sovereign-landing [data-viewport-surface]');
  });

  it('organizes public, account, onboarding, and workspace surfaces with one hierarchy', () => {
    expect(publicReleaseCss).toContain('.v0-capability-summary__heading');
    expect(compositionCss).toContain('.account-layout');
    expect(compositionCss).toContain('.plan-choice');
    expect(compositionCss).toContain('.surface-heading');
    expect(compositionCss).toContain('.answer-sections');
  });

  it('keeps five primary workspace surfaces thumb reachable and You in the menu sheet', () => {
    expect(workspace).toContain('className="mobile-bottom-nav"');
    expect(workspace).toContain("surfaces.filter((item) => item.name !== 'You')");
    expect(workspace).toContain('You · Baseline, plan, permissions, and account');
    expect(workspaceCss).toContain('grid-template-columns: repeat(5, 1fr)');
    expect(workspaceCss).toContain('min-height: 56px');
  });

  it('protects public and workspace controls around notched edges', () => {
    expect(workspaceCss).toContain('bottom: calc(66px + env(safe-area-inset-bottom))');
    expect(workspaceCss).toContain('padding: calc(7px + env(safe-area-inset-top))');
    expect(workspaceCss).toContain('padding: 4px 5px env(safe-area-inset-bottom)');
    expect(workspaceCss).toContain('max-height: 86dvh');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-left)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-right)');
    expect(workspaceMobileCss).toContain('max-height: 86svh');
    expect(viewportCss).toContain('env(safe-area-inset-left)');
    expect(viewportCss).toContain('env(safe-area-inset-right)');
    expect(publicReleaseCss).toContain('env(safe-area-inset-top)');
    expect(publicReleaseCss).toContain('env(safe-area-inset-bottom)');
    expect(publicReleaseCss).toContain('env(safe-area-inset-left)');
    expect(publicReleaseCss).toContain('env(safe-area-inset-right)');
  });

  it('keeps every mobile interaction at least 44px and prevents iOS text resizing', () => {
    expect(workspaceMobileCss).toContain('.fit-controls button');
    expect(workspaceMobileCss).toContain('.composer-context-line button');
    expect(workspaceMobileCss).toContain('min-height: 44px');
    expect(workspaceCss).toContain('font-size: 1rem');
    expect(authCss).toContain('.auth-panel');
    expect(landingCss).toContain('min-width: 320px');
    expect(landingCss).toContain('@media (max-width: 440px)');
    expect(publicReleaseCss).toContain('min-height: 44px');
    expect(publicReleaseCss).toContain('stroke-width: 30');
    expect(publicReleaseCss).toContain('-webkit-text-size-adjust: 100%');
    expect(publicReleaseCss).toContain('touch-action: manipulation');
  });

  it('retains visible focus, reduced-motion support, and horizontal overflow protection', () => {
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(landingCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceMobileCss).toContain('overflow-x: clip');
    expect(compositionCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(viewportCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(publicReleaseCss).toContain('overflow-x: clip');
    expect(publicReleaseCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
