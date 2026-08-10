import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const runtime = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');
const auth = readFileSync(new URL('./security/auth.ts', import.meta.url), 'utf8');
const worldVideo = readFileSync(new URL('./world-video.ts', import.meta.url), 'utf8');
const usage = readFileSync(new URL('./billing/usage.ts', import.meta.url), 'utf8');
const headers = readFileSync(new URL('./security/headers.ts', import.meta.url), 'utf8');
const wrangler = readFileSync(new URL('../../../wrangler.jsonc', import.meta.url), 'utf8');

describe('private launch boundary and Worlds video', () => {
  it('makes v1 APIs private by default with a narrow public ingress allowlist', () => {
    expect(runtime).toContain("const PUBLIC_API_ROUTES = new Set([");
    for (const route of [
      'POST /api/v1/auth/signup',
      'POST /api/v1/auth/login',
      'GET /api/v1/auth/redeem',
      'POST /api/v1/auth/redeem',
      'POST /api/v1/auth/passkey/login/options',
      'POST /api/v1/auth/passkey/login/verify',
      'GET /api/v1/invitations/preview',
      'POST /api/v1/invitations/redeem'
    ]) expect(runtime).toContain(`'${route}'`);
    expect(runtime).toContain("url.pathname.startsWith('/api/v1/')");
    expect(runtime).toContain('await requireAuth(request, env)');
    expect(runtime).toContain("headers.set('cache-control', 'private, no-store')");
  });

  it('requires a session before private app and onboarding documents are served', () => {
    expect(runtime).toContain('enforcePrivatePageBoundary(request, url, env)');
    expect(runtime).toContain("pathname === '/app'");
    expect(runtime).toContain("pathname.startsWith('/app/')");
    expect(runtime).toContain("pathname === '/onboarding'");
    expect(runtime).toContain("login.searchParams.set('returnTo'");
    expect(runtime).toContain("Response.redirect(login.toString(), 302)");
  });

  it('turns thrown HTTP responses into secured runtime responses instead of accidental 500s', () => {
    expect(runtime).toContain('if (error instanceof Response)');
    expect(runtime).toContain('withSecurityHeaders(privateBoundaryResponse(error))');
    expect(runtime).toContain("console.error('runtime_request_failed'");
    expect(runtime).not.toContain('console.error(error)');
  });

  it('reuses authentication for the same request across the edge and route handlers', () => {
    expect(auth).toContain('const authCache = new WeakMap<Request, Promise<AuthContext>>()');
    expect(auth).toContain('const cached = authCache.get(request)');
    expect(auth).toContain('authCache.set(request, pending)');
  });

  it('builds Worlds from Expression Field values rather than raw Baseline inputs', () => {
    expect(worldVideo).toContain("source: 'expression-field.v1'");
    expect(worldVideo).toContain('handleExpressionFieldRequest(request, env)');
    for (const mapping of [
      "visibility: 'clarity'",
      "tempo: 'urgency'",
      "weight: 'responsibility'",
      "thresholds: 'boundaries'",
      "traversability: 'trust'",
      "reconnection: 'repair'",
      "stability: 'steadiness'"
    ]) expect(worldVideo).toContain(mapping);
    expect(worldVideo).not.toContain('getModelSafeBaselineContext');
    expect(worldVideo).not.toContain('BASELINE_HORIZONS_URL');
    expect(worldVideo).not.toContain('birthDate');
    expect(worldVideo).not.toContain('birthTime');
  });

  it('keeps provider generation private, Cloudflare-routed, logged without payloads, and non-stored', () => {
    expect(worldVideo).toContain("const DEFAULT_WORLD_VIDEO_MODEL = 'runwayml/gen-4.5'");
    expect(worldVideo).toContain('env.AI!.run(');
    expect(worldVideo).toContain('id: env.AI_GATEWAY_ID');
    expect(worldVideo).toContain('collectLog: false');
    expect(worldVideo).not.toContain('Authorization: Bearer');
    expect(worldVideo).not.toContain('RUNWAY_API_KEY');
    expect(worldVideo).toContain("'cache-control': 'private, no-store'");
    expect(worldVideo).toContain("retention: 'not_stored_by_sovereign'");
    expect(worldVideo).toContain("endsWith('.cloudfront.net')");
  });

  it('charges a bounded atomic AI allowance, returns allowance responses, and restores only failed inference', () => {
    expect(usage).toContain('export async function reserveAiTurns');
    expect(usage).toContain('ai_usage_windows.turns_used + excluded.turns_used <= ?');
    expect(usage).toContain('export async function releaseAiTurns');
    expect(worldVideo).toContain('reserveAiTurns(env, auth.accountId, entitlements.plan, turnCost)');
    expect(worldVideo).toContain('if (error instanceof Response) return error');
    expect(worldVideo).toContain('releaseAiTurns(env, auth.accountId, reservation.periodKey, turnCost)');
  });

  it('ships video generation disabled until Cloudflare billing and spend gates are activated', () => {
    expect(wrangler).toContain('"WORLDS_VIDEO_ENABLED": "false"');
    expect(wrangler).toContain('"WORLDS_VIDEO_MODEL": "runwayml/gen-4.5"');
    expect(wrangler).toContain('"WORLDS_VIDEO_TURN_COST": "25"');
  });

  it('allows only local blob playback in the authenticated document CSP', () => {
    expect(headers).toContain("media-src 'self' blob:");
    expect(headers).not.toContain('media-src https:');
  });
});
