import worker, { ThreadCoordinator, queue, scheduled } from './entry';
import type { Env } from './env';
import { withSecurityHeaders } from './security/headers';
import { resolveAiModelConfig } from '@sovereign/agent-contracts';

const HEALTH_PATHS = new Set(['/health', '/healthz', '/ready']);
const DISABLED_PATH_PREFIXES = ['/api/v1/export-jobs'];
const PARENT_HOSTS = new Set(['defrag.app', 'www.defrag.app']);
const PUBLIC_HOST = 'sovereign.defrag.app';
const APP_HOST = 'app.defrag.app';
const PUBLIC_PATHS = new Set(['/privacy', '/terms', '/pricing.html', '/faq.html', '/how-it-works.html']);

const runtime = {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const routed = routeHostname(request, url);
    if (routed) return routed;

    if (DISABLED_PATH_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
      return withSecurityHeaders(Response.json({ error: 'not_found' }, { status: 404 }));
    }

    if (request.method !== 'GET' || !HEALTH_PATHS.has(url.pathname)) {
      return worker.fetch(request, env, executionContext);
    }

    try {
      const db = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
      const aiConfig = resolveAiModelConfig(env);
      const authConfigured = Boolean(
        env.SESSION_SIGNING_SECRET
        && env.TURNSTILE_SECRET_KEY
        && env.EMAIL_API_URL
        && env.EMAIL_API_TOKEN
        && env.EMAIL_FROM
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
        durableObjects: env.THREADS ? 'configured' : 'missing',
        assets: env.ASSETS ? 'configured' : 'missing',
        ai: aiConfig.provider === 'cloudflare-gateway' && env.AI && env.AI_GATEWAY_ID ? 'configured' : 'missing',
        aiGateway: env.AI_GATEWAY_ID ? 'configured' : 'missing',
        baselineEngine: env.BASELINE_HORIZONS_URL ? 'configured' : 'missing',
        baselineObserver: 'Earth geocenter 500@399',
        birthplaceGeocoder: 'disabled',
        authentication: authConfigured ? 'configured' : 'missing',
        legacySovvAdapter: env.SOVV_INTERNAL_BASE_URL ? 'configured' : 'disabled',
        stripe: stripeConfigured ? 'configured' : 'missing',
        scripture: env.SCRIPTURE_TRANSLATION || 'WEB',
        privateExports: 'disabled',
        sharing: 'public-link-only'
      };
      const ok = db?.ok === 1;
      const ready = ok
        && dependencies.durableObjects === 'configured'
        && dependencies.assets === 'configured'
        && dependencies.ai === 'configured'
        && dependencies.baselineEngine === 'configured'
        && dependencies.authentication === 'configured'
        && dependencies.stripe === 'configured';
      return withSecurityHeaders(Response.json({
        ok,
        ...(url.pathname === '/ready' ? { ready } : {}),
        version: env.APP_VERSION,
        environment: env.APP_ENV,
        migrationVersion: '0008_identity_bound_invitations',
        recognitionContract: 'inner-recognition-v1',
        baselineContract: 'openapi-baseline-engine-v2',
        dependencies
      }));
    } catch {
      return withSecurityHeaders(Response.json({
        ok: false,
        ...(url.pathname === '/ready' ? { ready: false } : {}),
        version: env.APP_VERSION,
        environment: env.APP_ENV,
        error: 'health_check_failed'
      }, { status: 503 }));
    }
  }
};

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
  return pathname === '/app'
    || pathname.startsWith('/app/')
    || pathname === '/login'
    || pathname === '/signup'
    || pathname === '/invitation'
    || pathname.startsWith('/auth/')
    || pathname.startsWith('/api/');
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
