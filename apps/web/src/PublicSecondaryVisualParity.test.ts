import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const staticPages = [
  ['How it works', '../public/how-it-works.html'],
  ['Pricing', '../public/pricing.html'],
  ['FAQ', '../public/faq.html']
] as const;

const staticCss = read('../public/v0-public-static.css');
const staticRefinementCss = read('../public/experience-static-refinement-v1.css');
const staticTerminalCss = read('../public/premium-action-static-v1.css');
const howItWorks = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const notFound = read('../public/404.html');
const consent = read('../public/consent.html');
const policy = read('./PublicPolicy.tsx');
const policyCss = read('./public-secondary-pages-locked.css');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const liveVerifier = read('../../../scripts/verify-live-secondary-public.mjs');
const productionRelease = read('../../../scripts/cloudflare-production-release.mjs');

const refinedCssPath = '/v0-public-static.css?v=20260803-refined-v2';
const refinementCssPath = '/experience-static-refinement-v1.css?v=20260817-cohesion-v2';
const terminalCssPath = '/premium-action-static-v1.css?v=20260817-action-v1';

describe('secondary public visual parity', () => {
  it.each(staticPages)('%s uses the same Sovereign identity and terminal static authority', (_label, path) => {
    const document = read(path);
    expect(document).toContain('data-secondary-visual-contract="founder-v0-locked-v1"');
    expect(document).toContain(refinedCssPath);
    expect(document).toContain(refinementCssPath);
    expect(document).toContain(terminalCssPath);
    expect(document).toContain('class="launch-nav-inner"');
    expect(document).toContain('class="launch-wordmark"');
    expect(document).toContain('>SOVEREIGN.OS</a>');
    expect(document).toContain('class="launch-cta" href="/signup">Get started');
    expect(document).toContain('class="launch-mobile-menu"');
    expect(document).toContain('class="launch-mobile-menu-panel"');
    expect(document).toContain('class="launch-footer-inner"');
    expect(document).toContain('© 2026 Sovereign.OS');
    expect(document).toContain('og-sovereign.png');
    expect(document).toContain('apple-touch-icon.png');
  });

  it('keeps the historical static foundation but lets terminal sans authority own rendered headings', () => {
    expect(staticCss).toContain('--v0-page: #090b0e');
    expect(staticCss).toContain('--v0-cream: #f1e9de');
    expect(staticTerminalCss).toContain('"Helvetica Neue"');
    expect(staticTerminalCss.indexOf('"Helvetica Neue"')).toBeLessThan(staticTerminalCss.indexOf('"SF Pro Display"'));
    expect(staticTerminalCss).not.toContain('Avenir Next');
    expect(staticTerminalCss).toContain('--static-title-font:');
    expect(staticTerminalCss).toContain('font-family: var(--static-title-font) !important');
    expect(staticTerminalCss).not.toContain('Sovereign Display');
    for (const marker of [
      '--static-shell: min(1180px, calc(100vw - 96px))',
      'body.launch-page .launch-hero.launch-hero-compact',
      'body.how-page .journey-steps > article',
      'body.pricing-page .pricing-grid',
      'body.questions-page .faq-category',
      'body.not-found-page .not-found-stage',
      'body.consent-page .consent-hero',
      '@media (max-width: 650px)',
      '@media (max-width: 360px)',
      '@media (prefers-reduced-motion: reduce)'
    ]) expect(staticRefinementCss).toContain(marker);
    expect(staticRefinementCss).toContain('--v0-blue: #e8ddd0');
    expect(staticRefinementCss).toContain('--v0-blue-bright: #fffaf3');
    expect(staticRefinementCss).toContain('#080a0d');
  });

  it('makes How it works explain You, People, and Systems before source mechanics', () => {
    expect(howItWorks).toContain('Start with you. Add context when it matters.');
    expect(howItWorks).toContain('YOU → PEOPLE → SYSTEMS');
    expect(howItWorks).toContain('Explore yourself.');
    expect(howItWorks).toContain('Add what is happening now.');
    expect(howItWorks).toContain('Bring in your people with permission.');
    expect(howItWorks).toContain('See the wider system.');
    expect(howItWorks).toContain('consented people, supplied roles, permitted perspectives, confirmed responsibilities');
    expect(howItWorks).toContain('Answer first. Detail underneath.');
    expect(howItWorks).toContain('A private reference built around you.');
    expect(howItWorks).toContain('class="product-proof-window"');
    expect(howItWorks).toContain('What does Alignment look like for me when I’m creating something new?');
    expect(howItWorks).toContain('Where Baseline Design comes from');
    expect(howItWorks.toLowerCase()).not.toContain('capacity beneath');
    expect(howItWorks.toLowerCase()).not.toContain('missing perspective');
    expect(howItWorks.toLowerCase()).not.toContain('roles, authority');
    expect(howItWorks).not.toContain('One private foundation');
    expect(howItWorks).not.toContain('Where responsibility shifts');
  });

  it('makes pricing explicit without changing products, prices, or the entitlement path', () => {
    expect(pricing).toContain('Explore yourself for free. Add People and Systems with Sovereign+.');
    expect(pricing).toContain('Explore yourself with Sovereign.');
    expect(pricing).toContain('Understand your people and the systems around you.');
    expect(pricing).toContain('aria-label="Sovereign.OS plans"');
    expect(pricing).toContain('class="annual-price"');
    expect(pricing).toContain('$0');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(pricing).toContain('10 Sovereign AI turns each month');
    expect(pricing).toContain('300 Sovereign AI turns each month');
    expect(pricing).toContain('Your Baseline stays yours. Plus expands what you can explore.');
    expect(pricing).not.toContain('pricing-dashboard');
    expect(pricing).not.toContain('pricing-toggle');
  });

  it('uses one readable FAQ flow and keeps public boundaries explicit', () => {
    expect(faq).toContain('What can Sovereign help you understand?');
    expect(faq).toContain('What can I use Sovereign to explore about myself?');
    expect(faq).toContain('Baseline Design is a private, explorable reference built around you.');
    for (const category of ['THE PRODUCT', 'PEOPLE + PERMISSION', 'FRAMEWORKS + LIMITS', 'PRIVACY + ACCOUNT', 'PLANS + SUPPORT', 'SAFETY']) {
      expect(faq).toContain(category);
    }
    expect(faq).toContain('consented people, supplied roles, permitted perspectives, confirmed responsibilities');
    expect(faq).toContain('Tarot is not part of Sovereign.OS.');
    expect(faq).toContain('Can I support Sovereign.OS without subscribing?');
    expect(faq.toLowerCase()).not.toContain('capacity beneath');
    expect(faq.toLowerCase()).not.toContain('missing perspective');
    expect(faq.toLowerCase()).not.toContain('roles, authority');
    expect(faq).not.toContain('private personal foundation');
  });

  it('extends the final static authority to 404 and account-bound consent without changing their behavior contracts', () => {
    expect(notFound).toContain(refinementCssPath);
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
    expect(consent).toContain(refinementCssPath);
    expect(consent).toContain('You control what another person can use with you.');
    expect(consent).toContain('id="status"');
    expect(consent).toContain('id="invitations"');
    expect(consent).toContain('/consent.js?v=20260726-consent-r1');
  });

  it('ports Privacy and Terms onto the landing navigation and footer without leaking static-page rules into the landing', () => {
    expect(policy).toContain('sovereign-policy public-approved-v8 public-secondary-page');
    expect(policy).toContain('data-secondary-visual-contract="founder-v0-locked-v1"');
    expect(policy).toContain('className="v0-nav"');
    expect(policy).toContain('className="v0-footer"');
    expect(policy).toContain('© 2026 Sovereign.OS');
    expect(policyCss).toContain('.public-secondary-page');
    expect(policyCss).not.toContain('.public-approved-v8 .v0-hero');
    expect(policyCss).not.toContain('.public-approved-v8 .landing-story');
  });

  it('keeps landing refinement order and terminal sans authority explicit', () => {
    const landingAuthority = main.indexOf("import './public-landing-approved-v8.css'");
    const iosAuthority = main.indexOf("import './landing-ios-parity-density-v1.css'");
    const secondaryAuthority = main.indexOf("import './public-secondary-pages-locked.css'");
    expect(landingAuthority).toBeGreaterThan(-1);
    expect(iosAuthority).toBeGreaterThan(landingAuthority);
    expect(secondaryAuthority).toBeGreaterThan(iosAuthority);
    expect(main).toContain("import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline'");
    expect(main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;'));
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).not.toContain('body.how-page');
  });

  it('keeps the fast production verifier aligned with the current static authority', () => {
    for (const route of ['/how-it-works', '/pricing', '/faq', '/privacy', '/terms']) expect(liveVerifier).toContain(`'${route}'`);
    expect(liveVerifier).toContain("const expectedContract = 'founder-v0-locked-v1'");
    expect(liveVerifier).toContain(`const expectedCssPath = '${refinedCssPath}'`);
    expect(liveVerifier).toContain(`const refinementCssPath = '${refinementCssPath}'`);
    expect(liveVerifier).toContain('assertSecurityHeaders');
    expect(productionRelease).toContain("['verify-secondary-public', 'scripts/verify-live-secondary-public.mjs']");
  });
});
