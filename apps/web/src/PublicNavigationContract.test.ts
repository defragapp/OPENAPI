import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

const landing = read('./PublicLanding.tsx');
const policy = read('./PublicPolicy.tsx');
const app = read('./App.tsx');
const onboarding = read('./PlanOnboarding.tsx');
const workspace = read('./SovereignIntelligenceWorkspace.tsx');
const brand = read('./BrandMark.tsx');
const launchPolish = read('./launch-polish-final-v1.css');
const staticPolish = read('../public/premium-action-static-v1.css');
const staticPages = [
  ['how', read('../public/how-it-works.html')],
  ['pricing', read('../public/pricing.html')],
  ['faq', read('../public/faq.html')],
  ['404', read('../public/404.html')],
  ['consent', read('../public/consent.html')]
] as const;

const publicDestinations = ['/how-it-works', '/pricing', '/faq', '/login', '/signup'] as const;

describe('public navigation and brand contract', () => {
  it('gives the root landing complete route-level navigation on desktop and mobile', () => {
    for (const href of publicDestinations) expect(landing).toContain(`href="${href}"`);
    expect(landing).not.toContain('<a href="#how">How it works</a>');
    expect(landing).toContain('aria-label="Sovereign.OS home"><BrandMark /></a>');
    expect(landing).toContain('<summary aria-label="Open navigation">Menu</summary>');
    expect(landing).not.toContain('function MenuIcon()');
  });

  it('keeps every standalone public page on the same structural header wrapper', () => {
    for (const [label, document] of staticPages) {
      expect(document, label).toContain('class="launch-nav"');
      expect(document, label).toContain('class="launch-nav-inner"');
      expect(document, label).toContain('SOVEREIGN.OS');
      expect(document, label).toContain('/premium-action-static-v1.css?v=20260817-action-v1');
    }
    for (const document of staticPages.slice(0, 3).map(([, html]) => html)) {
      for (const href of publicDestinations) expect(document).toContain(`href="${href}"`);
    }
  });

  it('uses the same BrandMark and complete exits on Privacy and Terms without decorative action icons', () => {
    expect((policy.match(/<BrandMark \/>/g) ?? []).length).toBeGreaterThanOrEqual(3);
    for (const href of publicDestinations) expect(policy).toContain(`href="${href}"`);
    expect(policy).toContain('<summary aria-label="Open navigation">Menu</summary>');
    expect(policy).not.toContain('PolicyMenuIcon');
    expect(policy).not.toContain('aria-hidden="true">→</span>');
  });

  it('uses one semantic Sovereign wordmark with no component-inline typography', () => {
    expect(brand).toContain('<span className="brand-mark">SOVEREIGN.OS</span>');
    expect(brand).not.toContain('style=');
    expect(brand).not.toContain('<img');
    expect(landing).toContain('className="v0-wordmark v0-wordmark--desktop"');
    expect(landing).toContain('className="v0-wordmark v0-wordmark--mobile"');
  });

  it('locks exact desktop brand, header, centered-nav, and right-action geometry', () => {
    for (const source of [launchPolish, staticPolish]) {
      expect(source).toContain('1180px');
      expect(source).toContain('64px');
      expect(source).toContain('13px');
      expect(source).toMatch(/grid-template-columns:\s*minmax\(180px,1fr\) auto minmax\(180px,1fr\)/);
      expect(source).toContain('justify-self:center !important');
      expect(source).toContain('justify-self:end !important');
      expect(source).toContain('letter-spacing:.16em !important');
    }
    expect(launchPolish).toContain('.public-approved-v8 .v0-nav-inner');
    expect(launchPolish).toContain('.public-secondary-page .v0-nav-inner');
    expect(staticPolish).toContain('body.launch-page .launch-nav-inner');
    expect(staticPolish).toContain('body.consent-page .launch-nav-inner');
  });

  it('keeps account, onboarding, invitation, and workspace chrome on the same 64px system', () => {
    expect(app).toContain('className="account-shell invitation-shell"');
    expect(onboarding).toContain('className="plan-onboarding"');
    expect(workspace).toContain('className="intelligence-topbar"');
    for (const marker of ['.account-shell .account-nav', '.plan-onboarding .plan-nav', '.invitation-shell::before', '.intelligence-topbar']) expect(launchPolish).toContain(marker);
    expect(launchPolish).toContain('--launch-header-h: 64px');
    expect(launchPolish).toContain('--launch-brand-size: 13px');
  });
});