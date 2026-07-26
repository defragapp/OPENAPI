import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

describe('unified authenticated visual system', () => {
  it('uses one owned app stylesheet instead of a chain of legacy overrides', () => {
    expect(index).not.toContain('/premium-ui.css');
    expect(styles).toContain('.app-shell');
    expect(styles).toContain('.account-shell');
    expect(styles).toContain('.policy-shell');
  });

  it('aligns the signed-in product with the public design system', () => {
    for (const selector of [
      '.side-rail',
      '.hero-card',
      '.surface-card',
      '.state-card',
      '.composer',
      '.tabbar'
    ]) expect(styles).toContain(selector);
    expect(styles).toContain('--clay:');
    expect(styles).toContain('--paper:');
  });

  it('keeps iPhone controls readable and safe-area aware', () => {
    expect(styles).toContain('safe-area-inset-top');
    expect(styles).toContain('safe-area-inset-bottom');
    expect(styles).toContain('min-height: 48px');
    expect(styles).toContain('@media (max-width: 680px)');
    expect(styles).toContain('backdrop-filter');
  });
});
