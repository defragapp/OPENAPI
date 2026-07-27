import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../public/ux-audit-runtime.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/ux-audit-polish.css', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const baselineInput = readFileSync(new URL('./BaselineInputRuntime.ts', import.meta.url), 'utf8');
const productLanguage = readFileSync(new URL('./ProductLanguageRuntime.ts', import.meta.url), 'utf8');

describe('first-run accessibility and dashboard UX pass', () => {
  it('loads syntactically valid progressive-enhancement assets', () => {
    expect(index).toContain('/ux-audit-polish.css?v=20260726-first-run-r1');
    expect(index).toContain('/ux-audit-runtime.js?v=20260726-first-run-r1');
    expect(() => new Function(runtime)).not.toThrow();
  });

  it('makes the main visual objects actionable and guides empty states', () => {
    expect(runtime).toContain('enhanceExploreCards');
    expect(runtime).toContain('enhancePeopleCanvas');
    expect(runtime).toContain('enhanceSystemsCanvas');
    expect(runtime).toContain('enhanceLibraryEmptyState');
    expect(runtime).toContain('Understand your design before asking a question.');
    expect(runtime).toContain("button.textContent = 'Explore something'");
    expect(runtime).toContain("element.setAttribute('tabindex', '0')");
  });

  it('raises contrast and gives fields and cards explicit interaction states', () => {
    expect(css).toContain('--muted: #d1c9bf');
    expect(css).toContain('input:focus');
    expect(css).toContain('.mode-object:hover');
    expect(css).toContain('.ux-interactive-object:focus-visible');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('uses a searchable timezone input instead of a long native select', () => {
    expect(baselineInput).toContain("input.type = 'search'");
    expect(baselineInput).toContain("document.createElement('datalist')");
    expect(baselineInput).toContain("input.setAttribute('list', listId)");
    expect(baselineInput).not.toContain("const select = document.createElement('select')");
  });

  it('keeps first-run and Library copy short and explicit', () => {
    expect(productLanguage).toContain('Start with your design. Add today’s timing. Keep only what fits your actual life.');
    expect(productLanguage).toContain('Your Library is ready.');
    expect(productLanguage).toContain('Only the understandings you deliberately save appear here.');
  });

  it('advances the service-worker cache for the new assets', () => {
    expect(serviceWorker).toContain("sovereign-public-v7");
    expect(serviceWorker).toContain("'/ux-audit-polish.css'");
    expect(serviceWorker).toContain("'/ux-audit-runtime.js'");
  });
});
