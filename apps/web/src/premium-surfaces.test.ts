import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const appShellCss = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');
const hardening = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const exportRuntime = readFileSync(new URL('./PrivateAnswerExportRuntime.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('premium invitation and Sovereign output surfaces', () => {
  it('loads the final composition and release-hardening layers in deterministic order', () => {
    expect(main).toContain("import './workspace.css';");
    expect(main).toContain("import { installPrivateAnswerExportRuntime } from './PrivateAnswerExportRuntime';");
    expect(main).toContain('installPrivateAnswerExportRuntime();');
  });

  it('gives invitation consent a dedicated editorial hierarchy', () => {
    expect(appShellCss).toContain('.account-shell > .auth-panel');
    expect(appShellCss).toContain('.account-layout');
    expect(appShellCss).toContain('.usage-card');
    expect(appShellCss).toContain('.scope-list');
    expect(appShellCss).toContain('[data-decision="granted"]');
    expect(appShellCss).toContain('[data-decision="denied"]');
    expect(hardening).toContain('.invitation-state');
  });

  it('keeps consent choices independent, neutral, and accessible', () => {
    expect(app).toContain('data-invitation-state={invitationState}');
    expect(app).toContain('aria-pressed={decision === \'granted\'}');
    expect(app).toContain('aria-pressed={decision === \'denied\'}');
    expect(app).toContain('Every requested use needs its own decision');
    expect(app).toContain('Nothing changed.');
    expect(appShellCss).toContain('.scope-list button:first-child');
    expect(appShellCss).toContain('background: transparent');
    expect(appShellCss).toContain('min-height: 44px');
  });

  it('renders AI output as one readable answer surface', () => {
    expect(css).toContain('.sovereign-answer');
    expect(css).toContain('.answer-sections');
    expect(css).toContain('.alignment-view');
    expect(css).toContain('.relationship-answer');
    expect(css).toContain('.system-answer');
    expect(css).toContain('.answer-evidence-row');
  });

  it('adds a private, local print and PDF action without a sharing endpoint', () => {
    expect(exportRuntime).toContain("button.textContent = 'Print or save PDF'");
    expect(exportRuntime).toContain('window.print()');
    expect(exportRuntime).toContain("document.querySelectorAll<HTMLElement>('.sovereign-answer')");
    expect(exportRuntime).not.toContain('fetch(');
    expect(hardening).toContain('.answer-export-action');
    expect(hardening).toContain('break-inside: avoid');
  });

  it('protects mobile, reduced-motion, forced-color, and private print behavior', () => {
    expect(css).toContain('overflow-x: clip');
    expect(css).toContain('@media (max-width: 680px)');
    expect(css).toContain('env(safe-area-inset-bottom)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (forced-colors: active)');
    expect(css).toContain('@media print');
    expect(css).toContain('.response-thread > *:not(:last-child)');
    expect(hardening).toContain('@media print');
    expect(hardening).toContain('page-break-inside: avoid');
  });
});
