const baseUrl = process.env.PREVIEW_BASE_URL?.replace(/\/$/, '');
if (!baseUrl) throw new Error('PREVIEW_BASE_URL is required');

const clientId = process.env.CF_ACCESS_CLIENT_ID;
const clientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

const unauthenticated = await fetch(`${baseUrl}/`, { redirect: 'manual' });
const location = unauthenticated.headers.get('location') ?? '';
const protectedStatus = [301, 302, 303, 307, 308, 401, 403].includes(unauthenticated.status);
const accessRedirect = /cloudflareaccess\.com|\/cdn-cgi\/access\//i.test(location);

if (!protectedStatus || (location && !accessRedirect)) {
  throw new Error(`Preview is not demonstrably protected by Cloudflare Access (status ${unauthenticated.status})`);
}

if (!clientId || !clientSecret) {
  console.log('Cloudflare Access perimeter verified. Authenticated content check skipped because service-token variables are absent.');
  process.exit(0);
}

const headers = {
  'CF-Access-Client-Id': clientId,
  'CF-Access-Client-Secret': clientSecret
};

const landing = await fetch(`${baseUrl}/`, { headers, redirect: 'manual' });
if (!landing.ok) throw new Error(`Authenticated preview landing failed with ${landing.status}`);
const html = await landing.text();
if (!html.includes('SOVEREIGN.OS')) throw new Error('Authenticated preview landing did not contain the product fingerprint');

const health = await fetch(`${baseUrl}/health`, { headers, redirect: 'manual' });
if (!health.ok) throw new Error(`Authenticated preview health failed with ${health.status}`);
const payload = await health.json().catch(() => null);
if (!payload || payload.ok !== true) throw new Error('Authenticated preview health payload is invalid');

console.log('Cloudflare Access perimeter and authenticated preview content verified.');
