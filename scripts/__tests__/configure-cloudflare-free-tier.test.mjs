import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureCloudflareFreeTier } from '../configure-cloudflare-free-tier.mjs';

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

describe('configureCloudflareFreeTier', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('continues with per-request AI Gateway privacy when management API rejects OAuth', async () => {
    const fetchMock = vi.fn(async (input) => {
      const url = new URL(String(input));
      const path = url.pathname;

      if (path.endsWith('/zones')) {
        return jsonResponse(200, {
          success: true,
          result: [{ id: 'zone-1', name: 'defrag.app' }]
        });
      }

      if (path.endsWith('/accounts/account-1/d1/database/db-1')) {
        return jsonResponse(200, {
          success: true,
          result: { read_replication: { mode: 'auto' } }
        });
      }

      if (path.endsWith('/accounts/account-1/ai-gateway/gateways/sovereign-ai-gateway')) {
        return jsonResponse(403, {
          success: false,
          errors: [{ code: 10000, message: 'Authentication error' }],
          result: null
        });
      }

      if (path.includes('/rulesets/phases/http_ratelimit/entrypoint')) {
        return jsonResponse(403, {
          success: false,
          errors: [{ code: 10000, message: 'Authentication error' }]
        });
      }

      if (path.includes('/schema_validation/schemas')) {
        return jsonResponse(403, {
          success: false,
          errors: [{ code: 10000, message: 'Authentication error' }]
        });
      }

      throw new Error(`Unexpected Cloudflare API request in test: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    const result = await configureCloudflareFreeTier({
      accountId: 'account-1',
      apiToken: 'oauth-token-placeholder',
      databaseId: 'db-1',
      gatewayId: 'sovereign-ai-gateway',
      zoneName: 'defrag.app'
    });

    expect(result.d1).toEqual({ databaseId: 'db-1', readReplication: 'auto' });
    expect(result.gateway).toMatchObject({
      id: 'sovereign-ai-gateway',
      management: 'unavailable',
      status: 403,
      code: 10000,
      perRequestPrivacy: {
        skipCache: true,
        collectLog: false
      }
    });
    expect(result.rateLimit).toMatchObject({ management: 'unavailable', status: 403 });
    expect(result.schema).toMatchObject({ management: 'unavailable', status: 403 });
  });
});
