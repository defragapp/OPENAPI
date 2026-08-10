import {
  assertExpressionFieldResponse,
  type ExpressionAxisId,
  type ExpressionFieldResponse
} from '@sovereign/agent-contracts';
import { reserveAiTurns, releaseAiTurns } from './billing/usage';
import { getEntitlements } from './db/entitlements';
import type { Env } from './env';
import { handleExpressionFieldRequest } from './expression-field';
import { requireAuth, requireSameOrigin } from './security/auth';

export const WORLD_VIDEO_CONTRACT = 'sovereign-world-video.v1' as const;
const DEFAULT_WORLD_VIDEO_MODEL = 'runwayml/gen-4.5';
const DEFAULT_WORLD_VIDEO_TURN_COST = 25;
const WORLD_DURATION_SECONDS = 5;
const WORLD_RATIO = '1280:720';
const MAX_WORLD_VIDEO_BYTES = 50 * 1024 * 1024;

const physicsAxisMap = {
  visibility: 'clarity',
  tempo: 'urgency',
  weight: 'responsibility',
  thresholds: 'boundaries',
  traversability: 'trust',
  reconnection: 'repair',
  stability: 'steadiness'
} as const satisfies Record<string, ExpressionAxisId>;

type WorldPhysics = Record<keyof typeof physicsAxisMap, 'quiet' | 'moderate' | 'strong'>;

type WorldVideoProviderResult = {
  state?: string;
  result?: { video?: string };
};

export async function handleWorldVideoStatusRequest(request: Request, env: Env): Promise<Response> {
  const auth = await requireAuth(request, env);
  const entitlements = await getEntitlements(env, auth.accountId);
  const configured = worldsVideoConfigured(env);
  return privateJson({
    contract: WORLD_VIDEO_CONTRACT,
    enabled: configured,
    eligible: configured && entitlements.plan === 'sovereign_plus',
    plan: entitlements.plan,
    turnCost: worldVideoTurnCost(env),
    mode: 'self',
    source: 'expression-field.v1',
    retention: 'not_stored_by_sovereign',
    limitations: [
      'Worlds are illustrative renderings of permitted Expression Field values, not predictions or measurements of your inner state.',
      'The video renderer receives a sanitized scene prompt only. It does not receive raw birth details, exact private location, account identity, Basis values, conversations, or another person’s data.'
    ]
  });
}

export async function handleWorldVideoRequest(request: Request, env: Env): Promise<Response> {
  requireSameOrigin(request);
  const auth = await requireAuth(request, env);
  const entitlements = await getEntitlements(env, auth.accountId);
  if (entitlements.plan !== 'sovereign_plus') {
    return privateJson({
      error: 'entitlement_required',
      feature: 'worlds.video',
      message: 'Private World generation is a Sovereign+ capability.',
      nextAction: 'review_plan'
    }, 403);
  }
  if (!worldsVideoConfigured(env)) {
    return privateJson({
      error: 'worlds_video_unavailable',
      message: 'Private World generation is not enabled for this release.'
    }, 503);
  }

  const fieldResult = await expressionFieldSnapshot(request, env);
  if (fieldResult instanceof Response) return fieldResult;
  const field = fieldResult;
  if (field.status !== 'ready' && field.status !== 'baseline_only') {
    return privateJson({
      error: 'expression_field_unavailable',
      message: 'Your Expression Field must be ready before a World can be generated.'
    }, 409);
  }

  const turnCost = worldVideoTurnCost(env);
  const reservation = await reserveAiTurns(env, auth.accountId, entitlements.plan, turnCost);
  let providerResult: unknown;
  try {
    providerResult = await env.AI!.run(
      worldVideoModel(env),
      {
        prompt: buildWorldVideoPrompt(field),
        duration: WORLD_DURATION_SECONDS,
        ratio: WORLD_RATIO,
        seed: deterministicWorldSeed(field)
      },
      {
        gateway: {
          id: env.AI_GATEWAY_ID,
          skipCache: true,
          collectLog: false,
          metadata: {
            response_contract: WORLD_VIDEO_CONTRACT,
            product_surface: 'worlds',
            plan: 'sovereign_plus'
          }
        }
      }
    );
  } catch (error) {
    await releaseAiTurns(env, auth.accountId, reservation.periodKey, turnCost).catch(() => undefined);
    console.error('world_video_generation_failed', { error: error instanceof Error ? error.name : 'unknown' });
    return privateJson({
      error: 'world_generation_failed',
      message: 'The World could not be generated. Your reserved AI allowance was restored.',
      retryable: true
    }, 503);
  }

  const videoUrl = providerVideoUrl(providerResult);
  if (!videoUrl) {
    console.error('world_video_provider_response_invalid');
    return privateJson({
      error: 'world_generation_invalid_response',
      message: 'The video provider did not return a usable World.',
      retryable: true
    }, 502);
  }

  let providerVideo: Response;
  try {
    providerVideo = await fetch(videoUrl, {
      method: 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(60_000)
    });
  } catch {
    return privateJson({
      error: 'world_video_delivery_failed',
      message: 'The World was generated but could not be delivered securely.',
      retryable: true
    }, 502);
  }
  if (!providerVideo.ok || !providerVideo.body) {
    return privateJson({
      error: 'world_video_delivery_failed',
      message: 'The World was generated but could not be delivered securely.',
      retryable: true
    }, 502);
  }

  const contentType = providerVideo.headers.get('content-type') ?? '';
  const contentLength = Number(providerVideo.headers.get('content-length') ?? '0');
  if (!contentType.startsWith('video/') || (Number.isFinite(contentLength) && contentLength > MAX_WORLD_VIDEO_BYTES)) {
    return privateJson({
      error: 'world_video_delivery_rejected',
      message: 'The generated media did not pass the private delivery boundary.'
    }, 502);
  }

  return new Response(providerVideo.body, {
    status: 200,
    headers: {
      'content-type': contentType || 'video/mp4',
      'cache-control': 'private, no-store',
      'content-disposition': 'inline; filename="sovereign-world.mp4"',
      'x-content-type-options': 'nosniff',
      'x-sovereign-world-contract': WORLD_VIDEO_CONTRACT,
      vary: 'Cookie'
    }
  });
}

async function expressionFieldSnapshot(request: Request, env: Env): Promise<ExpressionFieldResponse | Response> {
  const response = await handleExpressionFieldRequest(request, env);
  if (!response.ok) return response;
  try {
    const payload: unknown = await response.json();
    assertExpressionFieldResponse(payload);
    return payload;
  } catch {
    return privateJson({
      error: 'expression_field_invalid',
      message: 'The Expression Field did not pass the World source boundary.'
    }, 503);
  }
}

function worldsVideoConfigured(env: Env): boolean {
  return env.WORLDS_VIDEO_ENABLED === 'true'
    && Boolean(env.AI && env.AI_GATEWAY_ID)
    && worldVideoModel(env) === DEFAULT_WORLD_VIDEO_MODEL;
}

function worldVideoModel(env: Env): string {
  return (env.WORLDS_VIDEO_MODEL || DEFAULT_WORLD_VIDEO_MODEL).trim();
}

function worldVideoTurnCost(env: Env): number {
  const parsed = Number(env.WORLDS_VIDEO_TURN_COST);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 300 ? parsed : DEFAULT_WORLD_VIDEO_TURN_COST;
}

function buildWorldVideoPrompt(field: ExpressionFieldResponse): string {
  const physics = worldPhysics(field);
  return [
    'Create a five-second monochrome immersive environmental glimpse for a private personal-intelligence interface.',
    'Near-black frame with one irregular architectural opening into a quiet physical environment; it should feel like a view revealed from darkness, never a fantasy or spiritual portal.',
    'No people, faces, bodies, text, letters, symbols, astrology, planets, stars, spiritual or religious imagery, glowing rings, sci-fi HUD, cards, dashboards, or UI overlays.',
    'Restrained photoreal materiality with subtle atmospheric depth.',
    `World physics: visibility ${physics.visibility}; tempo ${physics.tempo}; structural weight ${physics.weight}; thresholds ${physics.thresholds}; traversability ${physics.traversability}; reconnection ${physics.reconnection}; stability ${physics.stability}.`,
    'Translate those values only into light, distance, enclosure, path openness, material density, and camera pace.',
    'Stable centered camera, subtle forward drift, no cuts, no dramatic reveal.'
  ].join(' ');
}

function worldPhysics(field: ExpressionFieldResponse): WorldPhysics {
  const byId = new Map(field.axes.map((axis) => [axis.id, axis.value]));
  return Object.fromEntries(Object.entries(physicsAxisMap).map(([physicsKey, axisId]) => [
    physicsKey,
    salienceBucket(byId.get(axisId) ?? 50)
  ])) as WorldPhysics;
}

function salienceBucket(value: number): 'quiet' | 'moderate' | 'strong' {
  if (value < 40) return 'quiet';
  if (value < 68) return 'moderate';
  return 'strong';
}

function deterministicWorldSeed(field: ExpressionFieldResponse): number {
  const serialized = field.axes.map((axis) => `${axis.id}:${Math.round(axis.value)}`).join('|');
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function providerVideoUrl(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const response = value as WorldVideoProviderResult;
  if (response.state !== 'Completed' || typeof response.result?.video !== 'string') return null;
  let url: URL;
  try { url = new URL(response.result.video); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  if (!url.hostname.toLowerCase().endsWith('.cloudfront.net')) return null;
  return url.toString();
}

function privateJson(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      'cache-control': 'private, no-store',
      'content-type': 'application/json; charset=utf-8',
      vary: 'Cookie'
    }
  });
}
