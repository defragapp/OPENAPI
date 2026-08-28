import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const routeCss = read('./deployed-route-cohesion.css');
const staticRouteCss = read('../public/deployed-route-cohesion.css');
const experienceRefinement = read('./experience-refinement-v1.css');
const renderedFidelity = read('./rendered-fidelity-v1.css');
const landingRefinement = read('./landing-refinement-v2.css');
const landingRefinementV5 = read('./landing-live-refinement-v5.css');
const sansAuthority = read('./sans-typography-authority-v1.css');
const invitationFidelity = read('./invitation-rendered-fidelity-v1.css');
const staticRefinement = read('../public/experience-static-refinement-v1.css');
const staticTerminal = read('../public/premium-action-static-v1.css');
const how = read('../public/how-it-works.html');
const pricing = read('../public/pricing.html');
const faq = read('../public/faq.html');
const consent = read('../public/consent.html');
const notFound = read('../public/404.html');
const routeAuditAsset = read('../public/route-cohesion-audit.js');
const verifier = read('../../../scripts/verify-live-route-cohesion.mjs');
const verifierV2 = read('../../../scripts/verify-live-route-cohesion-v2.mjs');
const secondaryVerifier = read('../../../scripts/verify-live-secondary-public.mjs');
const productionRelease = read('../../../scripts/cloudflare-production-release.mjs');
const packageJson = JSON.parse(read('../../../package.json')) as { scripts?: Record<string, string> };

const refinementCssPath = '/experience-static-refinement-v1.css?v=20260817-cohesion-v2';
const terminalCssPath = '/premium-action-static-v1.css?v=20260818-geist-v1';

describe('deployed route cohesion contract', () => {
  it('keeps component stylesheet order and appends terminal Geist typography after inline authorities', () => {
    const cohesion = "import './deployed-route-cohesion.css';";
    const passkey = "import './passkey-auth.css';";
    expect(main).toContain(cohesion);
    expect(main).toContain(passkey);
    expect(main.indexOf(cohesion)).toBeLessThan(main.indexOf(passkey));
    expect(main.slice(main.indexOf(passkey) + passkey.length)).not.toContain("import './");
    expect(main).toContain("import sansTypographyAuthorityCss from './sans-typography-authority-v1.css?inline';");
    expect(main.indexOf('style.textContent += `\\n${sansTypographyAuthorityCss}`;')).toBeGreaterThan(main.indexOf('style.textContent += `\\n${premiumActionAuthorityCss}`;'));
  });

  it('keeps route, refinement, and typography CSS structurally balanced', () => {
    for (const source of [routeCss, staticRouteCss, experienceRefinement, renderedFidelity, landingRefinement, landingRefinementV5, sansAuthority, invitationFidelity, staticRefinement, staticTerminal]) {
      expect((source.match(/{/g) ?? []).length).toBe((source.match(/}/g) ?? []).length);
    }
  });

  it('keeps shared static pages on current route and terminal typography authorities', () => {
    for (const document of [how, pricing, faq, notFound]) expect(document).toContain('/deployed-route-cohesion.css?v=20260803-route-v1');
    for (const document of [how, pricing, faq, consent, notFound]) {
      expect(document).toContain(refinementCssPath);
      expect(document).toContain(terminalCssPath);
    }
    expect(consent).not.toContain('/deployed-route-cohesion.css?v=20260803-route-v1');
    expect(staticTerminal).toContain('--static-title-font:');
    expect(staticTerminal).toContain('font-family: var(--static-title-font) !important');
    expect(staticTerminal).not.toContain('Sovereign Display');
  });

  it('keeps public-page language aligned with the canonical product-language authority', () => {
    expect(how).toContain('Start with yourself. Add another person or the wider situation only when it helps.');
    expect(how).toContain('YOU → PEOPLE → SYSTEMS');
    expect(how).toContain('Ask about what you actually want to understand.');
    expect(how).toContain('A private reference built around you.');
    expect(how).toContain('<summary>See source details</summary>');
    expect(pricing).toContain('Free: your personal Baseline Design. Sovereign+: your people, your systems, your Library.');
    expect(pricing).toContain('Your Baseline Design stays yours. Plus expands what you can explore.');
    expect(faq).toContain('What can Sovereign help you understand?');
    expect(faq).toContain('What can I use Sovereign to explore about myself?');
    expect(faq).toContain('Can I see what information Sovereign used for an answer?');
    expect(faq).toContain('Do those source details prove the interpretation is true?');
    expect(`${how}\n${pricing}\n${faq}`).not.toContain('One private foundation.');
    expect(`${how}\n${pricing}\n${faq}`).not.toContain('See where responsibility keeps landing.');
    expect(`${how}\n${pricing}\n${faq}`).not.toContain('Ordinary questions. More context when it belongs.');
    expect(`${how}\n${pricing}\n${faq}`).not.toContain('Example Basis');
    expect(`${how}\n${pricing}\n${faq}`).not.toContain('permitted perspectives');
    expect(`${how}\n${pricing}\n${faq}`).not.toContain('confirmed responsibilities');
  });

  it('keeps route cohesion focused on structure rather than redesigning product state', () => {
    for (const marker of [
      'body.how-page .journey-steps',
      'grid-template-columns: repeat(2, minmax(0, 1fr))',
      'body.pricing-page .price-card',
      'body.pricing-page .plan-comparison-list > div',
      'body.questions-page .faq-section',
      'body.questions-page .faq-list summary',
      '@media (max-width: 650px)'
    ]) expect(staticRouteCss).toContain(marker);
  });

  it('keeps the Browser audit transport external, deterministic, and rate-limit aware', () => {
    expect(routeAuditAsset).toContain('document.currentScript');
    expect(routeAuditAsset).toContain('setTimeout(inspect, pollInterval)');
    expect(routeAuditAsset).toContain("document.addEventListener('DOMContentLoaded', start");
    expect(routeAuditAsset).toContain('documentRoot.setAttribute(attribute');
    expect(routeAuditAsset).not.toContain('how-it-works');
    expect(verifier).toContain("const browserRunIntervalMs = Math.min(");
    expect(verifier).toContain("process.env.BROWSER_RUN_REQUEST_INTERVAL_MS || 15_000");
    expect(verifier).toContain('isBrowserRunRateLimit');
    expect(verifier).toContain('isBrowserRunTransientRequestTimeout');
    expect(verifier).toContain('code) === 2001');
    expect(verifier).toContain("waitUntil: route.waitUntil || 'networkidle0'");
    expect(verifier).toContain("url: `${appBase}/invitation?token=route-cohesion-audit`");
    expect(verifierV2).toContain('mkdirSync(routeScreenshotDirectory');
    expect(verifierV2).toContain('screenshotPath');
    expect(verifierV2).toContain('const serifTypographyMarker =');
    expect(verifierV2).toContain("headingFamily).includes('Sovereign Display')");
    expect(verifierV2).toContain('const sansTypographyReplacement =');
    expect(verifierV2).toContain("Geist Sans title stack");
    expect(verifierV2).toContain('Geist Sans title stack');
    expect(verifierV2).toContain('for (const [from, to] of replacements) generated = generated.replace(from, to);');
    expect(verifierV2).toContain('Route cohesion v2 still certifies the retired display serif.');
    expect(productionRelease).toContain("['verify-route-cohesion', 'scripts/verify-live-route-cohesion-v2.mjs']");
  });

  it('keeps both fast and rendered route verification production-authoritative', () => {
    expect(secondaryVerifier).toContain("const routeCssPath = '/deployed-route-cohesion.css?v=20260803-route-v1'");
    expect(secondaryVerifier).toContain("const refinementCssPath = '/experience-static-refinement-v1.css?v=20260817-cohesion-v2'");
    expect(secondaryVerifier).toContain("const terminalCssPath = '/premium-action-static-v1.css?v=20260818-geist-v1'");
    expect(secondaryVerifier).toContain('positioning=self-people-systems typography=geist-sans');
    expect(packageJson.scripts?.['verify:live-route-cohesion']).toBe('node scripts/verify-live-route-cohesion-v2.mjs');
  });

  it('keeps rendered visual refinements coherent with the Geist Sans public release', () => {
    expect(experienceRefinement).toContain('--landing-blue: #e8ddd0 !important');
    expect(renderedFidelity).toContain('--v8-blue: #d8d0c5 !important');
    expect(landingRefinement).toContain('.landing-workflow__progress');
    expect(landingRefinementV5).toContain('One typeface. Hierarchy comes from weight, scale, and opacity.');
    expect(landingRefinementV5).not.toContain('var(--font-display, Georgia, serif)');
    expect(landingRefinementV5).not.toContain('.landing-baseline-intro');
    expect(sansAuthority).toContain('--font-title:');
    expect(sansAuthority).toContain('-apple-system');
    expect(sansAuthority).toContain('"SF Pro Display"');
    expect(sansAuthority).toContain('"Segoe UI"');
    expect(sansAuthority).not.toMatch(/^[ \t]*(?:Optima,|"Avenir Next",)/m);
    expect(invitationFidelity).toContain('@media (min-width: 901px)');
    expect(staticRefinement).toContain('--v0-blue: #e8ddd0');
    expect(staticRefinement).toContain('--v0-blue-bright: #fffaf3');
  });
});