const baseUrl = process.env.PREVIEW_BASE_URL;
const sessionCookie = process.env.PREVIEW_SESSION_COOKIE;

if (!baseUrl) throw new Error('PREVIEW_BASE_URL is required');
if (!sessionCookie) throw new Error('PREVIEW_SESSION_COOKIE is required');

const origin = new URL(baseUrl).origin;

async function request(path: string, init: RequestInit = {}, expected = 200) {
  const res = await fetch(new URL(path, origin), {
    ...init,
    headers: {
      cookie: sessionCookie,
      origin,
      'content-type': 'application/json',
      ...(init.headers ?? {})
    }
  });
  if (res.status !== expected) throw new Error(`${path} expected ${expected}, got ${res.status}: ${await safeText(res)}`);
  return res;
}

async function json(path: string, init: RequestInit = {}, expected = 200) {
  return request(path, init, expected).then((res) => res.json() as Promise<any>);
}

async function safeText(res: Response) {
  const text = await res.text();
  return text.slice(0, 500).replace(/__Host-sovereign_session=[^;\s]+/g, '__Host-sovereign_session=[redacted]');
}

function assertNoSensitiveText(label: string, value: string) {
  for (const pattern of [/cloudflare_api_token/i, /authorization/i, /raw birth/i, /latitude/i, /longitude/i, /hidden reasoning/i, /stack trace/i]) {
    if (pattern.test(value)) throw new Error(`${label} exposed sensitive text: ${pattern}`);
  }
}

async function main() {
  const app = await fetch(origin).then(async (res) => ({ status: res.status, text: await res.text() }));
  if (app.status >= 400 || !app.text.includes('SOVEREIGN.OS')) throw new Error('static application shell did not load');
  assertNoSensitiveText('static app', app.text);

  const health = await json('/health');
  const healthz = await json('/healthz');
  const ready = await json('/ready');
  assertNoSensitiveText('health', JSON.stringify(health));
  assertNoSensitiveText('healthz', JSON.stringify(healthz));
  assertNoSensitiveText('ready', JSON.stringify(ready));
  if (!health.ok || !healthz.ok || !ready.ok || ready.ready !== true) throw new Error('health/readiness failed');

  const unauth = await fetch(new URL('/api/v1/people', origin));
  if (unauth.status !== 401) throw new Error(`unauthenticated private API expected 401, got ${unauth.status}`);

  const today = await json('/api/v1/today');
  if (!JSON.stringify(today).includes('Baseline')) throw new Error('Today did not include Baseline context');

  for (const topic of ['identity', 'decisions', 'communication', 'pressure response']) {
    const explore = await json('/api/v1/explore', { method: 'POST', body: JSON.stringify({ topic }) });
    if (!explore.plainLanguage?.includes(topic)) throw new Error(`Explore ${topic} missing plain language`);
  }

  const person = (await json('/api/v1/people', { method: 'POST', body: JSON.stringify({ displayName: 'Preview Avery', role: 'friend', metadata: { source: 'preview-smoke' } }) }, 201)).person;
  await json(`/api/v1/people/${person.id}/invitations`, { method: 'POST' }, 201);
  for (const scope of ['pair.compare', 'trait.display', 'system.include', 'library.link']) await json(`/api/v1/people/${person.id}/consent/${scope}`, { method: 'PUT', body: JSON.stringify({ granted: true }) });
  await json(`/api/v1/people/${person.id}/compare`, { method: 'POST' });
  await json(`/api/v1/people/${person.id}/consent/pair.compare`, { method: 'PUT', body: JSON.stringify({ granted: false }) });
  await request(`/api/v1/people/${person.id}/compare`, { method: 'POST' }, 403);
  await json(`/api/v1/people/${person.id}/consent/pair.compare`, { method: 'PUT', body: JSON.stringify({ granted: true }) });

  const family = (await json('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name: 'Preview family', systemType: 'family' }) }, 201)).system;
  await json(`/api/v1/systems/${family.id}/members`, { method: 'POST', body: JSON.stringify({ personId: person.id, metadata: { formalRole: 'sibling', authority: 'peer' } }) }, 201);
  const familyAlignment = await json(`/api/v1/systems/${family.id}/alignment`);
  if (!JSON.stringify(familyAlignment).includes('caregiving')) throw new Error('family alignment missing family-aware context');
  const team = (await json('/api/v1/systems', { method: 'POST', body: JSON.stringify({ name: 'Preview team', systemType: 'team', metadata: { authority: 'lead' } }) }, 201)).system;
  const teamAlignment = await json(`/api/v1/systems/${team.id}/alignment`);
  if (!JSON.stringify(teamAlignment).includes('deadlines')) throw new Error('team alignment missing team-aware context');

  const saved = (await json('/api/v1/library', { method: 'POST', body: JSON.stringify({ title: 'Preview insight', summary: 'A user-approved preview summary.', links: { personId: person.id } }) }, 201)).saved;
  await json('/api/v1/library');
  await json(`/api/v1/library/${saved.id}`, { method: 'PATCH', body: JSON.stringify({ title: 'Renamed preview insight', links: {} }) });
  await request(`/api/v1/library/${saved.id}`, { method: 'DELETE' });

  await json('/api/v1/export-jobs', { method: 'POST' }, 202);
  const deletion = (await json('/api/v1/deletion-jobs', { method: 'POST' }, 202)).deletionJob;
  await json(`/api/v1/deletion-jobs/${deletion.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'cancel' }) });
  await json('/api/v1/billing/entitlements');
  await json('/api/v1/billing/stripe-fixture-event', { method: 'POST', body: JSON.stringify({ id: `evt_preview_${Date.now()}`, priceId: 'price_test_sovereign_plus' }) });
  const checkout = await json('/api/v1/billing/checkout', { method: 'POST', body: JSON.stringify({ plan: 'sovereign_plus', idempotencyKey: `preview-${Date.now()}` }) }, 201);
  if (checkout.checkout?.url?.includes('billing.test')) console.log('Billing fixture mode verified; real Stripe Checkout remains pending unless Stripe test secrets are configured.');

  const defaultCovenant = await json('/api/v1/threads/preview-covenant/covenant', { method: 'POST', body: JSON.stringify({ enabled: false }) });
  if (defaultCovenant.covenantEnabled !== false) throw new Error('Covenant must be disabled by default');
  const covenant = await json('/api/v1/threads/preview-covenant/covenant', { method: 'POST', body: JSON.stringify({ enabled: true, bibleTranslation: 'WEB', reference: 'James 1:5', subject: 'preview decision' }) });
  if (!covenant.scriptureSeparateFromInterpretation || !covenant.lens?.passage?.citation) throw new Error('Covenant citation separation failed');
  await request('/api/v1/threads/preview-covenant/covenant/scripture/Imaginary%201:1', {}, 404);

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
  if (chunks < 2 || !streamed.includes('Baseline')) throw new Error(`Sovereign streaming response missing multiple Baseline chunks; chunks=${chunks}`);
  const duplicate = await request('/api/v1/threads/preview-live/messages', { method: 'POST', headers: { 'x-idempotency-key': turnKey }, body: JSON.stringify({ message: 'Duplicate turn', context: { surface: 'Today' } }) }, 200);
  if (!JSON.stringify(await duplicate.json()).includes('duplicate')) throw new Error('duplicate turn was not reported');
  await json('/api/v1/threads/preview-live/corrections', { method: 'POST', body: JSON.stringify({ correction: 'partly' }) });

  console.log(`Preview smoke passed base=${origin} static=true health=true stream_chunks=${chunks} covenant=fixture-or-configured billing=fixture-or-test`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
