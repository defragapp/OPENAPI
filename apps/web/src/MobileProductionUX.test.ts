import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const landingCss = read('./public-landing.css');
const viewportProbe = read('./PublicLandingViewportContract.ts');
const workspaceCss = read('./workspace-chat.css');
const workspaceMobileCss = read('./workspace-mobile.css');
const authCss = read('./auth-onboarding.css');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');

const retiredLandingLayers = [
  'mobile-density-contract.css',
  'landing-v2.css',
  'experience-reconciliation.css',
  'public-landing-final.css'
] as const;

describe('production mobile and responsive experience', () => {
  it('keeps the public route isolated from retired override layers', () => {
    expect(main).toContain("import './public-landing.css'");
    expect(landing).toContain('className="sovereign-public"');
    for (const retiredLayer of retiredLandingLayers) expect(main).not.toContain(retiredLayer);
  });

  it('owns phone composition in the real landing component', () => {
    for (const value of ['data-viewport-surface="hero-content"','data-viewport-surface="baseline-artifact"','personal-chat','personal-workflow','relationship-chat','relationship-workflow','system-instrument','data-viewport-surface="consent"']) expect(landing).toContain(value);
    expect(viewportProbe).toContain("querySelector<HTMLElement>('.sovereign-public')");
    expect(viewportProbe).toContain('getBoundingClientRect()');
    expect(viewportProbe).toContain('doc.documentElement.scrollWidth');
  });

  it('uses 18px mobile gutters, full-width workflows, and no desktop scaling', () => {
    expect(landingCss).toContain('.sovereign-public .public-story,');
    expect(landingCss).toContain('padding:86px 18px');
    expect(landingCss).toContain('.sovereign-public .story-grid{grid-template-columns:1fr}');
    expect(landingCss).toContain('.sovereign-public .product-window{min-height:0}');
    expect(landingCss).toContain('transform:none');
    expect(landingCss).toContain('overflow:clip');
  });

  it('turns the system map into a deliberate two-column phone instrument', () => {
    expect(landingCss).toContain('grid-template-columns:1fr 1fr');
    expect(landingCss).toContain('.sovereign-public .system-center');
    expect(landingCss).toContain('grid-column:1 / -1');
    expect(landingCss).toContain('.sovereign-public .system-links{display:none}');
  });

  it('keeps authenticated iOS controls thumb reachable and safe-area aware', () => {
    expect(workspace).toContain('className="mobile-bottom-nav"');
    expect(workspaceCss).toContain('grid-template-columns: repeat(5, 1fr)');
    expect(workspaceCss).toContain('bottom: calc(66px + env(safe-area-inset-bottom))');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-left)');
    expect(workspaceMobileCss).toContain('env(safe-area-inset-right)');
    expect(workspaceMobileCss).toContain('min-height: 44px');
    expect(authCss).toContain('.auth-panel');
  });

  it('retains reduced motion, focus visibility, and iOS input safeguards', () => {
    expect(landingCss).toContain(':focus-visible');
    expect(landingCss).toContain('@media (prefers-reduced-motion:reduce)');
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceMobileCss).toContain('overflow-x: clip');
    expect(workspaceCss).toContain('font-size: 1rem');
  });
});
