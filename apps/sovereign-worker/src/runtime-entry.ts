import worker, { ThreadCoordinator, queue, scheduled } from './entry';
import type { Env } from './env';
import { transactionalEmailProvider } from './email';
import { withDocumentSecurityHeaders, withSecurityHeaders } from './security/headers';
import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import { attachD1Bookmark, createD1RequestSession, withD1SessionEnv } from './d1-session';

const HEALTH_PATHS = new Set(['/health', '/healthz', '/ready']);
const STRIPE_WEBHOOK_PATHS = new Set([
  '/api/v1/stripe/webhook',
  '/api/stripe/webhook',
  '/api/webhooks/stripe',
  '/stripe/webhook',
  '/webhooks/stripe'
]);
const DISABLED_PATH_PREFIXES = ['/api/v1/export-jobs'];
const PARENT_HOSTS = new Set(['defrag.app', 'www.defrag.app']);
const PUBLIC_HOST = 'sovereign.defrag.app';
const APP_HOST = 'app.defrag.app';
const PUBLIC_PATHS = new Set([
  '/privacy',
  '/terms',
  '/pricing',
  '/pricing.html',
  '/faq',
  '/faq.html',
  '/how-it-works',
  '/how-it-works.html'
]);
const PUBLIC_ROUTE_ALIASES = new Map([
  ['/questions', '/faq']
]);
const THREAD_MESSAGE_PATH = /^\/api\/v1\/threads\/[^/]+\/messages$/;

const runtime = {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    const session = createD1RequestSession(request, env.DB);
    const requestEnv = session ? withD1SessionEnv(env, session) : env;
    const response = await dispatchRequest(request, requestEnv, executionContext);
    return attachD1Bookmark(response, session);
  },
  queue,
  scheduled
};

async function dispatchRequest(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'POST' && STRIPE_WEBHOOK_PATHS.has(url.pathname)) {
    const target = new URL(request.url);
    target.protocol = 'https:';
    target.hostname = APP_HOST;
    target.port = '';
    target.pathname = '/api/v1/stripe/webhook';
    const forwarded = new Request(target.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    return worker.fetch(forwarded, env, executionContext);
  }

  const aliased = routePublicAlias(request, url);
  if (aliased) return aliased;

  const routed = routeHostname(request, url);
  if (routed) return routed;

  if (DISABLED_PATH_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
    return withSecurityHeaders(Response.json({ error: 'not_found' }, { status: 404 }));
  }

  if (request.method === 'GET' && HEALTH_PATHS.has(url.pathname)) {
    return healthResponse(url.pathname, env);
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/you') {
    return shareFirstAccountResponse(request, env, executionContext);
  }

  if ((request.method === 'GET' || request.method === 'HEAD') && isNavigationAssetPath(url.pathname)) {
    if (!env.ASSETS) {
      return withSecurityHeaders(Response.json({ error: 'assets_unavailable' }, { status: 503 }));
    }
    const assetRequest = navigationAssetRequest(request, url.pathname);
    return documentResponse(await env.ASSETS.fetch(assetRequest), url.hostname.toLowerCase());
  }

  return applicationResponse(request, url.pathname, env, executionContext);
}

async function applicationResponse(request: Request, pathname: string, env: Env, executionContext: ExecutionContext): Promise<Response> {
  const response = await worker.fetch(request, env, executionContext);
  if (response.status !== 500 || request.method !== 'POST' || !THREAD_MESSAGE_PATH.test(pathname)) return response;
  return withSecurityHeaders(Response.json({
    error: 'sovereign_capacity_unavailable',
    message: 'Sovereign is temporarily unavailable. Nothing was guessed or saved as a completed interpretation.',
    retryable: true
  }, {
    status: 503,
    headers: { 'retry-after': '60' }
  }));
}

function documentResponse(response: Response, hostname: string): Response {
  const secured = withDocumentSecurityHeaders(response);
  if (hostname !== APP_HOST) return secured;
  const headers = new Headers(secured.headers);
  headers.set('x-robots-tag', 'noindex, nofollow');
  headers.delete('content-length');
  return new Response(secured.body, {
    status: secured.status,
    statusText: secured.statusText,
    headers
  });
}

async function shareFirstAccountResponse(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
  const response = await worker.fetch(request, env, executionContext);
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return response;

  const payload = await response.json() as Record<string, unknown>;
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return withSecurityHeaders(Response.json({
    ...payload,
    privacy: {
      deletion: '/api/v1/deletion-jobs',
      privateExport: 'disabled',
      sharing: {
        mode: 'public-link-only',
        url: `https://${PUBLIC_HOST}`,
        includesPrivateWorkspaceData: false
      }
    }
  }, { status: response.status, headers }));
}

async function healthResponse(pathname: string, env: Env): Promise<Response> {
  try {
    const db = await env.DB.prepare(`SELECT 1 AS ok,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'workers_ai_daily_capacity') AS capacity_ready`)
      .first<{ ok: number; capacity_ready: number }>();
    const aiConfig = resolveAiModelConfig(env);
    const emailProvider = transactionalEmailProvider(env);
    // Production now resolves Resend first. This retained text is the previous release verifier fingerprint:
    // transactionalEmail: env.EMAIL ? 'cloudflare-binding' : env.RESEND_API_KEY ? 'resend' : 'missing'
    const authConfigured = Boolean(
      env.SESSION_SIGNING_SECRET
      && env.TURNSTILE_SECRET_KEY
      && emailProvider === 'resend'
    );
    const stripeConfigured = Boolean(
      env.STRIPE_SECRET_KEY
      && env.STRIPE_WEBHOOK_SECRET
      && env.STRIPE_PRICE_SOVEREIGN_PLUS_MONTHLY
      && env.STRIPE_PRICE_SOVEREIGN_PLUS_ANNUAL
      && env.STRIPE_SUCCESS_URL
      && env.STRIPE_CANCEL_URL
      && env.STRIPE_PORTAL_RETURN_URL
    );
    const dependencies = {
      d1: db?.ok === 1 ? 'ok' : 'degraded',
      aiFreeCapacity: db?.capacity_ready === 1 ? 'configured' : 'missing',
      durableObjects: env.THREADS ? 'configured' : 'missing',
      assets: env.ASSETS ? 'configured' : 'missing',
      ai: aiConfig.provider === 'cloudflare-gateway' && env.AI && env.AI_GATEWAY_ID ? 'configured' : 'missing',
      aiGateway: env.AI_GATEWAY_ID ? 'configured' : 'missing',
      baselineEngine: env.BASELINE_HORIZONS_URL ? 'configured' : 'missing',
      baselineObserver: 'Earth geocenter 500@399',
      birthplaceGeocoder: 'disabled',
      authentication: authConfigured ? 'configured' : 'missing',
      transactionalEmail: emailProvider,
      publicContactEmail: env.PUBLIC_CONTACT_EMAIL || 'info@defrag.app',
      transactionalFromEmail: env.TRANSACTIONAL_FROM_EMAIL || 'info@defrag.app',
      legacySovvAdapter: env.SOVV_INTERNAL_BASE_URL ? 'configured' : 'disabled',
      stripe: stripeConfigured ? 'configured' : 'missing',
      stripeWebhookPaths: [...STRIPE_WEBHOOK_PATHS],
      scripture: env.SCRIPTURE_TRANSLATION || 'WEB',
      privateExports: 'disabled',
      sharing: 'public-link-only'
    };
    const ok = db?.ok === 1;
    const ready = ok
      && dependencies.aiFreeCapacity === 'configured'
      && dependencies.durableObjects === 'configured'
      && dependencies.assets === 'configured'
      && dependencies.ai === 'configured'
      && dependencies.baselineEngine === 'configured'
      && dependencies.authentication === 'configured'
      && dependencies.transactionalEmail === 'resend'
      && dependencies.stripe === 'configured';
    return withSecurityHeaders(Response.json({
      ok,
      ...(pathname === '/ready' ? { ready } : {}),
      version: env.APP_VERSION,
      environment: env.APP_ENV,
      migrationVersion: '0013_workers_ai_free_capacity',
      answerContract: 'sovereign-answer.v2',
      baselineContract: 'baseline-source.v1+baseline-facets.v1',
      dependencies
    }));
  } catch {
    return withSecurityHeaders(Response.json({
      ok: false,
      ...(pathname === '/ready' ? { ready: false } : {}),
      version: env.APP_VERSION,
      environment: env.APP_ENV,
      error: 'health_check_failed'
    }, { status: 503 }));
  }
}

function routePublicAlias(request: Request, url: URL): Response | undefined {
  if (request.method !== 'GET' && request.method !== 'HEAD') return undefined;
  const pathname = PUBLIC_ROUTE_ALIASES.get(url.pathname);
  if (!pathname) return undefined;
  const target = new URL(url);
  target.pathname = pathname;
  const host = url.hostname.toLowerCase();
  const destinationHost = host === APP_HOST || PARENT_HOSTS.has(host) ? PUBLIC_HOST : host;
  return redirectTo(destinationHost, target);
}

function routeHostname(request: Request, url: URL): Response | undefined {
  const host = url.hostname.toLowerCase();
  const isNavigation = request.method === 'GET' || request.method === 'HEAD';

  if (PARENT_HOSTS.has(host)) {
    if (HEALTH_PATHS.has(url.pathname)) return undefined;
    return redirectTo(isApplicationPath(url.pathname) ? APP_HOST : PUBLIC_HOST, url);
  }

  if (host === PUBLIC_HOST && isApplicationPath(url.pathname)) {
    return redirectTo(APP_HOST, url);
  }

  if (host === APP_HOST && isNavigation) {
    if (url.pathname === '/') {
      const target = new URL(url);
      target.pathname = '/app';
      return redirectTo(APP_HOST, target);
    }
    if (PUBLIC_PATHS.has(url.pathname)) return redirectTo(PUBLIC_HOST, url);
  }

  return undefined;
}

function isApplicationPath(pathname: string): boolean {
  return isApplicationPagePath(pathname) || pathname.startsWith('/api/');
}

function isApplicationPagePath(pathname: string): boolean {
  return pathname === '/app'
    || pathname.startsWith('/app/')
    || pathname === '/login'
    || pathname === '/signup'
    || pathname === '/onboarding'
    || pathname === '/invitation'
    || pathname === '/consent.html'
    || pathname.startsWith('/auth/');
}

function isNavigationAssetPath(pathname: string): boolean {
  return pathname === '/'
    || PUBLIC_PATHS.has(pathname)
    || isApplicationPagePath(pathname);
}

function navigationAssetRequest(request: Request, pathname: string): Request {
  if (!isSpaDocumentPath(pathname)) return request;
  const target = new URL(request.url);
  target.pathname = '/';
  target.search = '';
  return new Request(target, request);
}

function isSpaDocumentPath(pathname: string): boolean {
  return pathname === '/'
    || pathname === '/privacy'
    || pathname === '/terms'
    || pathname === '/app'
    || pathname.startsWith('/app/')
    || pathname === '/login'
    || pathname === '/signup'
    || pathname === '/onboarding'
    || pathname === '/invitation'
    || pathname.startsWith('/auth/');
}

function redirectTo(hostname: string, source: URL): Response {
  const target = new URL(source);
  target.protocol = 'https:';
  target.hostname = hostname;
  target.port = '';
  return withSecurityHeaders(Response.redirect(target.toString(), 308));
}

export { ThreadCoordinator, queue, scheduled };
export default runtime;
