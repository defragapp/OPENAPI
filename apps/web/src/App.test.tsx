import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Sovereign PWA shell', () => {
  const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  it('contains all authenticated surfaces', () => {
    for (const label of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) {
      expect(app).toContain(label);
    }
  });

  it('keeps Today Baseline-first and correction-ready', () => {
    expect(app).toContain('Baseline tendency');
    expect(app).toContain('Current amplification');
    expect(app).toContain('Known observation');
    expect(app).toContain('Unknown actual state');
    expect(app).toContain('Not today');
  });

  it('allows pinch zoom and includes mobile-safe CSS hooks', () => {
    expect(html).not.toContain('user-scalable=no');
    expect(css).toContain('safe-area-inset-bottom');
    expect(css).toContain('min-height: 44px');
  });
});
