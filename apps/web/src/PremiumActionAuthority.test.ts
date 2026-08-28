import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const workspaceCss = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');

describe('premium action authority', () => {
  it('loads editorial action authority as part of the single terminal inline authority', () => {
  });

  it('uses one acquisition vocabulary without duplicate hero/final CTAs', () => {
    expect(landing).toContain('>Sign in</a>');
    expect(landing).toContain('>Build your Baseline <ArrowIcon /></a>');
    expect(landing).toContain('<a href="/signup">Build your Baseline</a>');
    expect(landing).not.toContain('Build my Baseline');
    expect(landing).not.toContain('See a Sovereign answer');
    expect(landing).not.toContain('See how it works</span><ArrowIcon');
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
    expect(workspaceCss).toContain('.billing-switch button.active');
    expect(css).toContain('.intelligence-sidebar nav button');
  });

  it('keeps mobile capability navigation as editorial rows rather than cards', () => {
    expect(css).toContain('.sovereign-opening-capabilities > a');
    expect(css).toContain('border-top: 1px solid var(--sovereign-action-line) !important;');
    expect(css).toContain('.v0-mobile-menu__panel a');
    expect(css).toContain('border-bottom: 1px solid var(--sovereign-action-line) !important;');
  });
});
