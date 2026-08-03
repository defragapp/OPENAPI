import { pathToFileURL } from 'node:url';

const API_ROOT = 'https://api.cloudflare.com/client/v4';
const ZONE_NAME = 'defrag.app';
const RECORD_NAME = '_dmarc.defrag.app';
const RECORD_CONTENT = 'v=DMARC1; p=none; sp=none; adkim=s; aspf=s; pct=100';

function requiredEnvironment(name, fallbacks = []) {
  for (const candidate of [name, ...fallbacks]) {
    const value = String(process.env[candidate] || '').trim();
    if (value) return value;
  }
  throw new Error(`${name} is required to reconcile DMARC`);
}

function createClient(apiToken) {
  return async function request(path, options = {}) {
    const response = await fetch(`${API_ROOT}${path}`, {
      method: options.method || 'GET',
      headers: {
        authorization: `Bearer ${apiToken}`,
        ...(options.body === undefined ? {} : { 'content-type': 'application/json' })
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
      throw new Error(`Cloudflare API ${options.method || 'GET'} ${path} failed (${response.status}): ${details || text.slice(0, 500)}`);
    }
    return payload;
  };
}

export async function configureCloudflareDmarc(options = {}) {
  const apiToken = String(options.apiToken || process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '').trim()
    || requiredEnvironment('CLOUDFLARE_API_TOKEN', ['CF_API_TOKEN']);
  const zoneName = String(options.zoneName || ZONE_NAME).trim();
  const recordName = `_dmarc.${zoneName}`;
  const request = createClient(apiToken);

  const zones = await request(`/zones?name=${encodeURIComponent(zoneName)}&status=active&per_page=50`);
  const zone = (zones.result || []).find((item) => item.name === zoneName);
  if (!zone?.id) throw new Error(`Cloudflare zone ${zoneName} was not found`);

  const listed = await request(`/zones/${zone.id}/dns_records?type=TXT&name=${encodeURIComponent(recordName)}&per_page=100`);
  const existing = listed.result || [];
  if (existing.length > 1) throw new Error(`Multiple DMARC TXT records exist for ${recordName}; refusing an ambiguous mutation`);

  let operation = 'verified';
  if (existing.length === 0) {
    await request(`/zones/${zone.id}/dns_records`, {
      method: 'POST',
      body: { type: 'TXT', name: recordName, content: RECORD_CONTENT, ttl: 3600 }
    });
    operation = 'created';
  } else if (String(existing[0].content || '') !== RECORD_CONTENT) {
    await request(`/zones/${zone.id}/dns_records/${existing[0].id}`, {
      method: 'PATCH',
      body: { type: 'TXT', name: recordName, content: RECORD_CONTENT, ttl: 3600 }
    });
    operation = 'updated';
  }

  const verified = await request(`/zones/${zone.id}/dns_records?type=TXT&name=${encodeURIComponent(recordName)}&per_page=100`);
  const records = verified.result || [];
  if (records.length !== 1 || String(records[0].content || '') !== RECORD_CONTENT) {
    throw new Error(`DMARC reconciliation did not produce one verified ${recordName} TXT record`);
  }

  return {
    zoneId: zone.id,
    zoneName,
    recordId: records[0].id,
    recordName,
    content: RECORD_CONTENT,
    ttl: records[0].ttl,
    operation
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  configureCloudflareDmarc()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
}
