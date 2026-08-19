import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./premium-action-authority-v1.css', import.meta.url), 'utf8');
const finalPolish = readFileSync(new URL('./launch-polish-final-v1.css', import.meta.url), 'utf8');

describe('premium action authority', () => {
  it('loads editorial action authority before authenticated launch cohesion and final launch polish', () => {
    expect(main).toContain("import premiumActionAuthorityCss from './premium-action-authority-v1.css?inline'");
    expect(main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;'))
      .toBeGreaterThan(main.indexOf('style.textContent += `\\n${workspaceProductionRefinementCss}`;'));
    expect(main.indexOf('style.textContent += `\\n${authenticatedLaunchCohesionCss}`;'))
      .toBeGreaterThan(main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;'));
    expect(main.indexOf('style.textContent += `\\n${launchPolishFinalCss}`;'))
      .toBeGreaterThan(main.indexOf('style.textContent += `\\n${authenticatedLaunchCohesionCss}`;'));
  });

  it('uses one acquisition vocabulary with text-only public actions', () => {
    expect(landing).toContain('>Sign in</a>');
    expect(landing).toContain('>Get started</a>');
    expect(landing).toContain('<a href="/signup">Get started</a>');
    expect(landing).not.toContain('ArrowIcon');
    expect(landing).not.toContain('LockIcon');
    expect(landing).not.toContain('CapabilityIcon');
    expect(landing).not.toContain('Build my Baseline');
    expect(landing).not.toContain('See a Sovereign answer');
    expect(landing).not.toContain('sovereign-opening-actions');
    expect(landing).not.toContain('landing-control landing-control--primary');
  });

  it('removes visible pill and rectangular action chrome without removing semantics', () => {
    expect(css).toContain('button:not(.sheet-backdrop):not(.context-backdrop)');
    expect(css).toContain(':not(.primary-button):not(.passkey-button):not(.consent-choice)');
    expect(css).toContain('background: transparent !important;');
    expect(css).toContain('border-radius: 0 !important;');
    expect(css).toContain('box-shadow: none !important;');
    expect(css).toContain('min-height: 44px !important;');
    expect(css).toContain(':focus-visible');
    expect(css).toContain('.billing-switch button.active');
    expect(css).toContain('.intelligence-sidebar nav button');
    expect(finalPolish).toContain('.passkey-button');
    expect(finalPolish).toContain('.billing-toggle button');
    expect(finalPolish).toContain('.baseline-choice-row span');
  });

  it('keeps mobile capability navigation as editorial rows rather than cards', () => {
    expect(css).toContain('.sovereign-opening-capabilities > a');
    expect(css).toContain('border-top: 1px solid var(--sovereign-action-line) !important;');
    expect(css).toContain('.v0-mobile-menu__panel a');
    expect(css).toContain('border-bottom: 1px solid var(--sovereign-action-line) !important;');
    expect(finalPolish).toContain('.sovereign-opening-capabilities a');
  });
});