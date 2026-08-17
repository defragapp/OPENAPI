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

describe('secondary public visual parity', () => {
  it.each(staticPages)('%s uses the same Sovereign identity and final static authority', (_label, path) => {
    const document = read(path);
    expect(document).toContain('data-secondary-visual-contract="founder-v0-locked-v1"');
    expect(document).toContain(refinedCssPath);
    expect(document).toContain(refinementCssPath);
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

  it('keeps the founder foundation but makes the terminal authority own rendered composition', () => {
    expect(staticCss).toContain('--v0-page: #090b0e');
    expect(staticCss).toContain('--v0-cream: #f1e9de');
    expect(staticCss).toContain('font-family: "Sovereign Display"');
    expect(staticCss).toContain('font-family: "Sovereign Sans"');
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

  it('turns How it works into a direct editorial explanation rather than a feature-card grid', () => {
    expect(howItWorks).toContain('Your Baseline first. The situation second.');
    expect(howItWorks).toContain('ONE ANSWER · FOUR DISTINCTIONS');
    expect(howItWorks).toContain('Start with your Baseline.');
    expect(howItWorks).toContain('Add only what is relevant now.');
    expect(howItWorks).toContain('Keep people and roles distinct.');
    expect(howItWorks).toContain('Give the useful distinction first.');
    expect(howItWorks).toContain('class="product-proof-window"');
    expect(howItWorks).toContain('This is user-visible context—not hidden model reasoning.');
    expect(howItWorks).toContain('What your Baseline supports');
    expect(howItWorks).toContain('What pressure may be adding');
    expect(howItWorks).toContain('Where responsibility shifts');
    expect(howItWorks).toContain('What could change');
    expect(howItWorks.toLowerCase()).not.toContain('capacity beneath');
    expect(howItWorks).toContain('class="launch-section support-note-section"');
    expect(howItWorks).not.toContain('Help fund continued public development.');
  });

  it('makes pricing explicit without changing products, prices, or the entitlement path', () => {
    expect(pricing).toContain('Start with your Baseline. Add more only when you need it.');
    expect(pricing).toContain('aria-label="Sovereign.OS plans"');
    expect(pricing).toContain('class="annual-price"');
    expect(pricing).toContain('<span class="price-or">or</span>');
    expect(pricing).toContain('$0');
    expect(pricing).toContain('$20');
    expect(pricing).toContain('$99 / year');
    expect(pricing).toContain('10 Sovereign AI turns each month');
    expect(pricing).toContain('300 Sovereign AI turns each month');
    expect(pricing).toContain('Free is complete for you. Plus expands the context.');
    expect(pricing).not.toContain('pricing-dashboard');
    expect(pricing).not.toContain('pricing-toggle');
  });

  it('uses one readable FAQ flow and keeps public boundaries explicit', () => {
    expect(faq).toContain('What you should know before you begin.');
    for (const category of ['THE PRODUCT', 'PEOPLE + PERMISSION', 'FRAMEWORKS + LIMITS', 'PRIVACY + ACCOUNT', 'PLANS + SUPPORT', 'SAFETY']) {
      expect(faq).toContain(category);
    }
    expect(faq).toContain('Tarot is not part of Sovereign.OS.');
    expect(faq).toContain('Raw birth input, exact private location, authentication material, payment identifiers, invitation tokens');
    expect(faq).toContain('Can I support Sovereign.OS without subscribing?');
    expect(faq.toLowerCase()).not.toContain('capacity beneath');
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

  it('keeps landing refinement order unchanged', () => {
    const landingAuthority = main.indexOf("import './public-landing-approved-v8.css'");
    const iosAuthority = main.indexOf("import './landing-ios-parity-density-v1.css'");
    const secondaryAuthority = main.indexOf("import './public-secondary-pages-locked.css'");
    expect(landingAuthority).toBeGreaterThan(-1);
    expect(iosAuthority).toBeGreaterThan(landingAuthority);
    expect(secondaryAuthority).toBeGreaterThan(iosAuthority);
    expect(main).toContain("import experienceRefinementCss from './experience-refinement-v1.css?inline'");
    expect(main).toContain("import renderedFidelityCss from './rendered-fidelity-v1.css?inline'");
    expect(main).toContain("import landingRefinementV2Css from './landing-refinement-v2.css?inline'");
    expect(main.indexOf('style.textContent += `\\n${landingRefinementV2Css}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${renderedFidelityCss}`;'));
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).not.toContain('body.how-page');
  });

  it('keeps the fast production verifier aligned with the cache-busted static authority', () => {
    for (const route of ['/how-it-works', '/pricing', '/faq', '/privacy', '/terms']) expect(liveVerifier).toContain(`'${route}'`);
    expect(liveVerifier).toContain("const expectedContract = 'founder-v0-locked-v1'");
    expect(liveVerifier).toContain(`const expectedCssPath = '${refinedCssPath}'`);
    expect(liveVerifier).toContain(`const refinementCssPath = '${refinementCssPath}'`);
    expect(liveVerifier).toContain('assertSecurityHeaders');
    expect(liveVerifier).toContain('static refinement stylesheet');
    expect(productionRelease).toContain("['verify-secondary-public', 'scripts/verify-live-secondary-public.mjs']");
  });
});
