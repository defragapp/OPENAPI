const DEFAULT_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_OUTPUT_LENGTH = 12_000;
const DEFAULT_MAX_RESPONSE_LENGTH = 1_000;

export function sanitizeReleaseReportOutput(value) {
  return String(value || '')
    .replace(/cfat_[A-Za-z0-9_-]+/g, '[redacted-cloudflare-token]')
    .replace(/\bsk-(?:live|test|proj)?[_A-Za-z0-9-]+/g, '[redacted-api-key]')
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/(CLOUDFLARE_API_TOKEN|CF_API_TOKEN|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|RESEND_API_KEY)=\S+/g, '$1=[redacted]');
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function responseText(response) {
  try {
    return sanitizeReleaseReportOutput(await response.text()).slice(-DEFAULT_MAX_RESPONSE_LENGTH);
  } catch {
    return '';
  }
}

export async function deliverReleaseReport({
  url,
  key,
  sha,
  phase,
  stage,
  status,
  output = '',
  fetchImpl = fetch,
  attempts = DEFAULT_ATTEMPTS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  delayImpl = delay
}) {
  if (!url || !key) throw new Error('release report delivery requires a URL and key');
  if (!/^[0-9a-f]{40}$/i.test(String(sha || ''))) throw new Error('release report delivery requires a full commit SHA');
  if (!phase || !stage || !status) throw new Error('release report delivery requires phase, stage, and status');

  const payload = JSON.stringify({
    key,
    sha,
    phase,
    stage,
    status,
    output: sanitizeReleaseReportOutput(output).slice(-DEFAULT_MAX_OUTPUT_LENGTH)
  });

  let lastResult = {
    ok: false,
    attempt: 0,
    httpStatus: 0,
    responseText: '',
    error: 'release report delivery was not attempted'
  };

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        signal: AbortSignal.timeout(timeoutMs)
      });
      const body = await responseText(response);
      if (response.ok) {
        return {
          ok: true,
          attempt,
          httpStatus: response.status,
          responseText: body,
          error: ''
        };
      }
      lastResult = {
        ok: false,
        attempt,
        httpStatus: response.status,
        responseText: body,
        error: `HTTP ${response.status}`
      };
    } catch (cause) {
      lastResult = {
        ok: false,
        attempt,
        httpStatus: 0,
        responseText: '',
        error: sanitizeReleaseReportOutput(cause instanceof Error ? cause.message : String(cause))
      };
    }

    if (attempt < attempts) await delayImpl(attempt * 1_000);
  }

  return lastResult;
}

export function formatReleaseReportDelivery(result, { phase, stage, status }) {
  const delivery = result.ok ? 'success' : 'failure';
  const details = [
    `phase=${phase}`,
    `stage=${stage}`,
    `status=${status}`,
    `delivery=${delivery}`,
    `attempt=${result.attempt}`,
    `http=${result.httpStatus || 'none'}`
  ];
  if (result.error) details.push(`error=${sanitizeReleaseReportOutput(result.error)}`);
  if (result.responseText) details.push(`response=${sanitizeReleaseReportOutput(result.responseText)}`);
  return `[cloudflare-release-report] ${details.join(' ')}`;
}
