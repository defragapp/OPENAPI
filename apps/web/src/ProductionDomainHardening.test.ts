import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(process.cwd(), '../..');
const rootConfig = JSON.parse(readFileSync(resolve(repositoryRoot, 'wrangler.jsonc'), 'utf8'));
const directConfig = JSON.parse(readFileSync(resolve(repositoryRoot, 'wrangler.production-direct.jsonc'), 'utf8'));
const releaseVerifier = readFileSync(resolve(repositoryRoot, 'scripts/verify-parent-domain-routes-v3.mjs'), 'utf8');
const releaseConfigVerifier = readFileSync(resolve(repositoryRoot, 'scripts/verify-direct-preview-config.mjs'), 'utf8');
const productionDeploy = readFileSync(resolve(repositoryRoot, 'scripts/cloudflare-production-deploy-v3.mjs'), 'utf8');
const productionConfigBuilder = readFileSync(resolve(repositoryRoot, 'scripts/prepare-cloudflare-production-config.mjs'), 'utf8');
const releaseOrchestrator = readFileSync(resolve(repositoryRoot, 'scripts/release-orchestrator.mjs'), 'utf8');
const readme = readFileSync(resolve(repositoryRoot, 'README.md'), 'utf8');

describe('production domain hardening', () => {
  it('disables production workers.dev in both Wrangler authorities', () => {
    expect(rootConfig.workers_dev).toBe(false);
    expect(directConfig.workers_dev).toBe(false);
    expect(rootConfig).toEqual(directConfig);
    expect(releaseConfigVerifier).toContain("rootConfig.workers_dev === false");
  });

  it('keeps desired production routes authoritative without rewriting them during release deploy', () => {
    for (const hostname of ['sovereign.defrag.app', 'app.defrag.app']) {
      expect(rootConfig.routes).toContainEqual(expect.objectContaining({ pattern: hostname, custom_domain: true }));
    }
    for (const pattern of ['defrag.app/*', 'www.defrag.app/*']) {
      expect(rootConfig.routes).toContainEqual(expect.objectContaining({ pattern, zone_name: 'defrag.app' }));
    }
    expect(productionConfigBuilder).toContain('preserveExistingRoutes = false');
    expect(productionConfigBuilder).toContain('delete source.routes');
    expect(productionConfigBuilder).toContain('delete source.route');
    expect(productionConfigBuilder).toContain('routesManagedByDeploy: !preserveExistingRoutes');
    expect(releaseOrchestrator).toContain('preserveExistingRoutes: true');
  });

  it('does not probe or publish the retired production Worker subdomain', () => {
    expect(releaseVerifier).not.toContain('sovv-web.sovereign-os-api.workers.dev');
    expect(releaseVerifier).toContain('productionWorkersDev: false');
    expect(productionDeploy).toContain('productionWorkersDev = false');
    expect(productionDeploy).toContain("'workersDevUrl'");
    expect(productionDeploy).toContain('Production deploy v3 does not record workers.dev retirement');
    expect(readme).toMatch(/production `workers\.dev` access (?:is )?disabled/i);
  });
});
