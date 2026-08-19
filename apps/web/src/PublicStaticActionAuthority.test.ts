import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const faq = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const how = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const landing = readFileSync(new URL('./PublicLanding.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/premium-action-static-v1.css', import.meta.url), 'utf8');

const SUPPORT_URL = 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02';
const RETIRED_DEV_LANGUAGE = [
  'what is supported, interpreted, and still unknown',
  'support, interpretation, and unknowns distinguishable',
  'server-confirmed Stripe subscription state'
] as const;

describe('standalone public action authority', () => {
  it('loads the same no-button visual authority on every standalone public route', () => {
    for (const source of [pricing, faq, how]) {
      expect(source).toContain('/premium-action-static-v1.css?v=20260818-geist-v1');
      expect(source).toContain('>Sign in</a>');
      expect(source).toContain('>Get started');
      expect(source).toContain('<a href="/signup">Get started</a>');
      expect(source).not.toContain('Build my Baseline');
    }
  });

  it('keeps pricing informational instead of turning plan cards into checkout buttons', () => {
    expect(pricing).toContain('class="pricing-grid"');
    expect(pricing).toContain('Your Baseline stays yours. Plus expands what you can explore.');
    expect(pricing).not.toContain('Choose Sovereign+');
    expect(pricing).not.toContain('Choose Free');
  });

  it('uses one entitlement-neutral support path beginning at one dollar', () => {
    for (const source of [pricing, faq, how]) {
      expect(source).toContain(SUPPORT_URL);
      expect(source).not.toContain('7sY6oG1LDcls8s90x267S03');
      expect(source).not.toContain('Development support');
      expect(source).toContain('one-time amount from $1');
    }
  });

  it('keeps developer taxonomy out of public copy and metadata', () => {
    for (const source of [pricing, faq, how, index, landing]) {
      for (const retired of RETIRED_DEV_LANGUAGE) expect(source.toLowerCase()).not.toContain(retired.toLowerCase());
    }
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
