import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const howItWorks = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
describe('public plan boundaries', () => {
  it('keeps donation placement out of every launch surface', () => {
    for (const page of [pricing, questions, howItWorks]) {
      expect(page).not.toContain('donate.stripe.com');
      expect(page).not.toContain('Support development through Stripe');
    }
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99');
  });

  it('keeps one consistent account CTA', () => {
    for (const page of [pricing, questions, howItWorks]) expect(page).toContain('Build my Baseline');
  });
});
