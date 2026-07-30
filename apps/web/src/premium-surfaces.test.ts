import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./premium-surfaces.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('premium invitation and Sovereign output surfaces', () => {
  it('loads the final composition layer after the shared interface system', () => {
    expect(main).toContain("import './interface-composition.css';\nimport './premium-surfaces.css';");
  });

  it('gives invitation consent a dedicated editorial hierarchy', () => {
    expect(css).toContain('.account-shell > .auth-panel');
    expect(css).toContain('grid-template-columns: minmax(0, .82fr) minmax(380px, 1.18fr)');
    expect(css).toContain('counter-reset: consent-scope');
    expect(css).toContain('No raw birth input');
  });

  it('renders AI output as one readable answer surface', () => {
    expect(css).toContain('.sovereign-answer');
    expect(css).toContain('.answer-sections');
    expect(css).toContain('.alignment-view');
    expect(css).toContain('.relationship-answer');
    expect(css).toContain('.system-answer');
    expect(css).toContain('.answer-evidence-row');
  });

  it('protects mobile, reduced-motion, forced-color, and private print behavior', () => {
    expect(css).toContain('overflow-x: clip');
    expect(css).toContain('@media (max-width: 680px)');
    expect(css).toContain('env(safe-area-inset-bottom)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (forced-colors: active)');
    expect(css).toContain('@media print');
    expect(css).toContain('.response-thread > *:not(:last-child)');
  });
});
