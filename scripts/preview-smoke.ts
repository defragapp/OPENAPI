const baseUrl = process.env.PREVIEW_BASE_URL;
const sessionCookie = process.env.PREVIEW_SESSION_COOKIE;
const accessClientId = process.env.CF_ACCESS_CLIENT_ID;
const accessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

if (!baseUrl) throw new Error('PREVIEW_BASE_URL is required');
if (!sessionCookie) throw new Error('PREVIEW_SESSION_COOKIE is required');
if ((accessClientId && !accessClientSecret) || (!accessClientId && accessClientSecret)) throw new Error('Both Cloudflare Access service-token values are required together');

const origin = new URL(baseUrl).origin;
const accessHeaders: Record<string, string> = accessClientId && accessClientSecret ? {
  'CF-Access-Client-Id': accessClientId,
  'CF-Access-Client-Secret': accessClientSecret
} : {};

async function request(path: string, init: RequestInit = {}, expected = 200, authenticated = true) {
  const res = await fetch(new URL(path, origin), {
    ...init,
    headers: {
      ...accessHeaders,
      ...(authenticated ? { cookie: sessionCookie } : {}),
      origin,
      'content-type': 'application/json',
      'x-idempotency-key': crypto.randomUUID(),
      ...(init.headers ?? {})
    }
  });
  if (res.status !== expected) throw new Error(`${path} expected ${expected}, got ${res.status}: ${await safeText(res)}`);
  return res;
}

async function json(path: string, init: RequestInit = {}, expected = 200, authenticated = true) {
  return request(path, init, expected, authenticated).then((res) => res.json() as Promise<any>);
}

async function safeText(res: Response) {
  const text = await res.text();
  return text.slice(0, 500)
    .replace(/__Host-sovereign_session=[^;\s]+/g, '__Host-sovereign_session=[redacted]')
    .replace(/CF-Access-Client-(Id|Secret)[^\s]*/gi, 'CF-Access-Client-$1=[redacted]');
}

function assertNoSensitiveText(label: string, value: string) {
  for (const pattern of [/cloudflare_api_token/i, /raw birth/i, /latitude/i, /longitude/i, /hidden reasoning/i, /stack trace/i]) {
    if (pattern.test(value)) throw new Error(`${label} exposed sensitive text: ${pattern}`);
  }
}

async function assertPublicPage(path: string, fingerprint: string) {
  const res = await request(path, {}, 200, false);
  const text = await res.text();
  if (!text.includes(fingerprint)) throw new Error(`${path} missing public fingerprint`);
  assertNoSensitiveText(path, text);
}

async function verifyFreeGates() {
  await request('/api/v1/people', { method: 'POST', body: JSON.stringify({ displayName: 'Blocked Free Person', role: 'friend' }) }, 403);
  await request('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name: 'Blocked Free System', systemType: 'family' }) }, 403);
  await request('/api/v1/library', { method: 'POST', body: JSON.stringify({ title: 'Blocked Free Save', summary: 'Must remain unavailable.' }) }, 403);
  await request('/api/v1/export-jobs', { method: 'POST' }, 404);
}

async function verifyPaidCapabilities() {
  const person = (await json('/api/v1/people', { method: 'POST', body: JSON.stringify({ displayName: 'Preview Avery', role: 'friend', metadata: { source: 'preview-smoke' } }) }, 201)).person;
  const people = await json('/api/v1/people');
  if (!people.people?.some((item: { id: string }) => item.id === person.id)) throw new Error('Paid People record was not readable');

  const family = (await json('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name: 'Preview family', systemType: 'family' }) }, 201)).system;
  const systems = await json('/api/v1/systems');
  if (!systems.systems?.some((item: { id: string }) => item.id === family.id)) throw new Error('Paid System record was not readable');
  await request(`/api/v1/systems/${family.id}/alignment`, {}, 409);

  const saved = (await json('/api/v1/library', { method: 'POST', body: JSON.stringify({ title: 'Preview understanding', summary: 'A user-approved preview summary.' }) }, 201)).saved;
  await json('/api/v1/library');
  await json(`/api/v1/library/${saved.id}`, { method: 'PATCH', body: JSON.stringify({ title: 'Renamed preview understanding' }) });
  await request(`/api/v1/library/${saved.id}`, { method: 'DELETE' });
  await request('/api/v1/export-jobs', { method: 'POST' }, 404);

  const covenant = await json('/api/v1/threads/preview-covenant/covenant', { method: 'POST', body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', reference: 'James 1:5', subject: 'preview decision' }) });
  if (!covenant.scriptureSeparateFromInterpretation || !covenant.lens?.passage?.citation) throw new Error('Paid Covenant citation separation failed');
}

async function main() {
  await assertPublicPage('/', 'SOVEREIGN.OS');
  await assertPublicPage('/how-it-works.html', 'How it works');
  await assertPublicPage('/pricing.html', 'Sovereign+');
  await assertPublicPage('/faq.html', 'Clear answers before you begin.');

  const health = await json('/health', {}, 200, false);
  const ready = await json('/ready', {}, 200, false);
  assertNoSensitiveText('health', JSON.stringify(health));
  assertNoSensitiveText('ready', JSON.stringify(ready));
  if (!health.ok || !ready.ok) throw new Error('health/readiness failed');

  await request('/api/v1/people', {}, 401, false);

  const today = await json('/api/v1/today');
  if (!Array.isArray(today.today?.separation) || !today.today.separation.some((value: string) => value.includes('Baseline'))) throw new Error('Today did not include Baseline context');

  for (const topic of ['identity', 'decisions', 'communication', 'pressure response']) {
    const explore = await json('/api/v1/explore', { method: 'POST', body: JSON.stringify({ topic }) });
    if (!explore.plainLanguage?.includes(topic)) throw new Error(`Explore ${topic} missing plain language`);
  }

  const billing = await json('/api/v1/billing/entitlements');
  const paid = billing.effective?.plan === 'sovereign_plus';
  if (paid) await verifyPaidCapabilities(); else await verifyFreeGates();

  if (process.env.PREVIEW_EXPECT_STRIPE === '1') {
    const checkout = await json('/api/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ interval: 'monthly' }) }, 201);
    if (!checkout.checkout?.url) throw new Error('Stripe Checkout did not return a handoff URL');
  }

  const defaultCovenant = await json('/api/v1/threads/preview-covenant-default/covenant', { method: 'POST', body: JSON.stringify({ enabled: false }) });
  if (defaultCovenant.covenantEnabled !== false) throw new Error('Covenant must be disabled by default');
  if (!paid) await request('/api/v1/threads/preview-covenant/covenant', { method: 'POST', body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', reference: 'James 1:5', subject: 'preview decision' }) }, 403);
  await request('/api/v1/covenant/scripture/Imaginary%201:1', {}, 404);

  const deletion = (await json('/api/v1/deletion-jobs', { method: 'POST' }, 202)).deletionJob;
  await json(`/api/v1/deletion-jobs/${deletion.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'cancel' }) });

  const turnKey = `preview-turn-${Date.now()}`;
  const messageRes = await request('/api/v1/threads/preview-live/messages', { method: 'POST', headers: { 'x-idempotency-key': turnKey }, body: JSON.stringify({ message: 'Show me Today without requiring an incident.', context: { surface: 'Today' } }) }, 202);
  if (!messageRes.body) throw new Error('Sovereign response did not stream');
  const reader = messageRes.body.getReader();
  const decoder = new TextDecoder();
  let chunks = 0;
  let streamed = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks += 1;
    streamed += decoder.decode(value, { stream: true });
  }
  assertNoSensitiveText('streamed Sovereign response', streamed);
  const questionResponse = streamed.includes('WHAT I NOTICE') && streamed.includes('LOOK INWARD');
  const integrationResponse = streamed.includes('WHAT THIS MAY BE SHOWING') && streamed.includes('A CLEARER FORM') && streamed.includes('WHAT TO DO');
  if (chunks < 1 || (!questionResponse && !integrationResponse)) throw new Error('Sovereign streamed response did not match the validated recognition contract');
  const duplicate = await request('/api/v1/threads/preview-live/messages', { method: 'POST', headers: { 'x-idempotency-key': turnKey }, body: JSON.stringify({ message: 'Duplicate turn', context: { surface: 'Today' } }) }, 200);
  if (!JSON.stringify(await duplicate.json()).includes('duplicate')) throw new Error('duplicate turn was not reported');
  await json('/api/v1/threads/preview-live/corrections', { method: 'POST', body: JSON.stringify({ correction: 'partly' }) });

  console.log(`Preview smoke passed access=${Boolean(accessClientId)} public_pages=true health=true plan=${paid ? 'sovereign_plus' : 'free'} paid_capabilities=${paid} stream_chunks=${chunks}`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
