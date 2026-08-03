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
const policy = read('./PublicPolicy.tsx');
const policyCss = read('./public-secondary-pages-locked.css');
const main = read('./main.tsx');
const landing = read('./PublicLanding.tsx');
const liveVerifier = read('../../../scripts/verify-live-secondary-public.mjs');
const productionRelease = read('../../../scripts/cloudflare-production-release.mjs');


describe('secondary public visual parity', () => {
  it.each(staticPages)('%s uses the frozen landing identity and mobile navigation', (_label, path) => {
    const document = read(path);
    expect(document).toContain('data-secondary-visual-contract="founder-v0-locked-v1"');
    expect(document).toContain('/v0-public-static.css?v=20260803-locked-v1');
    expect(document).toContain('class="launch-nav-inner"');
    expect(document).toContain('class="launch-wordmark"');
    expect(document).toContain('>SOVEREIGN.OS</a>');
    expect(document).toContain('class="launch-cta" href="/signup">Get started');
    expect(document).toContain('class="launch-mobile-menu"');
    expect(document).toContain('class="launch-mobile-menu-panel"');
    expect(document).toContain('class="launch-footer-inner"');
    expect(document).toContain('© 2026 Sovereign.OS');
  });

  it('uses the exact founder-v0 black, cream, and Cloudflare-blue visual tokens', () => {
    expect(staticCss).toContain('--v0-page: #090b0e');
    expect(staticCss).toContain('--v0-cream: #f1e9de');
    expect(staticCss).toContain('--v0-blue: #2f93ff');
    expect(staticCss).toContain('--v0-blue-bright: #78c7ff');
    expect(staticCss).toContain('font-family: "Sovereign Display"');
    expect(staticCss).toContain('font-family: "Sovereign Sans"');
    expect(staticCss).toContain('.launch-nav-inner');
    expect(staticCss).toContain('grid-template-columns: 1fr auto 1fr');
    expect(staticCss).toContain('.launch-mobile-menu-panel');
    expect(staticCss).toContain('body.launch-page');
    expect(staticCss).toContain('.journey-steps');
    expect(staticCss).toContain('.pricing-grid');
    expect(staticCss).toContain('.faq-list details');
    expect(staticCss).toContain('.launch-footer');
    expect(staticCss).not.toContain('--v0-warm');
    expect(staticCss).not.toContain('--v0-sage');
  });

  it('ports Privacy and Terms onto the exact landing navigation and footer', () => {
    expect(policy).toContain('sovereign-policy public-approved-v8 public-secondary-page');
    expect(policy).toContain('data-secondary-visual-contract="founder-v0-locked-v1"');
    expect(policy).toContain('className="v0-nav"');
    expect(policy).toContain('className="v0-shell v0-nav-inner"');
    expect(policy).toContain('className="v0-wordmark v0-wordmark--desktop"');
    expect(policy).toContain('className="v0-wordmark v0-wordmark--mobile"');
    expect(policy).toContain('className="landing-control landing-control--nav"');
    expect(policy).toContain('className="v0-mobile-menu"');
    expect(policy).toContain('className="v0-footer"');
    expect(policy).toContain('© 2026 Sovereign.OS');
  });

  it('keeps policy styling scoped away from the frozen landing', () => {
    expect(policyCss).toContain('.public-secondary-page');
    expect(policyCss).toContain('--v8-blue-bright');
    expect(policyCss).toContain('.public-secondary-page .policy-hero');
    expect(policyCss).toContain('.public-secondary-page .policy-grid article');
    expect(policyCss).toContain('.public-secondary-page .policy-contact');
    expect(policyCss).not.toContain('.public-approved-v8 .v0-hero');
    expect(policyCss).not.toContain('.public-approved-v8 .landing-story');
  });

  it('loads secondary parity after the landing and iOS authorities without changing the landing contract', () => {
    const landingAuthority = main.indexOf("import './public-landing-approved-v8.css'");
    const iosAuthority = main.indexOf("import './landing-ios-parity-density-v1.css'");
    const secondaryAuthority = main.indexOf("import './public-secondary-pages-locked.css'");
    expect(landingAuthority).toBeGreaterThan(-1);
    expect(iosAuthority).toBeGreaterThan(landingAuthority);
    expect(secondaryAuthority).toBeGreaterThan(iosAuthority);
    expect(landing).toContain('data-public-release="approved-public-v8"');
    expect(landing).toContain('data-viewport-contract="v0-public-landing-v3"');
    expect(landing).not.toContain('public-secondary-page');
  });

  it('blocks deployment until all five secondary public routes prove parity live', () => {
    for (const route of ['/how-it-works', '/pricing', '/faq', '/privacy', '/terms']) {
      expect(liveVerifier).toContain(`'${route}'`);
    }
    expect(liveVerifier).toContain("const expectedContract = 'founder-v0-locked-v1'");
    expect(liveVerifier).toContain("const expectedCssPath = '/v0-public-static.css?v=20260803-locked-v1'");
    expect(liveVerifier).toContain('assertSecurityHeaders');
    expect(liveVerifier).toContain('compiled policy stylesheet');
    expect(productionRelease).toContain("['verify-secondary-public', 'scripts/verify-live-secondary-public.mjs']");
  });
});
