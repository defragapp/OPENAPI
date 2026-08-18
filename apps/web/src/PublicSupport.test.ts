import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const how = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const accountControls = read('./AccountControlCenter.tsx');
const launchContract = read('../../../docs/launch-product-contract.md');
const releaseGates = read('../../../docs/release-gates.md');

const generalSupportUrl = 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02';
const retiredDevelopmentSupportUrl = 'https://donate.stripe.com/7sY6oG1LDcls8s90x267S03';

describe('founder-approved public support contributions', () => {
  it('keeps one Stripe-hosted support path visible across the public information surfaces', () => {
    expect(how).toContain('id="support"');
    for (const source of [how, pricing, faq, accountControls]) {
      expect(source).toContain(generalSupportUrl);
      expect(source).not.toContain(retiredDevelopmentSupportUrl);
    }
    expect(faq).toContain('Can I support Sovereign.OS without subscribing?');
  });

  it('keeps voluntary support separate from subscriptions and entitlement projection', () => {
    expect(how).toContain('Separate from subscriptions');
    expect(how).toContain('Support is voluntary and does not change Free or Sovereign+ access.');
    expect(pricing).toContain('Support is separate from a subscription.');
    expect(pricing).toContain('Support does not unlock paid features or change your account access.');
    expect(faq).toContain('does not unlock paid features or change your plan');
    expect(launchContract).toContain('Founder-approved support products use Stripe-hosted one-time custom-amount links and remain voluntary, entitlement-neutral contributions.');
    expect(launchContract).toContain('They do not purchase access, subscription benefits, ownership, influence, tax-deductible status, or promised features.');
    expect(releaseGates).toContain('Public support links remain outside entitlement projection.');
  });

  it('preserves the current custom contribution minimum and disclosure', () => {
    expect(how).toContain('Support Sovereign.OS from $1.');
    for (const source of [how, pricing, faq, accountControls]) {
      expect(source).toContain('one-time amount from $1');
    }
    expect(accountControls).not.toContain('$5 to $500');
    expect(faq).toContain('is not presented as tax-deductible');
    expect(how).not.toContain('$10 suggested');
    expect(how).not.toContain('$25 suggested');
    expect(how).not.toContain('$1–$1,000');
    expect(how).not.toContain('$5–$500');
  });
});
