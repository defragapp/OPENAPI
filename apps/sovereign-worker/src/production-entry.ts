import runtime, { ThreadCoordinator, queue, scheduled } from './runtime-entry';
import type { Env } from './env';
import { requireAuth, requireSameOrigin } from './security/auth';
import { withSecurityHeaders } from './security/headers';
import { getEntitlements, requireFeature } from './db/entitlements';
import { authorizeConversationContext, parseConversationContext } from './conversation-context';
import { decideSovereignInputSafety } from './agent/input-safety';

const THREAD_MESSAGE_PATH = /^\/api\/v1\/threads\/([^/]+)\/messages$/;
const LEGACY_SYSTEM_ALIGNMENT_PATH = /^\/api\/v1\/systems\/([^/]+)\/alignment$/;
const DISABLED_TEXT_FIRST_PATHS = new Set(['/api/tts']);

const productionRuntime = {
  ...runtime,
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    try {
      const preflight = await launchPreflight(request, env);
      if (preflight) return withSecurityHeaders(preflight);
      return runtime.fetch(request, env, executionContext);
    } catch (error) {
      if (error instanceof Response) return withSecurityHeaders(error);
      console.error('production_preflight_failed', { error: error instanceof Error ? error.name : 'unknown' });
      return withSecurityHeaders(Response.json({ error: 'internal_error' }, { status: 500 }));
    }
  },
  queue,
  scheduled
};

async function launchPreflight(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);

  if (DISABLED_TEXT_FIRST_PATHS.has(url.pathname)) {
    return Response.json({ error: 'not_found' }, {
      status: 404,
      headers: { 'cache-control': 'private, no-store' }
    });
  }

  const messageMatch = url.pathname.match(THREAD_MESSAGE_PATH);
  if (request.method === 'POST' && messageMatch) {
    requireSameOrigin(request);
    const body = await request.clone().json().catch(() => ({})) as {
      message?: string;
      context?: unknown;
    };
    const message = body.message?.trim();
    if (!message) return null;

    const safety = decideSovereignInputSafety(message);
    if (safety.disposition !== 'standard') return null;

    const selection = parseConversationContext(body.context);
    const auth = await requireAuth(request, env);
    const entitlements = await getEntitlements(env, auth.accountId);
    const threadId = decodeURIComponent(messageMatch[1]!);

    const thread = await env.DB.prepare('SELECT covenant_enabled FROM threads WHERE id = ? AND account_id = ?')
      .bind(threadId, auth.accountId)
      .first<{ covenant_enabled: number }>();
    const requestedCovenant = Boolean(
      body.context
      && typeof body.context === 'object'
      && !Array.isArray(body.context)
      && (body.context as { covenantEnabled?: unknown }).covenantEnabled === true
    );
    if (thread?.covenant_enabled === 1 || requestedCovenant) {
      requireFeature(entitlements, 'covenant.lens');
    }

    if (selection.personId || selection.systemId) {
      await authorizeConversationContext(env, auth.accountId, selection, entitlements);
    }
    return null;
  }

  const systemAlignmentMatch = url.pathname.match(LEGACY_SYSTEM_ALIGNMENT_PATH);
  if (request.method === 'GET' && systemAlignmentMatch) {
    const auth = await requireAuth(request, env);
    const systemId = decodeURIComponent(systemAlignmentMatch[1]!);
    const system = await env.DB.prepare('SELECT system_type FROM systems WHERE id = ? AND account_id = ?')
      .bind(systemId, auth.accountId)
      .first<{ system_type: string }>();
    if (!system) return Response.json({ error: 'System not found' }, { status: 404 });
    const entitlements = await getEntitlements(env, auth.accountId);
    requireFeature(
      entitlements,
      ['family', 'household', 'friendship_group'].includes(system.system_type) ? 'systems.family' : 'systems.team'
    );
  }

  return null;
}

export { ThreadCoordinator, queue, scheduled };
export default productionRuntime;
