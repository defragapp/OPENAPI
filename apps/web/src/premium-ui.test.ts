import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const premium = readFileSync(new URL('../public/premium-ui.css', import.meta.url), 'utf8');

describe('premium authenticated visual system', () => {
  it('loads after the base app styles without changing routes', () => {
    expect(index).toContain('/premium-ui.css');
    expect(premium).toContain('.app-shell');
    expect(premium).toContain('.account-shell');
    expect(premium).toContain('.policy-shell');
  });

  it('aligns the signed-in product with the public design system', () => {
    for (const selector of [
      '.side-rail',
      '.hero-card',
      '.surface-card',
      '.state-card',
      '.composer',
      '.tabbar'
    ]) expect(premium).toContain(selector);
    expect(premium).toContain('--warm:#d99c6b');
    expect(premium).toContain('--accent:#f2efe8');
  });

  it('keeps iPhone controls readable and safe-area aware', () => {
    expect(premium).toContain('safe-area-inset-top');
    expect(premium).toContain('safe-area-inset-bottom');
    expect(premium).toContain('min-height:48px');
    expect(premium).toContain('@media (max-width:680px)');
    expect(premium).toContain('-webkit-backdrop-filter');
  });
});
