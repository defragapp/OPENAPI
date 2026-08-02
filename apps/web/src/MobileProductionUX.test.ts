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
const workspaceCss = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const workspaceMobileCss = readFileSync(new URL('./workspace-mobile.css', import.meta.url), 'utf8');
const compositionCss = readFileSync(new URL('./interface-composition.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const authCss = readFileSync(new URL('./auth-onboarding.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('production mobile and responsive experience', () => {
  it('loads the integrated field and restored product story layers in order', () => {
    expect(main).toContain("import './public-landing.css'");
    expect(main).toContain("import './workspace-chat.css'");
    expect(main).toContain("import './workspace-mobile.css'");
    expect(main).toContain("import './auth-onboarding.css'");
    expect(main).toContain("import './responsive-viewport-contract.css'");
    expect(main).toContain("import './landing-expression-field-v3.css'");
    expect(main).toContain("import './landing-expression-field-integration.css'");
    expect(main).toContain("import './v0-restored-product-stories.css'");
    expect(main.indexOf("import './v0-restored-product-stories.css'"))
      .toBeGreaterThan(main.indexOf("import './landing-expression-field-integration.css'"));
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
  });

  it('keeps five primary workspace surfaces thumb reachable and You in the menu sheet', () => {
    expect(workspace).toContain('className="mobile-bottom-nav"');
    expect(workspace).toContain("surfaces.filter((item) => item.name !== 'You')");
    expect(workspace).toContain('You · Baseline, plan, permissions, and account');
    expect(workspaceCss).toContain('grid-template-columns: repeat(5, 1fr)');
    expect(workspaceCss).toContain('min-height: 56px');
  });

  it('protects public and workspace controls around notched edges', () => {
    expect(workspaceCss).toContain('env(safe-area-inset-bottom)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-left)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-right)');
    expect(viewportCss).toContain('env(safe-area-inset-left)');
    expect(viewportCss).toContain('env(safe-area-inset-right)');
    expect(fieldCss).toContain('env(safe-area-inset-top)');
    expect(fieldCss).toContain('env(safe-area-inset-bottom)');
    expect(integrationCss).toContain('@media (max-width: 760px)');
  });

  it('keeps mobile interactions usable and avoids pill-shaped controls', () => {
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

  it('retains reduced-motion support and horizontal overflow protection', () => {
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(landingCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceMobileCss).toContain('overflow-x: clip');
    expect(compositionCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(viewportCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(fieldCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(storyCss).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
