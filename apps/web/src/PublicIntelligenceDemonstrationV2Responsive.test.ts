import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./public-intelligence-demonstration-v2.css', import.meta.url), 'utf8');

describe('public demo v2 responsive contract', () => {
  it('stacks answer and visual on tablet without hiding the visual', () => {
    expect(styles).toContain('@media (max-width: 900px)');
    expect(styles).toContain('.landing-demo-core');
    expect(styles).toContain('grid-template-columns: 1fr !important');
    expect(styles).not.toContain('.landing-demo-visual {\n    display: none');
  });

  it('keeps relationship and system intelligence legible on phones', () => {
    expect(styles).toContain('@media (max-width: 760px)');
    expect(styles).toContain('.relationship-field__people');
    expect(styles).toContain('.relationship-field__center ol');
    expect(styles).toContain('.landing-understanding--system');
    expect(styles).toContain('min-height: 470px !important');
  });
});