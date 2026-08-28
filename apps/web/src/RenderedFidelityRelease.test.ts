import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');
const main = readFileSync(resolve(root, 'apps/web/src/main.tsx'), 'utf8');
const fidelity = readFileSync(resolve(root, 'apps/web/src/public.css'), 'utf8');
const routeAudit = readFileSync(resolve(root, 'scripts/verify-live-route-cohesion-v2.mjs'), 'utf8');
const packageJson = readFileSync(resolve(root, 'package.json'), 'utf8');

describe('rendered fidelity release authority', () => {
  it('loads rendered fidelity after the existing refinement authority', () => {
    expect(fidelity).toContain('rendered-fidelity-v1.css');
    expect(fidelity).toContain('experience-refinement-v1.css');
  });

  it('removes electric interface color from the final landing authority', () => {
    expect(fidelity).toContain('--v8-blue: #d8d0c5 !important;');
    expect(fidelity).toContain("radialGradient[id$='-sphere-fill']");
    expect(fidelity).toContain("radialGradient[id$='-core']");
    expect(fidelity).toContain('stroke: rgba(241, 233, 222, 0.64) !important;');
    expect(fidelity).toContain('filter: saturate(0.08) contrast(1.05) brightness(0.96) !important;');
  });

  it('reduces demo chrome and mobile repetition without changing product structure', () => {
    expect(fidelity).toContain('.public-approved-v8 .landing-demo {');
    expect(fidelity).toContain('box-shadow: none !important;');
    expect(fidelity).toContain('.public-approved-v8 .landing-workflow > li.is-active');
    expect(fidelity).toContain('.public-approved-v8 .landing-system-map {');
    expect(fidelity).toContain('.public-approved-v8 .landing-story {\n    padding: 54px 0 !important;');
    expect(fidelity).toContain('.public-approved-v8 .v0-comparison,\n  .public-approved-v8 .v0-final {\n    padding-block: 58px !important;');
  });

  it('persists Cloudflare Browser Rendering route screenshots and report', () => {
    expect(packageJson).toContain('node scripts/verify-live-route-cohesion-v2.mjs --self-test');
    expect(packageJson).toContain('node scripts/verify-live-route-cohesion-v2.mjs');
    expect(routeAudit).toContain("routeScreenshotDirectory = resolve('.visual-release-audit/routes')");
    expect(routeAudit).toContain("writeFileSync(screenshotPath, snapshot.screenshot)");
    expect(routeAudit).toContain("writeFileSync(resolve(routeScreenshotDirectory, 'report.json')");
    expect(routeAudit).toContain('screenshotPath: result.screenshotPath');
  });
});
