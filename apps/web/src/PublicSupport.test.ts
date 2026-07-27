import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const pricing = readFileSync(new URL('../public/pricing.html', import.meta.url), 'utf8');
const questions = readFileSync(new URL('../public/faq.html', import.meta.url), 'utf8');
const howItWorks = readFileSync(new URL('../public/how-it-works.html', import.meta.url), 'utf8');
const supportUrl = 'https://donate.stripe.com/7sY6oG1LDcls8s90x267S03';

describe('public development support', () => {
  it('keeps voluntary support separate from subscription pricing', () => {
    expect(pricing).not.toContain('donate.stripe.com');
    expect(pricing).not.toContain('Support development through Stripe');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99');
  });

  it('exposes the Stripe-hosted support link only from explanatory public pages', () => {
    expect(questions).toContain(supportUrl);
    expect(howItWorks).toContain(supportUrl);
    expect(questions).toContain('target="_blank"');
    expect(questions).toContain('rel="noopener noreferrer"');
  });

  it('states that contributions do not grant product or governance rights', () => {
    for (const required of [
      'does not purchase Free or Sovereign+ access',
      'create an entitlement',
      'grant ownership or influence',
      'promise a future feature',
      'does not represent contributions as tax-deductible'
    ]) {
      expect(questions).toContain(required);
    }
  });

  it('publishes amount, support, and refund context without describing a subscription', () => {
    expect(questions).toContain('$5 to $500');
    expect(questions).toContain('info@defrag.app');
    expect(questions).toContain('refund requests');
    expect(questions).toContain('one-time amount');
  });
});
