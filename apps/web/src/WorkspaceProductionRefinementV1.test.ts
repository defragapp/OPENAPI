import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./workspace.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('authenticated workspace production refinement v1', () => {
  it('loads as part of the single terminal inline authority', () => {
  });

  it('uses the founder dark editorial direction instead of a decorative AI gradient', () => {
    expect(css).toContain('background: var(--workspace-page) !important;');
    expect(css).toContain('--workspace-page: #090a0b;');
  });

  it('makes the conversation the primary reading surface', () => {
    expect(css).toContain('.response-thread');
    expect(css).toContain('.direct-answer');
    expect(css).toContain('font-size: 1.08rem !important;');
    expect(css).toContain('.user-question');
    expect(css).toContain('max-width: min(72%, 650px) !important;');
  });

  it('uses a mature persistent composer with readable mobile input', () => {
    expect(css).toContain('.sovereign-composer');
    expect(css).toContain('border-radius: 24px !important;');
    expect(css).toContain('.composer-entry');
    expect(css).toContain('font-size: 16px !important;');
    expect(css).toContain('env(safe-area-inset-bottom)');
  });

  it('keeps relationship interaction visually distinct without turning the answer into nested cards', () => {
    expect(css).toContain('.relationship-answer .interaction-field');
    expect(css).toContain('box-shadow: inset 3px 0 0 rgba(245, 239, 230, 0.54) !important;');
    expect(css).toContain('.relationship-answer > article');
    expect(css).toContain('border-radius: 0 !important;');
  });

  it('compresses the layout for phones while preserving a full-width chat surface', () => {
    expect(css).toContain('@media (max-width: 700px)');
    expect(css).toContain('max-width: 88% !important;');
    expect(css).toContain('width: calc(100% - 16px) !important;');
    expect(css).toContain('grid-template-columns: 1fr !important;');
  });
});
