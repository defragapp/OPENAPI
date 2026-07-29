import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const workspaceCss = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const landingCss = readFileSync(new URL('./public-landing.css', import.meta.url), 'utf8');
const authCss = readFileSync(new URL('./auth-onboarding.css', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');

describe('production mobile and responsive experience', () => {
  it('loads consolidated surface-owned styles without override layers', () => {
    expect(main).toContain("import './public-landing.css'");
    expect(main).toContain("import './workspace-chat.css'");
    expect(main).toContain("import './auth-onboarding.css'");
    expect(main).not.toMatch(/final|refinement|polish.*css|landing-v2/i);
  });

  it('keeps five primary surfaces thumb reachable and You in the menu sheet', () => {
    expect(workspace).toContain('className="mobile-bottom-nav"');
    expect(workspace).toContain("surfaces.filter((item) => item.name !== 'You')");
    expect(workspace).toContain('You · Baseline, plan, permissions, and account');
    expect(workspaceCss).toContain('grid-template-columns: repeat(5, 1fr)');
    expect(workspaceCss).toContain('min-height: 56px');
  });

  it('protects the composer, sheets, and controls with safe areas', () => {
    expect(workspaceCss).toContain('bottom: calc(66px + env(safe-area-inset-bottom))');
    expect(workspaceCss).toContain('padding: calc(7px + env(safe-area-inset-top))');
    expect(workspaceCss).toContain('padding: 4px 5px env(safe-area-inset-bottom)');
    expect(workspaceCss).toContain('max-height: 86dvh');
  });

  it('prevents iOS input zoom and horizontal page overflow', () => {
    expect(workspaceCss).toContain('font-size: 1rem');
    expect(authCss).toContain('.auth-panel');
    expect(landingCss).toContain('min-width: 320px');
    expect(landingCss).toContain('@media (max-width: 440px)');
  });

  it('retains visible focus and reduced-motion support', () => {
    expect(workspaceCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(landingCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(workspaceCss).toContain('min-height: 44px');
  });
});
