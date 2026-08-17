import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const consent = readFileSync(new URL('../public/consent.html', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/premium-action-static-v1.css', import.meta.url), 'utf8');

describe('standalone public action authority', () => {
  it('loads the same no-button visual authority on every standalone public route', () => {
    for (const source of [pricing, faq, how, consent, notFound]) {
      expect(source).toContain('/premium-action-static-v1.css?v=20260817-action-v1');
      expect(source).not.toContain('Build my Baseline');
    }
    for (const source of [pricing, faq, how, notFound]) {
      expect(source).toContain('>Sign in</a>');
      expect(source).toContain('>Get started');
    }
  });

  it('keeps pricing informational rather than placing CTAs inside plan cards', () => {
    expect(pricing).toContain('class="pricing-grid"');
    expect(pricing).not.toContain('class="launch-button"');
    expect(pricing).not.toContain('class="launch-button primary"');
    expect(pricing).toContain('Your Baseline is complete on Free.');
  });

  it('removes duplicate account navigation on consent and duplicate body sign-in on 404', () => {
    expect(consent).toContain('<a href="/app">Workspace</a>');
    expect(consent).not.toContain('Return to Sovereign');
    expect(notFound).toContain('Return home');
    expect(notFound.match(/>Sign in<\/a>/g)?.length).toBe(2); // desktop nav + mobile menu only
  });

  it('renders remaining static actions as text affordances instead of pills', () => {
    expect(css).toContain('.launch-cta');
    expect(css).toContain('.launch-button');
    expect(css).toContain('.consent-actions button');
    expect(css).toContain('background: transparent !important;');
    expect(css).toContain('border-radius: 0 !important;');
    expect(css).toContain('box-shadow: none !important;');
    expect(css).toContain('min-height: 44px !important;');
  });

  it('keeps consent in the same near-black and cream visual family', () => {
    expect(css).toContain('.consent-page');
    expect(css).toContain('background: var(--static-action-bg) !important;');
    expect(css).toContain('.consent-page .consent-panel');
    expect(css).toContain('border-radius: 0 !important;');
  });
});
