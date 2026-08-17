import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ELIGIBILITY_RULE, POLICY_CONTENT_HASH, POLICY_METADATA, policyHashPayload, PRIVACY_SECTIONS, TERMS_SECTIONS } from '../../../config/policies';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const accountControls = readFileSync(new URL('./AccountControlCenter.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('privacy, policy acceptance, and tracking contract', () => {
  it('binds the published policy text and eligibility rule to a deterministic audited content hash', () => {
    const actual = createHash('sha256').update(policyHashPayload(), 'utf8').digest('hex');
    expect(actual).toBe(POLICY_CONTENT_HASH);
    expect(POLICY_METADATA.terms.version).toBe('2026-08-17.2');
    expect(POLICY_METADATA.privacy.version).toBe('2026-08-17.2');
    expect(ELIGIBILITY_RULE.minimumAge).toBe(18);
    expect(ELIGIBILITY_RULE.version).toBe('2026-08-17-18-plus');
    expect(POLICY_CONTENT_HASH).toMatch(/^[0-9a-f]{64}$/);
  });

  it('renders the same canonical policy authority used by signup evidence', () => {
    expect(policy).toContain("from '../../../config/policies'");
    expect(policy).toContain('data-policy-version={metadata.version}');
    expect(policy).toContain('Version {metadata.version}');
    expect(app).toContain("from '../../../config/policies'");
    expect(app).toContain('termsVersion: POLICY_METADATA.terms.version');
    expect(app).toContain('privacyVersion: POLICY_METADATA.privacy.version');
    expect(app).toContain('policyContentHash: POLICY_CONTENT_HASH');
    expect(app).toContain('eligibilityRuleVersion: ELIGIBILITY_RULE.version');
  });

  it('uses affirmative linked policy agreement and a separate unselected 18 plus confirmation', () => {
    expect(app).toContain('I agree to the <a href={POLICY_METADATA.terms.path}>Terms</a>');
    expect(app).toContain('acknowledge the <a href={POLICY_METADATA.privacy.path}>Privacy Policy</a>');
    expect(app).toContain('I confirm I am 18 or older.');
    expect(app).toContain('const [ageEligible, setAgeEligible] = useState(false)');
    expect(app).toContain("nextErrors.eligibility = 'Confirm that you are 18 or older to create a Sovereign.OS account.'");
    expect(app).toContain('Your name and email operate your private account.');
    expect(app).toContain('hashes limited request metadata for account security and abuse prevention');
  });

  it('pauses the private workspace for material policy review and records exact current values', () => {
    expect(authenticatedWorkspace).toContain("fetch('/api/v1/account/policy-status'");
    expect(authenticatedWorkspace).toContain("setState('policy_review')");
    expect(authenticatedWorkspace).toContain("fetch('/api/v1/account/policy-acceptance'");
    expect(authenticatedWorkspace).toContain('termsVersion: POLICY_METADATA.terms.version');
    expect(authenticatedWorkspace).toContain('privacyVersion: POLICY_METADATA.privacy.version');
    expect(authenticatedWorkspace).toContain('policyContentHash: POLICY_CONTENT_HASH');
    expect(authenticatedWorkspace).toContain('eligibilityRuleVersion: ELIGIBILITY_RULE.version');
    expect(authenticatedWorkspace).toContain('I accept the current Terms.');
    expect(authenticatedWorkspace).toContain('I acknowledge the current Privacy Policy.');
    expect(authenticatedWorkspace).toContain('I confirm I am 18 or older.');
  });

  it('exposes on-demand private account access without promising a retained export artifact', () => {
    expect(accountControls).toContain("fetch('/api/v1/account/export'");
    expect(accountControls).toContain("anchor.download = 'sovereign-account-export.json'");
    expect(accountControls).toContain('Sovereign did not retain an export copy.');
    expect(accountControls).toContain('Download private JSON export');
    const privacyText = PRIVACY_SECTIONS.map((section) => `${section.title}\n${section.copy}`).join('\n');
    expect(privacyText).toContain('on-demand JSON copy of account-owned data');
    expect(privacyText).toContain('not retained as an export artifact');
  });

  it('discloses essential storage, processors, tracking posture, retention, and policy history', () => {
    const privacyText = PRIVACY_SECTIONS.map((section) => `${section.title}\n${section.copy}`).join('\n');
    for (const required of [
      'Cookies and local storage',
      'HttpOnly, Secure, SameSite=Lax',
      'Local storage',
      'Session storage',
      'Cloudflare',
      'Stripe',
      'Resend',
      'Tracking and advertising',
      'does not currently run behavioral-advertising pixels or third-party analytics SDKs',
      '30 days',
      '90 days',
      'Policy history and eligibility'
    ]) expect(privacyText).toContain(required);
    const termsText = TERMS_SECTIONS.map((section) => `${section.title}\n${section.copy}`).join('\n');
    expect(termsText).toContain('Launch eligibility');
    expect(termsText).toContain('Policy updates');
  });

  it('keeps a notice at Baseline collection and excludes raw sensitive data from model context', () => {
    expect(onboarding).toContain('Raw birth details and exact private location are not sent to the language model.');
    expect(onboarding).toContain('Sovereign receives only the reduced themes needed for an exploration.');
    expect(onboarding).toContain("locationPrecision: 'city_or_regional'");
    expect(onboarding).not.toContain('navigator.geolocation');
  });

  it('ships no non-essential analytics or advertising tracker in active web entry surfaces', () => {
    const activeWeb = [html, main, app, onboarding, authenticatedWorkspace, accountControls, workspace].join('\n');
    for (const forbidden of [
      'googletagmanager.com',
      'google-analytics.com',
      'gtag(',
      'connect.facebook.net',
      'fbq(',
      'posthog',
      'mixpanel',
      'cdn.segment.com',
      'analytics.js',
      'cloudflareinsights.com/beacon'
    ]) expect(activeWeb.toLowerCase()).not.toContain(forbidden.toLowerCase());
  });
});
