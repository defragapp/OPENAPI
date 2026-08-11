import app from '../apps/sovereign-worker/src/entry';
import { createSignedSessionToken } from '../apps/sovereign-worker/src/security/auth';
import type { Env } from '../apps/sovereign-worker/src/env';
import { resolveAiModelConfig } from '../packages/agent-contracts/src/model-config';
import { runSovereignResult } from '../apps/sovereign-worker/src/agent/sovereign';
import {
  BASELINE_FACET_CONTRACT_VERSION,
  BASELINE_SOURCE_VERSION,
  baselineFacetIds
} from '../apps/sovereign-worker/src/baseline-contracts';

const config = resolveAiModelConfig({
  AI_PROVIDER: 'cloudflare-gateway',
  AI_MODEL: '@cf/zai-org/glm-4.7-flash'
});

const sourceData = {
  version: BASELINE_SOURCE_VERSION,
  computationVersion: 'worker-gateway-smoke-v1',
  computedAt: '2026-08-11T00:00:00.000Z',
  uncertainty: 'low' as const,
  natalBodies: [{
    id: 'natal.sun', body: 'sun', sign: 'Cancer', longitude: 94.2,
    displayDegree: '04.2°', retrograde: false, uncertainty: 'low' as const
  }],
  aspects: [],
  humanDesign: { personalityActivations: [{ id: 'hd.personality.sun', body: 'sun', gate: 13, line: 1, uncertainty: 'low' as const }] },
  geneKeys: { activations: [{ id: 'gk.activation.sun', body: 'sun', activation: 13, uncertainty: 'low' as const }] },
  numerology: [{ id: 'numerology.lifePath', key: 'lifePath' as const, value: 1, uncertainty: 'low' as const }],
  houses: null,
  provenance: {
    astronomy: 'Verified smoke fixture', observerCenter: 'Earth geocenter', timezoneResolution: 'Verified smoke fixture',
    birthTimeCertainty: 'exact' as const, rawBirthInputReturned: false as const, exactPrivateLocationReturned: false as const,
    completeHumanDesignClaimed: false as const, completeGeneKeysClaimed: false as const, housesClaimed: false as const
  }
};

const facetProfile = {
  version: BASELINE_FACET_CONTRACT_VERSION,
  modelVersion: config.model,
  sourceComputationVersion: sourceData.computationVersion,
  generatedAt: '2026-08-11T00:00:01.000Z',
  interpretive: true as const,
  facets: baselineFacetIds.map((id) => ({
    id,
    title: id.replaceAll('_', ' '),
    description: `A specific authorized description for the ${id.replaceAll('_', ' ')} Baseline facet.`,
    shadowExpression: 'Under pressure, the valid capacity may narrow into overuse or responsibility taken without agreement.',
    giftExpression: 'With awareness, the same capacity can create direction while preserving consent and shared responsibility.',
    alignmentMarkers: ['Authority and responsibility are named clearly.', 'The capacity can be used without erasing personal limits.'],
    uncertainty: 'low' as const,
    basisRefs: ['natal.sun']
  }))
};

const reducedContext = JSON.stringify({ sourceData, facetProfile });

function redact(value: string): string {
  return value.replace(/[a-z0-9_-]{24,}/gi, '[redacted]').slice(0, 500);
}

function fakeEnv(): Env {
  const accounts = new Map<string, string>();
  const threads = new Map<string, string>();
  const turns = new Map<string, any>();
  const events: unknown[] = [];
  let seq = 0;
  const db = { prepare(sql: string) { return { bind(...args: unknown[]) { return {
    async first() {
      if (sql.includes('SELECT 1 AS ok')) return { ok: 1 };
      if (sql.startsWith('SELECT id, auth_subject')) { const id = accounts.get(args[0] as string); return id ? { id, auth_subject: args[0] } : null; }
      if (sql.startsWith('SELECT account_id FROM threads')) { const accountId = threads.get(args[0] as string); return accountId ? { account_id: accountId } : null; }
      if (sql.startsWith('SELECT status, uncertainty, reduced_context_json')) return {
        status: 'completed', uncertainty: 'low', reduced_context_json: reducedContext,
        provenance_json: JSON.stringify({ deterministicCalculation: true, interpretiveFrameworks: true }),
        computation_version: sourceData.computationVersion, last_computed_at: sourceData.computedAt, provider_status: 'computed'
      };
      if (sql.startsWith('SELECT status, reduced_context_json, provider_status FROM baseline_onboarding')) return {
        status: 'completed', reduced_context_json: reducedContext, provider_status: 'computed'
      };
      if (sql.includes('FROM baseline_facet_profiles')) return {
        input_hash: 'smoke-input', calculation_version: sourceData.computationVersion,
        facet_contract_version: BASELINE_FACET_CONTRACT_VERSION, model_version: config.model,
        profile_json: JSON.stringify(facetProfile)
      };
      if (sql.startsWith('SELECT plan')) return null;
      if (sql.includes('INSERT INTO ai_usage_windows')) return { turns_used: 1 };
      if (sql.startsWith('SELECT thread_id')) return turns.get(`${args[0]}:${args[1]}:${args[2]}`) ?? null;
      return null;
    },
    async run() {
      if (sql.startsWith('INSERT INTO accounts')) accounts.set(args[1] as string, args[0] as string);
      if (sql.startsWith('INSERT INTO persons')) return { success: true, meta: { changes: 1 } };
      if (sql.startsWith('INSERT INTO threads')) threads.set(args[0] as string, args[1] as string);
      if (sql.startsWith('INSERT OR IGNORE INTO thread_events')) events.push(args);
      if (sql.startsWith('INSERT OR IGNORE INTO thread_turn_states')) turns.set(`${args[2]}:${args[1]}:${args[3]}`, { thread_id: args[1], account_id: args[2], idempotency_key: args[3], seq: args[4], status: args[5] });
      if (sql.startsWith('UPDATE thread_turn_states')) { const turn = turns.get(`${args[3]}:${args[4]}:${args[5]}`); if (turn) turn.status = args[0]; }
      return { success: true, meta: { changes: 1 } };
    },
    async all() { return { results: [] }; }
  }; } }; } } as unknown as D1Database;
  return {
    APP_ENV: 'test', APP_VERSION: 'worker-gateway-smoke', AI_PROVIDER: config.provider, AI_MODEL: config.model, AI_GATEWAY_ID: 'sovereign',
    STRIPE_SECRET_KEY: '', STRIPE_WEBHOOK_SECRET: '', SOVV_INTERNAL_BASE_URL: '', SOVV_INTERNAL_AUTH_TOKEN: '', SESSION_SIGNING_SECRET: 'secret', DB: db,
    THREADS: { idFromName: (name: string) => ({ name }) as DurableObjectId, get: () => ({ fetch: async () => Response.json({ sequence: ++seq, duplicate: false }) }) as unknown as DurableObjectStub } as unknown as DurableObjectNamespace,
    AI: { async run(model: string, input: unknown, options?: unknown) {
      if (model !== config.model) throw new Error(`invalid model ${redact(model)}`);
      const gateway = (options as any)?.gateway;
      if (gateway?.id !== 'sovereign' || gateway?.skipCache !== true || gateway?.collectLog !== false || gateway?.metadata?.plan !== 'free' || gateway?.metadata?.response_contract !== 'sovereign-answer.v2' || !gateway?.metadata?.account_ref) throw new Error('invalid gateway metadata');
      if (JSON.stringify(options).includes('acct_')) throw new Error('raw account id leaked');
      if (JSON.stringify(input).match(/"birthDate"|"birthTime"|"birthplace"|"latitude"|workspace\/SOVV/i)) throw new Error('private model input leaked');
      return { output_text: JSON.stringify({
        version: 'sovereign-answer.v2',
        mode: 'baseline',
        depth: 'standard',
        headline: 'Direction can become responsibility quickly.',
        direct_answer: 'You may be quick to create direction when a situation has no clear owner. That capacity becomes costly when consequences become yours without matching authority.',
        sections: [
          { id: 'shadow', label: 'Shadow', body: 'You may end uncertainty by taking over before responsibility is shared.' },
          { id: 'gift', label: 'Gift', body: 'You can create structure while leaving ownership visible and shared.' }
        ],
        basis_refs: ['natal.sun'],
        correction_prompt: 'Does this fit your experience?',
        actions: [],
        confidence: 'supported',
        safety_mode: 'standard'
      }) };
    } }
  };
}

async function main(): Promise<void> {
  const env = fakeEnv();
  try {
    await runSovereignResult('I already sent three messages, but I still want to explain it better.', {
      env,
      accountId: 'acct_worker_gateway_smoke',
      threadId: 't-smoke',
      traceId: 'trace-worker-gateway-smoke',
      covenantEnabled: false,
      plan: 'free'
    });
  } catch (error) {
    throw new Error(`direct worker gateway smoke failed: ${redact(error instanceof Error ? error.message : String(error))}`);
  }
  const token = await createSignedSessionToken({ sub: 'user:worker-gateway-smoke', exp: Math.floor(Date.now() / 1000) + 60 }, 'secret');
  const res = await app.fetch(new Request('https://app.test/api/v1/threads/t-smoke/messages', { method: 'POST', headers: { authorization: `Bearer ${token}`, origin: 'https://app.test', 'content-type': 'application/json', 'x-idempotency-key': 'smoke-1' }, body: JSON.stringify({ message: 'I already sent three messages, but I still want to explain it better.', context: { surface: 'Today' } }) }), env, {} as ExecutionContext);
  const text = await res.text();
  if (res.status !== 202) throw new Error(`worker gateway smoke failed status=${res.status} body=${redact(text)}`);
  for (const phrase of ['Direction can become responsibility quickly.', 'SHADOW', 'GIFT']) if (!text.includes(phrase)) throw new Error(`missing ${phrase}`);
  console.log(`Worker Gateway smoke passed status=${res.status} response_chars=${text.length} contract=sovereign-answer.v2 provider=${config.provider} model=${config.model}`);
}

main().catch((error) => { console.error(redact(error instanceof Error ? error.message : String(error))); process.exit(1); });
