import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const rasterizer = readFileSync(new URL('../scripts/materialize-brand-assets.mjs', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
const manifest = readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8');
const socialPreview = readFileSync(new URL('../public/og-sovereign.svg', import.meta.url), 'utf8');
const appIcon = readFileSync(new URL('../public/app-icon.svg', import.meta.url), 'utf8');
const pinnedIcon = readFileSync(new URL('../public/safari-pinned-tab.svg', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');
const productStories = readFileSync(new URL('./landing-product-stories-v2.css', import.meta.url), 'utf8');

describe('public metadata and fallback documents', () => {
  it('explains the product category in document and shared-link metadata', () => {
    expect(index).toContain('Sovereign.OS — Private personal AI for real life');
    expect(index).toContain('private personal AI for understanding yourself, your relationships, your decisions, and the groups around you');
    expect(index).toContain('Use one private Baseline to understand recurring patterns, decisions, relationships, and family or group dynamics without starting from zero every time.');
    expect(index).toContain('og:site_name" content="Sovereign.OS"');
    expect(index).toContain('twitter:card" content="summary_large_image"');
    expect(index).toContain('https://sovereign.defrag.app/og-sovereign.png');
    expect(index).toContain('og:image:type" content="image/png"');
    expect(index).not.toContain('og:title" content="Sovereign — Healing isn’t optional. Holding onto the pain is."');
    expect(index).not.toContain('with permitted context');
  });

  it('delivers product-story layout through the compiled application bundle', () => {
    expect(index).toContain('<script type="module" src="/src/main.tsx"></script>');
    expect(index).not.toContain('v0-product-story-layout-hotfix.css');
    expect(main).toContain("import './landing-product-stories-v2.css';");
    for (const marker of [
      '.landing-story__stage',
      'display: flex',
      'flex-direction: column',
      'height: auto',
      'min-height: 0',
      '@media (max-width: 760px)'
    ]) expect(productStories).toContain(marker);
  });

  it('keeps the static 404 on the current production assets', () => {
    const assets = [
      '/v0-public-static.css?v=20260803-refined-v2',
      '/not-found-route.css?v=20260804-cohesion-v1',
      '/deployed-route-cohesion.css?v=20260803-route-v1'
    ] as const;

    for (const asset of assets) expect(notFound).toContain(asset);
    expect(notFound.indexOf(assets[1])).toBeGreaterThan(notFound.indexOf(assets[0]));
    expect(notFound.indexOf(assets[2])).toBeGreaterThan(notFound.indexOf(assets[1]));
    expect(notFound).toContain('data-route-cohesion="v1"');
    expect(notFound).toContain('This page is not part of Sovereign.OS.');
  });

  it('keeps install metadata aligned with the product definition', () => {
    expect(manifest).toContain('Private personal AI for understanding yourself, your relationships, your decisions, and the groups around you.');
    expect(manifest).toContain('Open your private Sovereign workspace.');
    expect(manifest).toContain('"theme_color": "#080a0d"');
    expect(manifest).toContain('"src": "/app-icon.png"');
    expect(manifest).toContain('"sizes": "512x512"');
    expect(manifest).toContain('"src": "/app-icon.svg"');
  });

  it('materializes raster social and iOS assets from the canonical SVG marks during build', () => {
    expect(packageJson).toContain('vite build && node scripts/materialize-brand-assets.mjs');
    expect(rasterizer).toContain("source: resolve(publicDir, 'og-sovereign.svg')");
    expect(rasterizer).toContain("target: resolve(distDir, 'og-sovereign.png')");
    expect(rasterizer).toContain('width: 1200');
    expect(rasterizer).toContain('height: 630');
    expect(rasterizer).toContain("source: resolve(publicDir, 'app-icon.svg')");
    expect(rasterizer).toContain("target: resolve(distDir, 'app-icon.png')");
    expect(rasterizer).toContain("target: resolve(distDir, 'apple-touch-icon.png')");
    expect(rasterizer).toContain('width: 180');
    expect(packageJson).toContain('"sharp": "0.35.2"');
    expect(rasterizer).toContain("import sharp from 'sharp';");
    expect(rasterizer).not.toContain("node_modules/.pnpm");
    expect(rasterizer).not.toContain("name.startsWith('sharp@')");
    expect(rasterizer).not.toContain("node_modules/sharp/lib/index.js");
    expect(index).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />');
  });

  it('uses the same line-field identity in social, browser, and install marks', () => {
    expect(socialPreview).toContain('PRIVATE PERSONAL AI FOR REAL LIFE');
    expect(socialPreview).toContain('Understand yourself,');
    expect(socialPreview).toContain('family or group dynamics');
    expect(socialPreview).not.toContain('Healing isn’t optional.');
    expect(appIcon).toContain('quiet field of lines showing different relative emphasis');
    expect(appIcon).toContain('M256 330 256 112');
    expect(pinnedIcon).toContain('M24 33V8');
    expect(index).toContain('<link rel="icon" href="/app-icon.svg" type="image/svg+xml" />');
    expect(index).toContain('<link rel="icon" href="/app-icon.png" type="image/png" sizes="512x512" />');
    expect(index).toContain('<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#080a0d" />');
  });

  it('retires the stale public shell instead of caching another visual release', () => {
    expect(serviceWorker).toContain("const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17'");
    expect(serviceWorker).toContain('self.registration.unregister()');
    expect(serviceWorker).toContain('caches.keys()');
    expect(serviceWorker).toContain('client.navigate(client.url)');
    expect(serviceWorker).not.toContain("addEventListener('fetch'");
    expect(serviceWorker).not.toContain('PUBLIC_NAVIGATION');
    expect(serviceWorker).not.toContain("  '/app',");
  });
});
