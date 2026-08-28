import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('./public.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('live landing refinement v4', () => {
  it('loads after v3 as the terminal public landing presentation layer', () => {
    expect(css).toContain('landing-live-refinement-v3.css');
    expect(css).toContain('landing-live-refinement-v4.css');
  });

  it('makes the real-life question a primary product-recognition moment', () => {
    expect(css).toContain('font-size: clamp(2.05rem, 2.8vw, 2.8rem) !important;');
    expect(css).toContain('height: 164px !important;');
  });

  it('makes workflow progression visibly stateful', () => {
    expect(css).toContain('sovereign-workflow-fill');
    expect(css).toContain('.landing-workflow > li.is-active');
    expect(css).toContain('box-shadow: inset 3px 0 0 rgba(255, 250, 243, 0.76)');
  });

  it('treats Between you as a distinct shared analytical layer', () => {
    expect(css).toContain('.landing-context-view--relationship .landing-context-distinction');
    expect(css).toContain('box-shadow: inset 3px 0 0 rgba(241, 233, 222, 0.72)');
  });

  it('makes family selection visibly alter the reasoning surface', () => {
    expect(css).toContain("button[aria-pressed='true']");
    expect(css).toContain('.landing-system-map path.is-active');
    expect(css).toContain('min-height: 590px !important;');
    expect(css).toContain(':has(.landing-system-map__nodes button[aria-pressed=\'true\'])');
  });

  it('strengthens endpoint attachment without exposing retired user-facing terminology', () => {
    expect(css).toContain('.landing-expression-slice__tooltip-connector');
    expect(css).toContain('stroke-width: 1.3px !important;');
    expect(css.toLowerCase()).not.toContain('emotional vector');
  });

  it('preserves deliberate mobile compression and reduced-motion behavior', () => {
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('padding: 44px 0 50px !important;');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
