import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(process.cwd(), '../..');
const oauthRelease = readFileSync(resolve(repositoryRoot, 'scripts/production-release-oauth.sh'), 'utf8');
const routeAudit = readFileSync(resolve(repositoryRoot, 'scripts/verify-live-route-cohesion.mjs'), 'utf8');
const visualAudit = readFileSync(resolve(repositoryRoot, 'scripts/verify-live-visual-release-v2.mjs'), 'utf8');

describe('OAuth Browser Rendering credential handoff', () => {
  it('replaces inherited Browser credentials with the fresh Wrangler OAuth token', () => {
    const clearBrowserToken = 'unset CLOUDFLARE_BROWSER_API_TOKEN || true';
    const establishOauth = 'ensure_oauth';
    const exportBrowserToken = 'export CLOUDFLARE_BROWSER_API_TOKEN="$oauth_token"';

    expect(oauthRelease).toContain(clearBrowserToken);
    expect(oauthRelease).toContain(exportBrowserToken);
    expect(oauthRelease.indexOf(clearBrowserToken)).toBeLessThan(oauthRelease.indexOf(establishOauth));
    expect(oauthRelease.indexOf(exportBrowserToken)).toBeLessThan(oauthRelease.lastIndexOf(establishOauth));
    expect(oauthRelease).not.toContain('echo "$oauth_token"');
    expect(oauthRelease).not.toContain("printf '%s\\n' \"$oauth_token\"");
  });

  it('keeps Browser Rendering consumers pinned to the browser-specific credential first', () => {
    for (const verifier of [routeAudit, visualAudit]) {
      expect(verifier).toContain('process.env.CLOUDFLARE_BROWSER_API_TOKEN');
      expect(verifier.indexOf('process.env.CLOUDFLARE_BROWSER_API_TOKEN')).toBeLessThan(
        verifier.indexOf('process.env.CLOUDFLARE_API_TOKEN')
      );
    }
  });
});
