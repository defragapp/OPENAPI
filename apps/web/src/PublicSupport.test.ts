import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const how = read('../public/how-it-works.html');
const faq = read('../public/faq.html');
const launchContract = read('../../../docs/launch-product-contract.md');
const releaseGates = read('../../../docs/release-gates.md');

const generalSupportUrl = 'https://donate.stripe.com/dRm6oG61T2KSaAhdjO67S02';
const developmentSupportUrl = 'https://donate.stripe.com/7sY6oG1LDcls8s90x267S03';

describe('founder-approved public support contributions', () => {
  it('keeps both Stripe-hosted donation links visible on the public information surface', () => {
    expect(how).toContain('id="support"');
    expect(how).toContain(generalSupportUrl);
    expect(how).toContain(developmentSupportUrl);
    expect(faq).toContain(generalSupportUrl);
    expect(faq).toContain(developmentSupportUrl);
    expect(faq).toContain('Can I support Sovereign.OS without subscribing?');
  });

  it('keeps donation support separate from subscriptions and entitlement projection', () => {
    for (const source of [how, faq, launchContract, releaseGates]) {
      expect(source.toLowerCase()).toContain('entitlement');
    }
    expect(how).toContain('Separate from subscriptions');
    expect(how).toContain('Donation payments remain entitlement-neutral.');
    expect(faq).toContain('do not grant access, entitlements, ownership, influence, or a promise of future features');
    expect(launchContract).toContain('Founder-approved support products use Stripe-hosted one-time custom-amount links and remain voluntary, entitlement-neutral contributions.');
    expect(launchContract).toContain('They do not purchase access, subscription benefits, ownership, influence, tax-deductible status, or promised features.');
    expect(releaseGates).toContain('Public support links remain outside entitlement projection.');
  });

  it('preserves the approved custom contribution ranges and disclosure', () => {
    expect(how).toContain('$1–$1,000');
    expect(how).toContain('$10 suggested');
    expect(how).toContain('$5–$500');
    expect(how).toContain('$25 suggested');
    expect(how).toContain('not purchase access, subscription benefits, ownership, influence, tax-deductible status, or a promise of future features');
  });
});
