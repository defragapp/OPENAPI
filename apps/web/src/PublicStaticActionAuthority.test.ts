import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/premium-action-static-v1.css', import.meta.url), 'utf8');

describe('standalone public action authority', () => {
  it('loads the same no-button visual authority on every standalone public route', () => {
    for (const source of [pricing, faq, how]) {
      expect(source).toContain('/premium-action-static-v1.css?v=20260817-action-v1');
      expect(source).toContain('>Sign in</a>');
      expect(source).toContain('>Get started');
      expect(source).toContain('<a href="/signup">Get started</a>');
      expect(source).not.toContain('Build my Baseline');
    }
  });

  it('keeps pricing informational rather than placing CTAs inside plan cards', () => {
    expect(pricing).toContain('class="pricing-grid"');
    expect(pricing).not.toContain('class="launch-button"');
    expect(pricing).not.toContain('class="launch-button primary"');
    expect(pricing).toContain('Your Baseline is complete on Free.');
  });

  it('renders remaining static actions as text affordances instead of pills', () => {
    expect(css).toContain('.launch-cta');
    expect(css).toContain('.launch-button');
    expect(css).toContain('background: transparent !important;');
    expect(css).toContain('border-radius: 0 !important;');
    expect(css).toContain('box-shadow: none !important;');
    expect(css).toContain('min-height: 44px !important;');
  });
});
