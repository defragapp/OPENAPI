import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('live landing refinement v3', () => {
  it('loads after the prior landing refinement authority', () => {
    expect(css).toContain('width: min(1360px, calc(100% - 52px)) !important;');
  });

  it('gives desktop product demonstrations more visual authority', () => {
    expect(css).toContain('width: min(1360px, calc(100% - 52px)) !important;');
    expect(css).toContain('min-height: 660px !important;');
    expect(css).toContain('font-size: 1rem !important;');
  });

  it('presents the family system as one coherent intelligence surface', () => {
    expect(css).toContain('grid-template-columns: 1fr !important;');
    expect(css).toContain('min-height: 820px !important;');
    expect(css).toContain('landing-context-view--system');
    expect(css).toContain('border-right: 1px solid rgba(241, 233, 222, 0.09) !important;');
  });

  it('prevents desktop comparison words from breaking mid-word', () => {
    expect(css).toContain('overflow-wrap: normal !important;');
    expect(css).toContain('word-break: normal !important;');
    expect(css).toContain('hyphens: none !important;');
  });

  it('keeps the selected line label visually attached and preserves mobile compression', () => {
    expect(css).toContain('stroke: rgba(241, 233, 222, 0.72) !important;');
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('display: none !important;');
    expect(css).toContain('padding: 44px 0 50px !important;');
  });
});
