import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const API_ROOT = 'https://api.cloudflare.com/client/v4';
const SCHEMA_NAME = 'Sovereign.OS Critical API';
const RATE_RULE_REF = 'sovereign_ai_messages_free_tier';
const RATE_PHASE = 'http_ratelimit';
const AI_GATEWAY_RATE_LIMIT = 500;
const AI_GATEWAY_RATE_WINDOW_SECONDS = 60;

const CRITICAL_OPERATIONS = [
  ['POST', '/api/v1/account/onboarding'],
  ['POST', '/api/v1/current-conditions'],
  ['DELETE', '/api/v1/current-conditions'],
  ['PUT', '/api/v1/people/{personId}/consent/{scope}'],
  ['PUT', '/api/v1/invitations/{invitationId}/consent/{scope}'],
  ['POST', '/api/v1/billing/checkout'],
  ['POST', '/api/v1/billing/portal'],
  ['POST', '/api/v1/deletion-jobs']
];

export function normalizeApiShieldEndpoint(endpoint) {
  let variableIndex = 0;
  return String(endpoint || '').replace(/\{[^{}]+\}/g, () => `{var${++variableIndex}}`);
}

export function apiShieldOperationMatches(operation, method, endpoint) {
  return String(operation?.host || '').toLowerCase() === 'app.defrag.app'
    && operation?.method === method
    && normalizeApiShieldEndpoint(operation?.endpoint) === normalizeApiShieldEndpoint(endpoint);
}

export async function configureCloudflareFreeTier(options = {}) {
  const accountId = String(options.accountId || process.env.CLOUDFLARE_ACCOUNT_ID || '').trim();
  const apiToken = String(options.apiToken || process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim();
  const databaseId = String(options.databaseId || process.env.D1_DATABASE_ID || '').trim();
  const gatewayId = String(options.gatewayId || process.env.AI_GATEWAY_ID || 'sovereign-ai-gateway').trim();
  const zoneName = String(options.zoneName || 'defrag.app').trim();
  if (!accountId) throw new Error('CLOUDFLARE_ACCOUNT_ID is required to configure free-tier controls');
  if (!apiToken) throw new Error('CLOUDFLARE_API_TOKEN is required to configure free-tier controls');
  if (!databaseId) throw new Error('D1 database ID is required to enable read replication');

  const client = createCloudflareClient(apiToken);
  const zone = await resolveZone(client, zoneName);
  const d1 = await configureD1Replication(client, accountId, databaseId);
  const gateway = await configureAiGateway(client, accountId, gatewayId);
  const rateLimit = await configureOptionalZoneControl('WAF rate limiting', () => configureFreeRateLimit(client, zone.id));
  const schema = await configureOptionalZoneControl('API Shield', () => configureApiShield(client, zone.id));

  return {
    accountId,
    zoneId: zone.id,
    zoneName,
    d1,
    gateway,
    rateLimit,
    schema
  };
}

function createCloudflareClient(apiToken) {
  async function request(path, options = {}) {
    const response = await fetch(`${API_ROOT}${path}`, {
      method: options.method || 'GET',
      headers: {
        authorization: `Bearer ${apiToken}`,
        ...(options.body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeoutMs || 20_000)
    });
    const text = await response.text();
    let payload;
    try { payload = text ? JSON.parse(text) : {}; } catch { payload = { success: false, errors: [{ message: text.slice(0, 500) }] }; }
    if (!response.ok || payload?.success === false) {
      const details = [...(payload?.errors || []), ...(payload?.messages || [])]
        .map((item) => item?.message || String(item))
        .join('; ');
      const error = new Error(`Cloudflare API ${options.method || 'GET'} ${path} failed (${response.status}): ${details || text.slice(0, 500)}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  async function optional(path, options = {}) {
    try { return await request(path, options); } catch (error) {
      if (error?.status === 404) return undefined;
      throw error;
    }
  }

  return { request, optional };
}

async function configureOptionalZoneControl(label, configure) {
  try {
    return await configure();
  } catch (error) {
    if (error?.status !== 403) throw error;
    return {
      management: 'unavailable',
      reason: `${label} reconciliation requires a Cloudflare token with zone-level management permission`,
      status: 403
    };
  }
}

async function resolveZone(client, zoneName) {
  const payload = await client.request(`/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=50`);
  const zone = (payload.result || []).find((item) => item.name === zoneName);
  if (!zone?.id) throw new Error(`Cloudflare zone ${zoneName} was not found`);
  return zone;
}

async function configureD1Replication(client, accountId, databaseId) {
  await client.request(`/accounts/${accountId}/d1/database/${databaseId}`, {
    method: 'PUT',
    body: { read_replication: { mode: 'auto' } }
  });
  const verified = await client.request(`/accounts/${accountId}/d1/database/${databaseId}`);
  if (verified.result?.read_replication?.mode !== 'auto') throw new Error('D1 read replication did not become active');
  return { databaseId, readReplication: 'auto' };
}

async function configureAiGateway(client, accountId, gatewayId) {
  const path = `/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(gatewayId)}`;
  const body = {
    cache_invalidate_on_update: true,
    cache_ttl: 0,
    collect_logs: false,
    rate_limiting_interval: AI_GATEWAY_RATE_WINDOW_SECONDS,
    rate_limiting_limit: AI_GATEWAY_RATE_LIMIT,
    rate_limiting_technique: 'sliding'
  };

  try {
    await client.request(path, { method: 'PUT', body });
    const verified = await client.request(path);
    const result = verified.result || {};
    if (result.cache_ttl !== 0 || result.collect_logs !== false) throw new Error('AI Gateway privacy controls are not active');
    if (
      result.rate_limiting_interval !== AI_GATEWAY_RATE_WINDOW_SECONDS
      || result.rate_limiting_limit !== AI_GATEWAY_RATE_LIMIT
      || result.rate_limiting_technique !== 'sliding'
    ) {
      throw new Error('AI Gateway rate limit is not active');
    }
    return {
      id: gatewayId,
      management: 'verified',
      cacheTtl: result.cache_ttl,
      collectLogs: result.collect_logs,
      rateLimit: `${result.rate_limiting_limit}/${result.rate_limiting_interval}s`,
      technique: result.rate_limiting_technique
    };
  } catch (error) {
    const status = Number(error?.status || 0);
    const authCode = Number(error?.payload?.errors?.[0]?.code || 0);
    const managementUnavailable = status === 404 || status === 401 || status === 403 || authCode === 10000;
    if (!managementUnavailable) throw error;
    return {
      id: gatewayId,
      management: 'unavailable',
      reason: status === 404
        ? 'Cloudflare AI Gateway management API is unavailable for this account or credential'
        : 'Cloudflare AI Gateway management requires a credential accepted by the AI Gateway management API; continuing with the strict D1 neuron ledger and per-request privacy controls',
      status: status || undefined,
      code: authCode || undefined,
      perRequestPrivacy: {
        skipCache: true,
        collectLog: false
      }
    };
  }
}

function sovereignRateRule() {
  return {
    ref: RATE_RULE_REF,
    description: 'Sovereign AI message protection within the Cloudflare Free plan',
    expression: '(starts_with(http.request.uri.path, "/api/v1/threads/") and ends_with(http.request.uri.path, "/messages"))',
    action: 'block',
    enabled: true,
    ratelimit: {
      characteristics: ['cf.colo.id', 'ip.src'],
      period: 10,
      requests_per_period: 10,
      mitigation_timeout: 10
    }
  };
}

async function configureFreeRateLimit(client, zoneId) {
  const entrypoint = await client.optional(`/zones/${zoneId}/rulesets/phases/${RATE_PHASE}/entrypoint`);
  const rule = sovereignRateRule();
  let ruleset;
  if (!entrypoint?.result?.id) {
    const created = await client.request(`/zones/${zoneId}/rulesets`, {
      method: 'POST',
      body: {
        name: 'Sovereign free-tier rate limiting',
        description: 'Single Free-plan rate limiting ruleset owned by Sovereign.OS',
        kind: 'zone',
        phase: RATE_PHASE,
        rules: [rule]
      }
    });
    ruleset = created.result;
  } else {
    const current = entrypoint.result;
    const unrelated = (current.rules || []).filter((item) => item.ref !== RATE_RULE_REF);
    if (unrelated.length > 0) {
      throw new Error('The Free-plan rate-limit slot is occupied by an unrelated rule; refusing to silently remove it');
    }
    const updated = await client.request(`/zones/${zoneId}/rulesets/${current.id}`, {
      method: 'PUT',
      body: {
        name: current.name || 'Sovereign free-tier rate limiting',
        description: current.description || 'Single Free-plan rate limiting ruleset owned by Sovereign.OS',
        kind: 'zone',
        phase: RATE_PHASE,
        rules: [rule]
      }
    });
    ruleset = updated.result;
  }

  const active = (ruleset?.rules || []).find((item) => item.ref === RATE_RULE_REF);
  if (!active?.enabled) throw new Error('The Sovereign Free-plan rate-limit rule is not active');
  return {
    management: 'verified',
    rulesetId: ruleset.id,
    ruleId: active.id,
    threshold: '10 matching-path requests/10s/IP',
    mitigation: 'block 10s'
  };
}

async function configureApiShield(client, zoneId) {
  const source = readFileSync(resolve(root, 'docs/api-shield/sovereign-critical-api.openapi.yaml'), 'utf8');
  const listed = await client.request(`/zones/${zoneId}/schema_validation/schemas?per_page=50&omit_source=true`);
  for (const existing of (listed.result || []).filter((item) => item.name === SCHEMA_NAME)) {
    await client.request(`/zones/${zoneId}/schema_validation/schemas/${existing.schema_id}`, { method: 'DELETE' });
  }

  const uploaded = await client.request(`/zones/${zoneId}/schema_validation/schemas`, {
    method: 'POST',
    body: {
      kind: 'openapi_v3',
      name: SCHEMA_NAME,
      source,
      validation_enabled: true
    }
  });
  const schemaId = uploaded.result?.schema_id;
  if (!schemaId) throw new Error('API Shield did not return a schema ID');

  await client.request(`/zones/${zoneId}/schema_validation/schemas/${schemaId}`, {
    method: 'PATCH',
    body: { validation_enabled: true }
  });

  const operationsPayload = await client.request(`/zones/${zoneId}/api_gateway/operations?feature=schema_info&page=1&per_page=5000`);
  const existing = operationsPayload.result || [];
  const missing = CRITICAL_OPERATIONS
    .filter(([method, endpoint]) => !existing.some((item) => apiShieldOperationMatches(item, method, endpoint)))
    .map(([method, endpoint]) => ({ method, host: 'app.defrag.app', endpoint }));
  if (missing.length) {
    await client.request(`/zones/${zoneId}/api_gateway/operations`, { method: 'POST', body: missing });
  }

  await client.request(`/zones/${zoneId}/schema_validation/settings`, {
    method: 'PUT',
    body: { validation_default_mitigation_action: 'block' }
  });

  const [schemaVerification, settingVerification, operationVerification] = await Promise.all([
    client.request(`/zones/${zoneId}/schema_validation/schemas/${schemaId}?omit_source=true`),
    client.request(`/zones/${zoneId}/schema_validation/settings`),
    client.request(`/zones/${zoneId}/api_gateway/operations?feature=schema_info&page=1&per_page=5000`)
  ]);
  if (schemaVerification.result?.validation_enabled !== true) throw new Error('API Shield schema is not active');
  if (settingVerification.result?.validation_default_mitigation_action !== 'block') throw new Error('API Shield blocking is not active');
  const managed = operationVerification.result || [];
  const missingAfter = CRITICAL_OPERATIONS.filter(([method, endpoint]) => !managed.some((item) => apiShieldOperationMatches(item, method, endpoint)));
  if (missingAfter.length) throw new Error(`API Shield Endpoint Management is missing ${missingAfter.length} critical operations`);

  return {
    management: 'verified',
    schemaId,
    active: true,
    mitigation: 'block',
    managedOperations: CRITICAL_OPERATIONS.length
  };
}

async function main() {
  const result = await configureCloudflareFreeTier();
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
