import runtime, { ThreadCoordinator, queue, scheduled } from './runtime-entry';
import type { Env } from './env';
import { requireSameOrigin } from './security/auth';
import { withDocumentSecurityHeaders, withSecurityHeaders } from './security/headers';
import { passwordLogin, passwordSignup, requestPasswordReset, resetPassword } from './auth-password';
import { finishOAuth, startOAuth, type OAuthProvider } from './auth-oauth';
import { completeOnboarding, onboardingStatus, selectOnboardingPlan } from './onboarding';

const APP_HOST = 'app.defrag.app';
const PUBLIC_HOST = 'sovereign.defrag.app';
const ACCOUNT_PAGE_PATHS = new Set(['/forgot-password', '/reset-password', '/onboarding']);
const HEALTH_PATHS = new Set(['/health', '/healthz', '/ready']);

const authRuntime = {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const providerMatch = url.pathname.match(/^\/api\/v1\/auth\/oauth\/(apple|google)\/(start|callback)$/);

      if (providerMatch) {
        const provider = providerMatch[1] as OAuthProvider;
        const action = providerMatch[2];
        if (action === 'start' && request.method === 'GET') return secure(await startOAuth(request, env, provider));
        if (action === 'callback' && ((provider === 'apple' && request.method === 'POST') || (provider === 'google' && request.method === 'GET'))) {
          return secure(await finishOAuth(request, env, provider));
        }
      }

      if (request.method === 'POST' && url.pathname === '/api/v1/auth/password/signup') {
        requireSameOrigin(request);
        return secure(await passwordSignup(request, env));
      }
      if (request.method === 'POST' && url.pathname === '/api/v1/auth/password/login') {
        requireSameOrigin(request);
        return secure(await passwordLogin(request, env));
      }
      if (request.method === 'POST' && url.pathname === '/api/v1/auth/password/forgot') {
        requireSameOrigin(request);
        return secure(await requestPasswordReset(request, env));
      }
      if (request.method === 'POST' && url.pathname === '/api/v1/auth/password/reset') {
        requireSameOrigin(request);
        return secure(await resetPassword(request, env));
      }

      if (request.method === 'GET' && url.pathname === '/api/v1/onboarding/status') {
        return secure(await onboardingStatus(request, env));
      }
      if (request.method === 'POST' && url.pathname === '/api/v1/onboarding/plan') {
        requireSameOrigin(request);
        return secure(await selectOnboardingPlan(request, env));
      }
      if (request.method === 'POST' && url.pathname === '/api/v1/onboarding/complete') {
        requireSameOrigin(request);
        return secure(await completeOnboarding(request, env));
      }

      if ((request.method === 'GET' || request.method === 'HEAD') && ACCOUNT_PAGE_PATHS.has(url.pathname)) {
        if (url.hostname.toLowerCase() === PUBLIC_HOST) return redirectToApp(url);
        return serveApplicationShell(request, env);
      }

      const response = await runtime.fetch(request, env, executionContext);
      if (request.method === 'GET' && HEALTH_PATHS.has(url.pathname) && response.headers.get('content-type')?.includes('application/json')) {
        const payload = await response.json() as Record<string, unknown>;
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        return secure(Response.json({
          ...payload,
          migrationVersion: '0010_auth_password_oauth_onboarding',
          authenticationModes: {
            password: 'configured',
            apple: oauthConfigured(env, 'apple') ? 'configured' : 'missing',
            google: oauthConfigured(env, 'google') ? 'configured' : 'missing',
            emailRecovery: env.EMAIL || env.RESEND_API_KEY ? 'configured' : 'missing',
            magicLinkCompatibility: 'supported'
          }
        }, { status: response.status, headers }));
      }
      return response;
    } catch (error) {
      return secure(error instanceof Response ? error : Response.json({ error: 'Internal error' }, { status: 500 }));
    }
  }
};

function oauthConfigured(env: Env, provider: OAuthProvider): boolean {
  return provider === 'apple'
    ? Boolean(env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY && env.APPLE_REDIRECT_URI)
    : Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI);
}

async function serveApplicationShell(request: Request, env: Env): Promise<Response> {
  if (!env.ASSETS) return secure(Response.json({ error: 'assets_unavailable' }, { status: 503 }));
  const assetUrl = new URL('/index.html', request.url);
  const assetRequest = new Request(assetUrl, { method: request.method, headers: request.headers });
  const response = withDocumentSecurityHeaders(await env.ASSETS.fetch(assetRequest));
  const headers = new Headers(response.headers);
  headers.set('x-robots-tag', 'noindex, nofollow');
  headers.delete('content-length');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function redirectToApp(source: URL): Response {
  const target = new URL(source);
  target.protocol = 'https:';
  target.hostname = APP_HOST;
  target.port = '';
  return secure(Response.redirect(target.toString(), 308));
}

function secure(response: Response): Response {
  return withSecurityHeaders(response);
}

export { ThreadCoordinator, queue, scheduled };
export default authRuntime;
