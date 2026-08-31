const sharedSecurityHeaders = {
  'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-resource-policy': 'same-origin'
} as const;

export const securityHeaders = {
  ...sharedSecurityHeaders,
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()'
} as const;

export const documentSecurityHeaders = {
  ...sharedSecurityHeaders,
  'content-security-policy': "default-src 'self'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com https://cloudflareinsights.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(self)'
} as const;

function applyHeaders(response: Response, values: Record<string, string>, cacheControl: string): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(values)) headers.set(name, value);
  headers.set('cache-control', cacheControl);
  if (cacheControl.includes('no-store')) {
    headers.set('cdn-cache-control', 'no-store');
    headers.set('cloudflare-cdn-cache-control', 'no-store');
    headers.set('pragma', 'no-cache');
    headers.set('expires', '0');
  }
  headers.delete('content-length');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function withSecurityHeaders(response: Response): Response {
  return applyHeaders(response, securityHeaders, 'no-store');
}

export function withDocumentSecurityHeaders(response: Response): Response {
  return applyHeaders(response, documentSecurityHeaders, 'no-store, no-cache, must-revalidate');
}
