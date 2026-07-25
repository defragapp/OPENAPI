import worker, { ThreadCoordinator, queue, scheduled } from './entry';
import type { Env } from './env';
import { withSecurityHeaders } from './security/headers';
import { resolveAiModelConfig } from '@sovereign/agent-contracts';

const HEALTH_PATHS = new Set(['/health', '/healthz', '/ready']);

const runtime = {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== 'GET' || !HEALTH_PATHS.has(url.pathname)) {
      return worker.fetch(request, env, executionContext);
    }

    try {
      const db = await env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>();
      const aiConfig = resolveAiModelConfig(env);
      const dependencies = {
        d1: db?.ok === 1 ? 'ok' : 'degraded',
        durableObjects: env.THREADS ? 'configured' : 'missing',
        assets: env.ASSETS ? 'configured' : 'missing',
        ai: aiConfig.provider === 'cloudflare-gateway' && env.AI && env.AI_GATEWAY_ID ? 'configured' : 'missing',
        aiGateway: env.AI_GATEWAY_ID ? 'configured' : 'missing',
        baselineEngine: env.BASELINE_HORIZONS_URL ? 'configured' : 'missing',
        baselineObserver: 'Earth geocenter 500@399',
        birthplaceGeocoder: 'disabled',
        legacySovvAdapter: env.SOVV_INTERNAL_BASE_URL ? 'configured' : 'disabled',
        stripe: env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'disabled',
        scripture: env.SCRIPTURE_TRANSLATION || 'WEB'
      };
      const ok = db?.ok === 1;
      const ready = ok
        && dependencies.durableObjects === 'configured'
        && dependencies.assets === 'configured'
        && dependencies.ai === 'configured'
        && dependencies.baselineEngine === 'configured';
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

export { ThreadCoordinator, queue, scheduled };
export default runtime;
