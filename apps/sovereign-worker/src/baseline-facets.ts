import { resolveAiModelConfig } from '@sovereign/agent-contracts';
import type { Env } from './env';
import { canUseDevelopmentFixtures } from './runtime';
import {
  BASELINE_FACET_CONTRACT_VERSION,
  baselineFacetIds,
  baselineFacetProfileSchema,
  baselineFacetSchema,
  buildBaselineBasisRegistry,
  parseJsonObject,
  validateFacetProfileBasis,
  type BaselineFacet,
  type BaselineFacetId,
  type BaselineFacetProfile,
  type BaselineSourceData
} from './baseline-contracts';

interface FacetCacheInput {
  accountId: string;
  inputHash: string;
  source: BaselineSourceData;
  refresh?: boolean;
}

interface FacetCacheRow {
  input_hash: string;
  calculation_version: string;
  facet_contract_version: string;
  model_version: string;
  profile_json: string;
}

export const FACET_BATCH_SIZE = 6;
export const FACET_BATCH_TIMEOUT_MS = 12_000;
export const FACET_BATCH_ATTEMPTS = 2;

export async function ensureBaselineFacetProfile(env: Env, input: FacetCacheInput): Promise<BaselineFacetProfile | null> {
  const config = resolveAiModelConfig(env);
  const cached = input.refresh ? null : await readCachedProfile(env, input.accountId);
  if (
    cached
    && cached.input_hash === input.inputHash
    && cached.calculation_version === input.source.computationVersion
    && cached.facet_contract_version === BASELINE_FACET_CONTRACT_VERSION
    && cached.model_version === config.model
  ) {
    const parsed = baselineFacetProfileSchema.parse(JSON.parse(cached.profile_json));
    return validateFacetProfileBasis(parsed, buildBaselineBasisRegistry(input.source));
  }

  let profile: BaselineFacetProfile;
  if (canUseDevelopmentFixtures(env)) {
    profile = buildDevelopmentFacetProfile(input.source, config.model);
  } else {
    if (config.provider !== 'cloudflare-gateway' || !env.AI || !env.AI_GATEWAY_ID) return null;
    profile = await generateFacetProfile(env, input.source, config.model);
  }

  await env.DB.prepare(`INSERT OR REPLACE INTO baseline_facet_profiles
    (account_id, input_hash, calculation_version, facet_contract_version, model_version, profile_json, generated_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
    .bind(
      input.accountId,
      input.inputHash,
      input.source.computationVersion,
      BASELINE_FACET_CONTRACT_VERSION,
      config.model,
      JSON.stringify(profile),
      profile.generatedAt
    )
    .run();
  return profile;
}

export async function getCachedBaselineFacetProfile(env: Env, accountId: string): Promise<BaselineFacetProfile | null> {
  const row = await readCachedProfile(env, accountId);
  if (!row) return null;
  try {
    return baselineFacetProfileSchema.parse(JSON.parse(row.profile_json));
  } catch {
    return null;
  }
}

async function readCachedProfile(env: Env, accountId: string): Promise<FacetCacheRow | null> {
  try {
    return await env.DB.prepare(`SELECT input_hash, calculation_version, facet_contract_version, model_version, profile_json
      FROM baseline_facet_profiles WHERE account_id = ?`)
      .bind(accountId)
      .first<FacetCacheRow>();
  } catch {
    return null;
  }
}

export function baselineFacetBatches(
  ids: readonly BaselineFacetId[] = baselineFacetIds,
  size = FACET_BATCH_SIZE
): BaselineFacetId[][] {
  if (!Number.isInteger(size) || size < 1) throw new Error('Facet batch size must be a positive integer');
  const batches: BaselineFacetId[][] = [];
  for (let index = 0; index < ids.length; index += size) {
    batches.push(ids.slice(index, index + size));
  }
  return batches;
}

export function parseFacetBatch(raw: string, expectedIds: readonly BaselineFacetId[]): BaselineFacet[] {
  const parsed = parseJsonObject(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Facet batch response must be a JSON object');
  }
  const facetsValue = (parsed as Record<string, unknown>).facets;
  if (!Array.isArray(facetsValue) || facetsValue.length !== expectedIds.length) {
    throw new Error('Facet batch response did not contain the expected facet count');
  }
  const facets = facetsValue.map((facet) => baselineFacetSchema.parse(facet));
  for (let index = 0; index < expectedIds.length; index += 1) {
    if (facets[index]?.id !== expectedIds[index]) {
      throw new Error(`Facet batch response expected ${expectedIds[index]} at position ${index + 1}`);
    }
  }
  return facets;
}

async function generateFacetProfile(env: Env, source: BaselineSourceData, model: string): Promise<BaselineFacetProfile> {
  if (!env.AI || !env.AI_GATEWAY_ID) throw new Error('Facet generation requires Cloudflare AI Gateway');
  const registry = buildBaselineBasisRegistry(source);
  const batches = baselineFacetBatches();
  const batchResults = await Promise.all(
    batches.map((ids) => generateFacetBatch(env, source, model, ids, registry))
  );
  const profile = baselineFacetProfileSchema.parse({
    version: BASELINE_FACET_CONTRACT_VERSION,
    modelVersion: model,
    sourceComputationVersion: source.computationVersion,
    generatedAt: new Date().toISOString(),
    interpretive: true,
    facets: batchResults.flat()
  });
  return validateFacetProfileBasis(profile, registry);
}

async function generateFacetBatch(
  env: Env,
  source: BaselineSourceData,
  model: string,
  ids: readonly BaselineFacetId[],
  registry: ReturnType<typeof buildBaselineBasisRegistry>
): Promise<BaselineFacet[]> {
  if (!env.AI || !env.AI_GATEWAY_ID) throw new Error('Facet generation requires Cloudflare AI Gateway');
  const prompt = `Create only the requested Sovereign.OS Baseline facets from the exact authorized source data below.

This is interpretive reflection, not psychological measurement. Do not diagnose, predict, infer hidden motives, or fill missing values.
Use ordinary adult language. Make every shadow and gift behaviorally specific. Shadow and Gift are two expressions of the same valid quality, not bad and good identities.
Every facet must cite one or more exact basisRefs from the allowed registry. Use IDs only. Never write a new ID.
Keep each description, shadowExpression, and giftExpression to one concise sentence. Use exactly two alignmentMarkers per facet.
Return JSON only. Do not return profile metadata.

Required facet IDs, exactly once and in this order:
${ids.join(', ')}

Required shape:
{
  "facets": [{
    "id": "one requested facet ID",
    "title": "plain-language title",
    "description": "specific concise interpretation",
    "shadowExpression": "specific observable pressure expression",
    "giftExpression": "specific observable conscious expression",
    "alignmentMarkers": ["observable marker", "observable marker"],
    "uncertainty": "low | medium | high",
    "basisRefs": ["allowed ID"]
  }]
}

Exact source data:
${JSON.stringify(source)}

Allowed Basis registry:
${JSON.stringify(registry.map(({ id, display, uncertainty }) => ({ id, display, uncertainty })))}`;

  let lastError: unknown;
  for (let attempt = 1; attempt <= FACET_BATCH_ATTEMPTS; attempt += 1) {
    try {
      const result = await withTimeout(
        env.AI.run(
          model,
          { prompt, max_completion_tokens: 1_600 },
          {
            gateway: {
              id: env.AI_GATEWAY_ID,
              skipCache: true,
              collectLog: false,
              metadata: {
                response_contract: `${BASELINE_FACET_CONTRACT_VERSION}.batch`,
                source_version: source.version,
                batch_size: ids.length,
                batch_attempt: attempt
              }
            }
          }
        ),
        FACET_BATCH_TIMEOUT_MS,
        `Baseline facet batch ${ids[0]} timed out`
      );
      const raw = await extractAiText(result);
      return parseFacetBatch(raw, ids);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Baseline facet batch ${ids[0]} could not be generated`);
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function buildDevelopmentFacetProfile(source: BaselineSourceData, model: string): BaselineFacetProfile {
  const registry = buildBaselineBasisRegistry(source);
  const primary = registry[0]?.id;
  if (!primary) throw new Error('Development facet fixture requires exact Basis data');
  const titles: Record<BaselineFacetId, string> = {
    core_orientation: 'Core orientation',
    identity_purpose: 'Identity and purpose',
    communication: 'Communication',
    decision_making: 'Decision-making',
    learning: 'Learning',
    creativity_expression: 'Creativity and expression',
    love_connection: 'Love and connection',
    leadership: 'Leadership',
    boundaries: 'Boundaries',
    responsibility: 'Responsibility',
    conflict_repair: 'Conflict and repair',
    response_pressure: 'Response to pressure',
    response_change: 'Response to change',
    underused_capacity: 'Underused capacity',
    shadow_expression: 'Shadow expression',
    gift_expression: 'Gift expression',
    alignment_markers: 'Alignment markers'
  };
  const profile = baselineFacetProfileSchema.parse({
    version: BASELINE_FACET_CONTRACT_VERSION,
    modelVersion: model,
    sourceComputationVersion: source.computationVersion,
    generatedAt: new Date().toISOString(),
    interpretive: true as const,
    facets: baselineFacetIds.map((id) => ({
      id,
      title: titles[id],
      description: `Development-only interpretation for ${titles[id].toLowerCase()}, derived from the recorded authorized fixture.`,
      shadowExpression: 'Under pressure, a valid capacity may narrow into overuse, avoidance, or responsibility taken without agreement.',
      giftExpression: 'With awareness, the same capacity can create direction while leaving room for consent, limits, and shared responsibility.',
      alignmentMarkers: ['Authority and responsibility are named clearly.', 'The person can use the capacity without erasing their limits.'],
      uncertainty: source.uncertainty,
      basisRefs: [primary]
    }))
  });
  return validateFacetProfileBasis(profile, registry);
}

export async function extractAiText(result: unknown): Promise<string> {
  if (result instanceof Response) {
    const text = await result.text();
    try {
      return await extractAiText(JSON.parse(text));
    } catch {
      return text;
    }
  }
  if (typeof result === 'string') return result;
  if (Array.isArray(result)) return (await Promise.all(result.map(extractAiText))).join('');
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>;
    if (typeof record.output_text === 'string') return record.output_text;
    if (typeof record.text === 'string') return record.text;
    if (record.response) return extractAiText(record.response);
    if (record.result) return extractAiText(record.result);
    if (Array.isArray(record.output)) return extractAiText(record.output);
    if (Array.isArray(record.choices)) return (await Promise.all(record.choices.map(extractAiText))).join('');
    if (record.message) return extractAiText(record.message);
    if (record.delta) return extractAiText(record.delta);
    if (record.content) return extractAiText(record.content);
  }
  throw new Error('Facet generator returned no text');
}
