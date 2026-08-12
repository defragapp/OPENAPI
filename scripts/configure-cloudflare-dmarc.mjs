import { pathToFileURL } from 'node:url';

const DOH_ROOT = 'https://cloudflare-dns.com/dns-query';
const ZONE_NAME = 'defrag.app';
const RECORD_NAME = '_dmarc.defrag.app';
const RECORD_CONTENT = 'v=DMARC1; p=none; sp=none; adkim=s; aspf=s; pct=100';

function decodeTxtData(value) {
  const source = String(value || '').trim();
  const chunks = [...source.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) => {
    try {
      return JSON.parse(`"${match[1]}"`);
    } catch {
      return match[1];
    }
  });
  return chunks.length ? chunks.join('') : source;
}

export async function configureCloudflareDmarc(options = {}) {
  const zoneName = String(options.zoneName || ZONE_NAME).trim();
  const recordName = `_dmarc.${zoneName}`;
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(`${DOH_ROOT}?name=${encodeURIComponent(recordName)}&type=TXT`, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(options.timeoutMs || 20_000)
  });
  if (!response.ok) {
    throw new Error(`Public DNS lookup for ${recordName} failed (${response.status})`);
  }

  const payload = await response.json();
  if (payload?.Status !== 0) {
    throw new Error(`Public DNS lookup for ${recordName} returned status ${String(payload?.Status ?? 'unknown')}`);
  }

  const records = (payload.Answer || [])
    .filter((answer) => Number(answer?.type) === 16 && String(answer?.name || '').replace(/\.$/, '') === recordName)
    .map((answer) => ({ content: decodeTxtData(answer.data), ttl: Number(answer.ttl ?? answer.TTL ?? 0) }));
  if (records.length !== 1 || records[0].content !== RECORD_CONTENT) {
    throw new Error(`Public DNS must serve exactly one verified ${recordName} TXT record`);
  }

  return {
    zoneName,
    recordName,
    content: RECORD_CONTENT,
    ttl: records[0].ttl,
    operation: 'verified-public-dns'
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
