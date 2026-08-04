import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const document = read('../public/404.html');
const visual = read('../public/not-found-route.css');
const auditScript = read('../public/route-cohesion-audit.js');
const routeVerifier = read('../../../scripts/verify-live-route-cohesion.mjs');

describe('real static 404 cohesion', () => {
  it('keeps the real 404 boundary on the current founder-v0 route contract', () => {
    expect(document).toContain('data-visual-contract="founder-v0-static"');
    expect(document).toContain('data-secondary-visual-contract="founder-v0-locked-v1"');
    expect(document).toContain('data-route-cohesion="v1"');
    expect(document).toContain('/premium-public-release.css?v=20260730-final');
    expect(document).toContain('the retired stylesheet is not loaded');
  });

  it('loads the scoped composition before the final route authority', () => {
    const base = document.indexOf('/v0-public-static.css?v=20260803-refined-v2');
    const notFound = document.indexOf('/not-found-route.css?v=20260804-cohesion-v1');
    const finalAuthority = document.indexOf('/deployed-route-cohesion.css?v=20260803-route-v1');
    expect(base).toBeGreaterThan(-1);
    expect(notFound).toBeGreaterThan(base);
    expect(finalAuthority).toBeGreaterThan(notFound);
  });

  it('exposes the selectors required by the deterministic Browser Run audit', () => {
    for (const marker of [
      'class="launch-wordmark private-route-brand"',
      'class="not-found-main public-not-found"',
      'class="not-found-stage"',
      '<h1 id="not-found-heading">',
      'class="launch-mobile-menu-panel"'
    ]) {
      expect(document).toContain(marker);
    }
    expect(routeVerifier).toContain("name: 'not-found'");
    expect(routeVerifier).toContain("root: '.public-not-found'");
    expect(routeVerifier).toContain("heading: '.public-not-found h1'");
    expect(routeVerifier).toContain("nav: '.launch-nav'");
    expect(routeVerifier).toContain("content: '.public-not-found > section'");
    expect(routeVerifier).toContain("content: '.public-not-found > section', family: 'static-public'");
    expect(auditScript).toContain(':not(.not-found-code)');
  });

  it('provides editorial desktop composition and iPhone-safe stacking', () => {
    for (const marker of [
      'body.not-found-page .not-found-main',
      'body.not-found-page .not-found-stage',
      'grid-template-columns: minmax(220px, 0.58fr) minmax(0, 1fr)',
      'body.not-found-page .not-found-copy h1',
      'body.not-found-page .not-found-actions',
      '@media (max-width: 650px)',
      'env(safe-area-inset-bottom)',
      'min-height: 50px',
      '@media (prefers-reduced-motion: reduce)'
    ]) {
      expect(visual).toContain(marker);
    }
  });
});
