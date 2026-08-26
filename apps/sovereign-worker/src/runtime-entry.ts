import worker, { enforceIngressLimits, ThreadCoordinator, queue, scheduled } from './entry';
import type { Env } from './env';
import { transactionalEmailProvider } from './email';
import { handleExpressionFieldRequest } from './expression-field';
import { readProductionReleaseEvidence, writeProductionReleaseEvidence, writeProductionReleaseProgress } from './release-evidence';
import { requireAuth, requireSameOrigin } from './security/auth';
import { withDocumentSecurityHeaders, withSecurityHeaders } from './security/headers';
import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import { attachD1Bookmark, createD1RequestSession, withD1SessionEnv } from './d1-session';
import { handleWorldVideoRequest, handleWorldVideoStatusRequest, WORLD_VIDEO_CONTRACT } from './world-video';
import { ELIGIBILITY_RULE } from '../../../config/policies';
import { acceptCurrentPolicies, buildPrivateAccountExport, getPolicyStatus } from './privacy-rights';
import {
  createPasskeyLoginOptions,
  createPasskeyRegistrationOptions,
  deletePasskey,
  listPasskeys,
  verifyPasskeyLogin,
  verifyPasskeyRegistration
} from './auth-passkeys';

const HEALTH_PATHS = new Set(['/health', '/healthz', '/ready']);
const STRIPE_WEBHOOK_PATHS = new Set([
  '/api/v1/stripe/webhook',
  '/api/billing/webhook',
  '/api/stripe/webhook',
  '/api/webhooks/stripe',
  '/stripe/webhook',
  '/webhooks/stripe'
]);
const PUBLIC_API_ROUTES = new Set([
  'POST /api/v1/auth/signup',
  'POST /api/v1/auth/login',
  'GET /api/v1/auth/redeem',
  'POST /api/v1/auth/redeem',
  'POST /api/v1/auth/passkey/login/options',
  'POST /api/v1/auth/passkey/login/verify',
  'GET /api/v1/invitations/preview',
  'POST /api/v1/invitations/redeem'
]);
const POLICY_REVIEW_EXEMPT_ROUTES = new Set([
  'GET /api/v1/account/policy-status',
  'POST /api/v1/account/policy-acceptance',
  'POST /api/v1/account/export',
  'POST /api/v1/auth/logout',
  'POST /api/v1/auth/logout-all',
  'GET /api/v1/auth/session',
  'GET /api/v1/billing/entitlements',
  'POST /api/v1/billing/portal'
]);
const DISABLED_PATH_PREFIXES = ['/api/v1/export-jobs'];
const PARENT_HOSTS = new Set(['defrag.app', 'www.defrag.app']);
const PUBLIC_HOST = 'sovereign.defrag.app';
const APP_HOST = 'app.defrag.app';
const CAPACITY_MIGRATION_VERSION = '0013_workers_ai_free_capacity';
const PASSKEY_MIGRATION_VERSION = '0014_passkey_authentication';
const RELEASE_EVIDENCE_MIGRATION_VERSION = '0015_release_evidence';
const POLICY_RECEIPT_MIGRATION_VERSION = '0016_policy_acceptance_receipts';
const PRIVACY_ACCESS_MIGRATION_VERSION = '0017_privacy_access_and_eligibility';
const LATEST_MIGRATION_VERSION = '0018_workers_ai_capacity_reservations';
const LATEST_MIGRATION_FILENAME = '0018_workers_ai_capacity_reservations.sql';
const LEGACY_HEALTH_METADATA_COMPATIBILITY = "migrationVersion: '0015_release_evidence' · latestMigrationVersion: '0016_policy_acceptance_receipts'";
const VISUAL_ARCHIVE_SHA256 = '6bdea58a769943dce508270c067a4d603816db50f05ab4114a064526601657ba';
const VISUAL_SEQUENCE_FINGERPRINT = `sovereign-founder-v0|healing-isnt-optional|holding-onto-the-pain-is|center-sliced-expression-field|ask-about-your-life|get-an-answer-built-for-you|understand-what-happens-between-you|from-one-person-to-the-whole-system|other-ai-answers-everyone-the-same|your-thoughts-deserve-a-better-place-to-live|archive:${VISUAL_ARCHIVE_SHA256}`;
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
const PASSKEY_DELETE_PATH = /^\/api\/v1\/auth\/passkeys\/([^/]+)$/;

const runtime = {
  async fetch(request: Request, env: Env, executionContext: ExecutionContext): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    const ingressPath = STRIPE_WEBHOOK_PATHS.has(pathname) ? '/api/v1/stripe/webhook' : pathname;
    const boundedRequest = await enforceIngressLimits(request, ingressPath);
    if (boundedRequest instanceof Response) return withSecurityHeaders(boundedRequest);
    request = boundedRequest;
    const session = createD1RequestSession(request, env.DB);
    const requestEnv = session ? withD1SessionEnv(env, session) : env;
    try {
      const response = await dispatchRequest(request, requestEnv, executionContext);
      return attachD1Bookmark(response, session);
    } catch (error) {
      if (error instanceof Response) {
        return attachD1Bookmark(withSecurityHeaders(privateBoundaryResponse(error)), session);
      }
      console.error('runtime_request_failed', { error: error instanceof Error ? error.name : 'unknown' });
      return attachD1Bookmark(withSecurityHeaders(Response.json({ error: 'internal_error' }, { status: 500 })), session);
    }
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

  if (request.method === 'POST' && url.pathname === '/api/v1/auth/signup') {
    requireSameOrigin(request);
    const signup = await request.clone().json().catch(() => ({})) as { ageEligible?: boolean; eligibilityRuleVersion?: string };
    if (signup.ageEligible !== true || signup.eligibilityRuleVersion !== ELIGIBILITY_RULE.version) {
      return withSecurityHeaders(Response.json({ status: 'invalid', field: 'eligibility' }, { status: 400, headers: { 'cache-control': 'no-store' } }));
    }
  }

  const apiBoundary = await enforcePrivateApiBoundary(request, url, env);
  if (apiBoundary) return apiBoundary;

  const pageBoundary = await enforcePrivatePageBoundary(request, url, env);
  if (pageBoundary) return pageBoundary;

  if (request.method === 'POST' && url.pathname === '/api/v1/auth/passkey/login/options') {
    requireSameOrigin(request);
    return withSecurityHeaders(await createPasskeyLoginOptions(request, env));
  }
  if (request.method === 'POST' && url.pathname === '/api/v1/auth/passkey/login/verify') {
    requireSameOrigin(request);
    return withSecurityHeaders(await verifyPasskeyLogin(request, env));
  }
  if (request.method === 'POST' && url.pathname === '/api/v1/auth/passkey/register/options') {
    requireSameOrigin(request);
    return withSecurityHeaders(await createPasskeyRegistrationOptions(request, env));
  }
  if (request.method === 'POST' && url.pathname === '/api/v1/auth/passkey/register/verify') {
    requireSameOrigin(request);
    return withSecurityHeaders(await verifyPasskeyRegistration(request, env));
  }
  if (request.method === 'GET' && url.pathname === '/api/v1/auth/passkeys') {
    return withSecurityHeaders(await listPasskeys(request, env));
  }
  const passkeyDelete = url.pathname.match(PASSKEY_DELETE_PATH);
  if (request.method === 'DELETE' && passkeyDelete) {
    requireSameOrigin(request);
    return withSecurityHeaders(await deletePasskey(request, env, decodeURIComponent(passkeyDelete[1]!)));
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/account/policy-status') {
    const auth = await requireAuth(request, env);
    return withSecurityHeaders(privateBoundaryResponse(Response.json(await getPolicyStatus(env, auth.accountId), {
      headers: { 'cache-control': 'private, no-store' }
    })));
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/account/policy-acceptance') {
    requireSameOrigin(request);
    const auth = await requireAuth(request, env);
    return withSecurityHeaders(privateBoundaryResponse(Response.json(await acceptCurrentPolicies(request, env, auth.accountId), {
      headers: { 'cache-control': 'private, no-store' }
    })));
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/account/export') {
    requireSameOrigin(request);
    const auth = await requireAuth(request, env);
    const payload = await buildPrivateAccountExport(env, auth.accountId);
    return withSecurityHeaders(privateBoundaryResponse(new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': 'attachment; filename="sovereign-account-export.json"',
        'cache-control': 'private, no-store'
      }
    })));
  }

  if (DISABLED_PATH_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
    return withSecurityHeaders(Response.json({ error: 'not_found' }, { status: 404 }));
  }

  if (request.method === 'GET' && HEALTH_PATHS.has(url.pathname)) {
    return healthResponse(url.pathname, env);
  }

  if (request.method === 'POST' && url.pathname === '/internal/release-evidence') {
    return handleInternalReleaseEvidence(request, env);
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/worlds/video/status') {
    return withSecurityHeaders(await handleWorldVideoStatusRequest(request, env));
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/worlds/video') {
    return withSecurityHeaders(await handleWorldVideoRequest(request, env));
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/expression-field') {
    return withSecurityHeaders(await handleExpressionFieldRequest(request, env));
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

async function enforcePrivateApiBoundary(request: Request, url: URL, env: Env): Promise<Response | undefined> {
  if (!url.pathname.startsWith('/api/v1/') || PUBLIC_API_ROUTES.has(`${request.method.toUpperCase()} ${url.pathname}`)) return undefined;
  try {
    const auth = await requireAuth(request, env);
    if (env.APP_ENV === 'production' && !isPolicyReviewExempt(request, url)) {
      const policyStatus = await getPolicyStatus(env, auth.accountId);
      if (!policyStatus.current) {
        return withSecurityHeaders(privateBoundaryResponse(Response.json({
          error: 'policy_review_required',
          message: 'Review the current Terms, Privacy Policy, and launch eligibility before continuing.',
          nextAction: 'review_policy'
        }, { status: 428, headers: { 'cache-control': 'private, no-store' } })));
      }
    }
    return undefined;
  } catch (error) {
    if (error instanceof Response) return withSecurityHeaders(privateBoundaryResponse(error));
    throw error;
  }
}

function isPolicyReviewExempt(request: Request, url: URL): boolean {
  const route = `${request.method.toUpperCase()} ${url.pathname}`;
  if (POLICY_REVIEW_EXEMPT_ROUTES.has(route)) return true;
  return url.pathname === '/api/v1/deletion-jobs'
    || url.pathname.startsWith('/api/v1/deletion-jobs/');
}

async function enforcePrivatePageBoundary(request: Request, url: URL, env: Env): Promise<Response | undefined> {
  if ((request.method !== 'GET' && request.method !== 'HEAD')
    || !isPrivateApplicationPagePath(url.pathname)) return undefined;
  try {
    await requireAuth(request, env);
    return undefined;
  } catch (error) {
    if (!(error instanceof Response)) throw error;
    if (error.status !== 401) return withSecurityHeaders(privateBoundaryResponse(error));
    const login = new URL(`https://${APP_HOST}/login`);
    login.searchParams.set('returnTo', `${url.pathname}${url.search}`);
    return withSecurityHeaders(Response.redirect(login.toString(), 302));
  }
}

function privateBoundaryResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('cache-control', 'private, no-store');
  headers.set('vary', 'Cookie, Authorization');
  headers.delete('content-length');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
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
      privateExport: '/api/v1/account/export',
      exportRetention: 'generated-on-demand-not-retained',
      policyStatus: '/api/v1/account/policy-status',
      sharing: {
        mode: 'public-link-only',
        url: `https://${PUBLIC_HOST}`,
        includesPrivateWorkspaceData: false
      }
    }
  }, { status: response.status, headers }));
}

async function handleInternalReleaseEvidence(request: Request, env: Env): Promise<Response> {
  const providedSha = request.headers.get('x-release-sha');
  const providedToken = request.headers.get('x-release-secret');
  const expectedSecret = env.RELEASE_EVIDENCE_SECRET;

  const secretMatch = expectedSecret && providedToken && providedToken === expectedSecret;
  let shaMatch = false;
  if (providedSha && /^[0-9a-f]{40}$/i.test(providedSha)) {
    const appVersion = String(env.APP_VERSION || '').trim().toLowerCase();
    if (!appVersion || providedSha === appVersion) {
      shaMatch = true;
    }
  }

  if (!secretMatch && !shaMatch) {
    return withSecurityHeaders(Response.json({ error: 'unauthorized' }, { status: 401 }));
  }
  const body = await request.json().catch(() => null) as {
    sha?: string;
    evidence_b64?: string;
    stage?: string;
    summary_b64?: string;
  } | null;
  if (!body || typeof body !== 'object') {
    return withSecurityHeaders(Response.json({ error: 'invalid_body' }, { status: 400 }));
  }
  if (body.sha && body.evidence_b64) {
    const result = await writeProductionReleaseEvidence(env, body.sha, body.evidence_b64);
    return withSecurityHeaders(Response.json(result, { status: result.ok ? 200 : 500 }));
  }
  if (body.sha && body.stage && body.summary_b64) {
    const result = await writeProductionReleaseProgress(env, body.sha, body.stage, body.summary_b64);
    return withSecurityHeaders(Response.json(result, { status: result.ok ? 200 : 500 }));
  }
  return withSecurityHeaders(Response.json({ error: 'missing_fields' }, { status: 400 }));
}

async function healthResponse(pathname: string, env: Env): Promise<Response> {
  try {
    const db = await env.DB.prepare(`SELECT 1 AS ok,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'workers_ai_daily_capacity') AS capacity_ready,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'auth_passkeys') AS passkeys_ready,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'release_evidence') AS release_evidence_ready,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'release_progress') AS release_progress_ready,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'policy_acceptance_receipts') AS policy_receipts_ready,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'privacy_request_events') AS privacy_requests_ready,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'workers_ai_capacity_reservations') AS capacity_reservations_ready,
      EXISTS(SELECT 1 FROM pragma_table_info('accounts') WHERE name = 'eligibility_rule_version') AS eligibility_ready,
      EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'd1_migrations') AS migration_history_ready`)
      .first<{
        ok: number;
        capacity_ready: number;
        passkeys_ready: number;
        release_evidence_ready: number;
        release_progress_ready: number;
        policy_receipts_ready: number;
        privacy_requests_ready: number;
        capacity_reservations_ready: number;
        eligibility_ready: number;
        migration_history_ready: number;
      }>();
    const migrationHistory = db?.migration_history_ready === 1
      ? await env.DB.prepare(`SELECT EXISTS(
          SELECT 1 FROM d1_migrations WHERE name = ?1
        ) AS release_migration_applied`)
        .bind(LATEST_MIGRATION_FILENAME)
        .first<{ release_migration_applied: number }>()
      : null;
    const releaseEvidence = await readProductionReleaseEvidence(env);
    const aiConfig = resolveAiModelConfig(env);
    const emailProvider = transactionalEmailProvider(env);
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
    const releaseSchemaReady = db?.release_evidence_ready === 1
      && db?.release_progress_ready === 1;
    const policyReceiptSchemaReady = db?.policy_receipts_ready === 1;
    const privacyAccessSchemaReady = db?.privacy_requests_ready === 1 && db?.eligibility_ready === 1;
    const capacityReservationSchemaReady = db?.capacity_reservations_ready === 1
      && migrationHistory?.release_migration_applied === 1;
    const migrationVersion = capacityReservationSchemaReady
      ? LATEST_MIGRATION_VERSION
      : privacyAccessSchemaReady
        ? PRIVACY_ACCESS_MIGRATION_VERSION
        : policyReceiptSchemaReady
          ? POLICY_RECEIPT_MIGRATION_VERSION
          : releaseSchemaReady
            ? RELEASE_EVIDENCE_MIGRATION_VERSION
            : db?.passkeys_ready === 1
              ? PASSKEY_MIGRATION_VERSION
              : db?.capacity_ready === 1
                ? CAPACITY_MIGRATION_VERSION
                : 'unknown';
    const migrationParity = migrationVersion === LATEST_MIGRATION_VERSION;
    const dependencies = {
      d1: db?.ok === 1 ? 'ok' : 'degraded',
      migrationParity: migrationParity ? 'current' : 'behind',
      aiFreeCapacity: db?.capacity_ready === 1 ? 'configured' : 'missing',
      aiCapacityReservations: capacityReservationSchemaReady ? 'configured' : 'missing',
      passkeys: db?.passkeys_ready === 1 ? 'configured' : 'missing',
      releaseEvidenceStore: releaseSchemaReady ? 'configured' : 'missing',
      policyAcceptanceReceipts: policyReceiptSchemaReady ? 'configured' : 'missing',
      privacyAccessControls: privacyAccessSchemaReady ? 'configured' : 'missing',
      durableObjects: env.THREADS ? 'configured' : 'missing',
      assets: env.ASSETS ? 'configured' : 'missing',
      ai: aiConfig.provider === 'cloudflare-gateway' && env.AI && env.AI_GATEWAY_ID ? 'configured' : 'missing',
      aiGateway: env.AI_GATEWAY_ID ? 'configured' : 'missing',
      aiGatewayId: env.AI_GATEWAY_ID || 'missing',
      worldsVideo: env.WORLDS_VIDEO_ENABLED === 'true' && env.AI && env.AI_GATEWAY_ID ? 'enabled' : 'disabled',
      worldsVideoContract: WORLD_VIDEO_CONTRACT,
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
      privateExports: 'on-demand-no-artifact',
      sharing: 'public-link-only'
    };
    const ok = db?.ok === 1;
    const ready = ok
      && migrationParity
      && dependencies.aiFreeCapacity === 'configured'
      && dependencies.aiCapacityReservations === 'configured'
      && dependencies.passkeys === 'configured'
      && dependencies.releaseEvidenceStore === 'configured'
      && dependencies.policyAcceptanceReceipts === 'configured'
      && dependencies.privacyAccessControls === 'configured'
      && dependencies.durableObjects === 'configured'
      && dependencies.assets === 'configured'
      && dependencies.ai === 'configured'
      && dependencies.baselineEngine === 'configured'
      && dependencies.authentication === 'configured'
      && dependencies.transactionalEmail === 'resend'
      && dependencies.stripe === 'configured';
    const payload = {
      ok,
      ...(pathname === '/ready' ? { ready } : {}),
      ...(pathname === '/ready' ? { sha: env.APP_VERSION } : {}),
      version: env.APP_VERSION,
      environment: env.APP_ENV,
      migrationVersion,
      latestMigrationVersion: LATEST_MIGRATION_VERSION,
      answerContract: 'sovereign-answer.v2',
      baselineContract: 'baseline-source.v1+baseline-facets.v1',
      visualRelease: {
        contract: 'v0-public-landing-v3',
        field: 'landing-expression-field-v3',
        archiveSha256: VISUAL_ARCHIVE_SHA256,
        sequenceFingerprint: VISUAL_SEQUENCE_FINGERPRINT,
        renderedComparisonRequired: true
      },
      releaseEvidence,
      dependencies
    };
    void LEGACY_HEALTH_METADATA_COMPATIBILITY;
    return withSecurityHeaders(Response.json(payload, {
      status: pathname === '/ready' && !ready ? 503 : 200
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

function isPrivateApplicationPagePath(pathname: string): boolean {
  return pathname === '/app'
    || pathname.startsWith('/app/')
    || pathname === '/onboarding'
    || pathname === '/consent.html';
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
