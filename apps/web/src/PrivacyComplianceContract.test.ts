import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { POLICY_CONTENT_HASH, POLICY_METADATA, policyHashPayload, PRIVACY_SECTIONS } from '../../../config/policies';

const app = readFileSync(new URL('./App.tsx', import.meta.url), 'utf8');
const policy = readFileSync(new URL('./PublicPolicy.tsx', import.meta.url), 'utf8');
const onboarding = readFileSync(new URL('./PlanOnboarding.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('privacy, policy acceptance, and tracking contract', () => {
  it('binds the published policy text to a deterministic audited content hash', () => {
    const actual = createHash('sha256').update(policyHashPayload(), 'utf8').digest('hex');
    expect(actual).toBe(POLICY_CONTENT_HASH);
    expect(POLICY_METADATA.terms.version).toBe('2026-08-17');
    expect(POLICY_METADATA.privacy.version).toBe('2026-08-17');
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
  });

  it('uses affirmative linked Terms agreement and Privacy acknowledgement', () => {
    expect(app).toContain('I agree to the <a href={POLICY_METADATA.terms.path}>Terms</a>');
    expect(app).toContain('acknowledge the <a href={POLICY_METADATA.privacy.path}>Privacy Policy</a>');
    expect(app).toContain('Your name and email operate your private account.');
    expect(app).toContain('hashes limited request metadata for account security and abuse prevention');
  });

  it('discloses essential storage, processors, tracking posture, and retention', () => {
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
      '90 days'
    ]) expect(privacyText).toContain(required);
  });

  it('keeps a notice at Baseline collection and excludes raw sensitive data from model context', () => {
    expect(onboarding).toContain('Raw birth details and exact private location are not sent to the language model.');
    expect(onboarding).toContain('Sovereign receives only the reduced themes needed for an exploration.');
    expect(onboarding).toContain("locationPrecision: 'city_or_regional'");
    expect(onboarding).not.toContain('navigator.geolocation');
  });

  it('ships no non-essential analytics or advertising tracker in active web entry surfaces', () => {
    const activeWeb = [html, main, app, onboarding, workspace].join('\n');
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
