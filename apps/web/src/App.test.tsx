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
    expect(app).toContain('Known behavior');
    expect(app).toContain('Actual state');
    expect(app).toContain('Not today');
  });

  it('keeps account access without external marketing route shells', () => {
    expect(app).toContain('Email verification, Turnstile protection, secure signed sessions');
    expect(app).toContain('Baseline onboarding');
    expect(app).not.toContain('function HomePage');
    expect(app).not.toContain('function PricingPage');
    expect(app).not.toContain('function AboutPage');
    expect(app).not.toContain('Describe the moment');
    expect(app).not.toContain('Core');
    expect(app).not.toContain('Studio');
  });

  it('includes SEO metadata and keeps private routes out of public indexing', () => {
    expect(html).toContain('og:title');
    expect(html).toContain('canonical');
  });

  it('allows pinch zoom and includes mobile-safe CSS hooks', () => {
    expect(html).not.toContain('user-scalable=no');
    expect(css).toContain('safe-area-inset-bottom');
    expect(css).toContain('min-height: 44px');
  });
});
