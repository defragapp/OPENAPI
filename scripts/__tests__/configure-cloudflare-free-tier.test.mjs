import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureCloudflareFreeTier } from '../configure-cloudflare-free-tier.mjs';
import { assertRequiredProductionControls } from '../cloudflare-production-deploy-v3.mjs';

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

  it('fails the production release closed when AI Gateway management rejects OAuth', async () => {
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
    expect(() => assertRequiredProductionControls(result))
      .toThrow(/AI Gateway management requires a credential accepted by the AI Gateway management API/);

    const externallyManagedZoneControls = {
      ...result,
      gateway: {
        id: 'sovereign-ai-gateway',
        management: 'verified',
        rateLimit: '500/60s',
        technique: 'sliding',
        spendLimits: [
          {
            id: 'sovereign_global_daily_spend',
            limitUsd: 2.75,
            windowSeconds: 86_400,
            technique: 'sliding'
          },
          {
            id: 'sovereign_global_30_day_spend',
            limitUsd: 75,
            windowSeconds: 2_592_000,
            technique: 'sliding'
          }
        ]
      }
    };
    expect(() => assertRequiredProductionControls(externallyManagedZoneControls)).not.toThrow();
    expect(() => assertRequiredProductionControls({
      ...externallyManagedZoneControls,
      rateLimit: { management: 'unavailable', status: 500, reason: 'unexpected failure' }
    })).toThrow(/unexpected failure/);
  });
  it('writes and verifies the exact launch Gateway burst and spend controls', async () => {
    const gatewayResult = {
      cache_ttl: 0,
      collect_logs: false,
      rate_limiting_interval: 60,
      rate_limiting_limit: 500,
      rate_limiting_technique: 'sliding',
      spend_limits: {
        enabled: true,
        rules: [
          {
            id: 'sovereign_global_daily_spend',
            enabled: true,
            limit: 2.75,
            limitType: 'cost',
            window: 86_400,
            technique: 'sliding'
          },
          {
            id: 'sovereign_global_30_day_spend',
            enabled: true,
            limit: 75,
            limitType: 'cost',
            window: 2_592_000,
            technique: 'sliding'
          }
        ]
      }
    };
    const fetchMock = vi.fn(async (input, init = {}) => {
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
        return jsonResponse(200, { success: true, result: gatewayResult });
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

    expect(result.gateway).toMatchObject({
      id: 'sovereign-ai-gateway',
      management: 'verified',
      rateLimit: '500/60s',
      technique: 'sliding',
      spendLimits: [
        {
          id: 'sovereign_global_daily_spend',
          limitUsd: 2.75,
          windowSeconds: 86_400,
          technique: 'sliding'
        },
        {
          id: 'sovereign_global_30_day_spend',
          limitUsd: 75,
          windowSeconds: 2_592_000,
          technique: 'sliding'
        }
      ]
    });
    expect(() => assertRequiredProductionControls(result)).not.toThrow();

    const gatewayWrite = fetchMock.mock.calls.find(([input, init]) =>
      String(input).includes('/ai-gateway/gateways/sovereign-ai-gateway')
      && init?.method === 'PUT'
    );
    expect(gatewayWrite).toBeTruthy();
    expect(JSON.parse(gatewayWrite[1].body)).toMatchObject({
      rate_limiting_interval: 60,
      rate_limiting_limit: 500,
      rate_limiting_technique: 'sliding',
      spend_limits: gatewayResult.spend_limits
    });
  });

});
