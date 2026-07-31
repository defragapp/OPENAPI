import type { Env } from './env';
import { computeConfiguredBaseline } from './baseline';
import { baselineSourceDataSchema, type BaselineSourceData } from './baseline-contracts';
import { ensureBaselineFacetProfile } from './baseline-facets';
import { isValidTimeZone } from './baseline-engine';
import {
  BASELINE_SOURCE_ENVELOPE_VERSION,
  BASELINE_SOURCE_INPUT_VERSION,
  decryptBaselineSource,
  encryptBaselineSource,
  parseCanonicalBaselineSourceInput,
  type CanonicalBaselineSourceInput
} from './baseline-source-crypto';

export const BASELINE_COMPILER_VERSION = 'baseline-compiler.v1-foundation' as const;
export const BASELINE_COMPILER_STAGES = [
  'baseline.resolve_place',
  'baseline.fetch_natal_source',
  'baseline.compute_astrology',
  'baseline.compute_human_design',
  'baseline.compute_gene_keys',
  'baseline.compute_name_systems',
  'baseline.validate',
  'baseline.generate_facets',
  'baseline.finalize'
] as const;

export type BaselineCompilerStage = typeof BASELINE_COMPILER_STAGES[number];
type CompilerValidationStatus = 'pending' | 'supported_reduced' | 'confirmed' | 'failed';
type CompilerRunStatus = 'recompute_queued' | 'computing' | 'validation_failed' | 'facet_generation_pending' | 'ready' | 'degraded' | 'cancelled';
type StageStatus = 'pending' | 'running' | 'completed' | 'unavailable' | 'failed';
type StageExecutionResult = {
  status: 'completed' | 'unavailable';
  output: Record<string, unknown>;
  validationStatus: CompilerValidationStatus;
  uncertainty: 'low' | 'medium' | 'high';
  sourceVersion?: string | undefined;
};

interface CompilerRunRow {
  id: string;
  account_id: string;
  source_input_hash: string;
  compiler_version: string;
  status: CompilerRunStatus;
  current_stage: string | null;
  validation_status: CompilerValidationStatus;
}

interface SourceRecordRow {
  source_contract_version: string;
  source_input_version: string;
  encryption_key_version: string;
  nonce_b64: string;
  ciphertext_b64: string;
  normalized_input_hash: string;
  status: string;
}

interface StageResultRow {
  stage: string;
  status: StageStatus;
  output_json: string;
  validation_status: CompilerValidationStatus;
  uncertainty: 'low' | 'medium' | 'high';
  failure_code: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export async function startBaselineCompilation(env: Env, accountId: string, rawInput: unknown) {
  const input = parseCanonicalBaselineSourceInput(rawInput);
  if (!isValidTimeZone(input.resolvedPlace.timezone)) {
    throw new Response('The confirmed birthplace timezone is invalid.', { status: 400 });
  }
  const encrypted = await encryptBaselineSource(env, accountId, input);
  await env.DB.prepare(`INSERT INTO baseline_source_records (
      account_id, source_contract_version, source_input_version, encryption_key_version,
      nonce_b64, ciphertext_b64, normalized_input_hash, status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', datetime('now'))
    ON CONFLICT(account_id) DO UPDATE SET
      source_contract_version = excluded.source_contract_version,
      source_input_version = excluded.source_input_version,
      encryption_key_version = excluded.encryption_key_version,
      nonce_b64 = excluded.nonce_b64,
      ciphertext_b64 = excluded.ciphertext_b64,
      normalized_input_hash = excluded.normalized_input_hash,
      status = 'confirmed',
      updated_at = datetime('now')`)
    .bind(
      accountId,
      encrypted.version,
      encrypted.sourceInputVersion,
      encrypted.encryptionKeyVersion,
      encrypted.nonceB64,
      encrypted.ciphertextB64,
      encrypted.normalizedInputHash
    )
    .run();

  await env.DB.prepare(`UPDATE baseline_compiler_runs
    SET status = 'cancelled', failure_code = 'source_superseded', updated_at = datetime('now')
    WHERE account_id = ? AND source_input_hash <> ? AND status NOT IN ('ready','degraded','cancelled')`)
    .bind(accountId, encrypted.normalizedInputHash)
    .run();

  const existing = await env.DB.prepare(`SELECT id FROM baseline_compiler_runs
    WHERE account_id = ? AND source_input_hash = ? AND compiler_version = ?`)
    .bind(accountId, encrypted.normalizedInputHash, BASELINE_COMPILER_VERSION)
    .first<{ id: string }>();
  const runId = existing?.id ?? `baseline_run_${crypto.randomUUID()}`;

  if (existing) {
    await env.DB.prepare(`UPDATE baseline_compiler_runs SET
      status = 'recompute_queued', current_stage = ?, validation_status = 'pending',
      failure_code = NULL, started_at = NULL, completed_at = NULL, updated_at = datetime('now')
      WHERE id = ? AND account_id = ?`)
      .bind(BASELINE_COMPILER_STAGES[0], runId, accountId)
      .run();
    await env.DB.prepare('DELETE FROM baseline_compiler_stage_results WHERE run_id = ?').bind(runId).run();
    await env.DB.prepare(`DELETE FROM background_jobs
      WHERE account_id = ? AND kind LIKE 'baseline.%' AND status IN ('queued','running')`)
      .bind(accountId)
      .run();
  } else {
    await env.DB.prepare(`INSERT INTO baseline_compiler_runs (
      id, account_id, source_input_hash, compiler_version, status, current_stage, validation_status
    ) VALUES (?, ?, ?, ?, 'recompute_queued', ?, 'pending')`)
      .bind(runId, accountId, encrypted.normalizedInputHash, BASELINE_COMPILER_VERSION, BASELINE_COMPILER_STAGES[0])
      .run();
  }

  await writePendingBaselineState(env, accountId, runId, encrypted.normalizedInputHash);
  await enqueueCompilerStage(env, accountId, runId, BASELINE_COMPILER_STAGES[0]);
  return {
    accepted: true,
    runId,
    status: 'recompute_queued' as const,
    currentStage: BASELINE_COMPILER_STAGES[0],
    sourceInputVersion: BASELINE_SOURCE_INPUT_VERSION,
    sourceEnvelopeVersion: BASELINE_SOURCE_ENVELOPE_VERSION,
    compilerVersion: BASELINE_COMPILER_VERSION
  };
}

export async function getBaselineCompilerStatus(env: Env, accountId: string) {
  const run = await env.DB.prepare(`SELECT id, account_id, source_input_hash, compiler_version,
      status, current_stage, validation_status
    FROM baseline_compiler_runs WHERE account_id = ? ORDER BY created_at DESC LIMIT 1`)
    .bind(accountId)
    .first<CompilerRunRow>();
  if (!run) return { status: 'not_started' as const };
  const stages = await env.DB.prepare(`SELECT stage, status, output_json, validation_status,
      uncertainty, failure_code, started_at, completed_at
    FROM baseline_compiler_stage_results WHERE run_id = ? ORDER BY created_at`)
    .bind(run.id)
    .all<StageResultRow>();
  return {
    runId: run.id,
    status: run.status,
    currentStage: run.current_stage,
    validationStatus: run.validation_status,
    compilerVersion: run.compiler_version,
    stages: (stages.results ?? []).map((stage) => ({
      stage: stage.stage,
      status: stage.status,
      validationStatus: stage.validation_status,
      uncertainty: stage.uncertainty,
      failureCode: stage.failure_code,
      startedAt: stage.started_at,
      completedAt: stage.completed_at
    }))
  };
}

export async function runBaselineCompilerStage(env: Env, runId: string, requestedStage: string) {
  if (!isBaselineCompilerStage(requestedStage)) throw new Error('baseline_stage_unsupported');
  const run = await env.DB.prepare(`SELECT id, account_id, source_input_hash, compiler_version,
      status, current_stage, validation_status
    FROM baseline_compiler_runs WHERE id = ?`)
    .bind(runId)
    .first<CompilerRunRow>();
  if (!run) throw new Error('baseline_run_missing');
  if (run.status === 'cancelled') return { runId, stage: requestedStage, status: 'cancelled' as const };
  if (run.compiler_version !== BASELINE_COMPILER_VERSION) throw new Error('baseline_compiler_version_mismatch');
  if (run.current_stage !== requestedStage) throw new Error('baseline_stage_out_of_order');

  const sourceRecord = await loadSourceRecord(env, run.account_id, run.source_input_hash);
  const source = await decryptBaselineSource(env, run.account_id, {
    encryptionKeyVersion: sourceRecord.encryption_key_version,
    nonceB64: sourceRecord.nonce_b64,
    ciphertextB64: sourceRecord.ciphertext_b64
  });

  await markStageRunning(env, run, requestedStage);
  try {
    const result = await executeStage(env, run, requestedStage, source);
    await completeStage(env, run, requestedStage, result);
    const next = nextStage(requestedStage);
    if (next) {
      const runStatus = next === 'baseline.generate_facets' ? 'facet_generation_pending' : 'computing';
      await env.DB.prepare(`UPDATE baseline_compiler_runs SET
        status = ?, current_stage = ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(runStatus, next, run.id)
        .run();
      await enqueueCompilerStage(env, run.account_id, run.id, next);
    }
    return { runId, stage: requestedStage, status: result.status };
  } catch (error) {
    const failureCode = safeFailureCode(error);
    await env.DB.prepare(`UPDATE baseline_compiler_stage_results SET
      status = 'failed', validation_status = 'failed', failure_code = ?, output_json = '{}',
      completed_at = datetime('now'), updated_at = datetime('now')
      WHERE run_id = ? AND stage = ?`)
      .bind(failureCode, run.id, requestedStage)
      .run();
    await env.DB.prepare(`UPDATE baseline_compiler_runs SET
      status = 'validation_failed', validation_status = 'failed', failure_code = ?,
      completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
      .bind(failureCode, run.id)
      .run();
    await env.DB.prepare(`UPDATE baseline_onboarding SET
      status = 'validation_failed', provider_status = 'unavailable', updated_at = datetime('now')
      WHERE account_id = ?`)
      .bind(run.account_id)
      .run();
    throw new Error(failureCode);
  }
}

function isBaselineCompilerStage(value: string): value is BaselineCompilerStage {
  return (BASELINE_COMPILER_STAGES as readonly string[]).includes(value);
}

async function executeStage(
  env: Env,
  run: CompilerRunRow,
  stage: BaselineCompilerStage,
  source: CanonicalBaselineSourceInput
): Promise<StageExecutionResult> {
  switch (stage) {
    case 'baseline.resolve_place':
      return {
        status: 'completed',
        output: {
          confirmed: true,
          locationPrecision: 'city',
          historicalTimezoneResolved: true,
          resolverSource: source.resolvedPlace.resolverSource,
          resolverVersion: source.resolvedPlace.resolverVersion,
          confidence: source.resolvedPlace.confidence
        },
        validationStatus: 'confirmed',
        uncertainty: source.resolvedPlace.confidence === 'high' ? 'low' : source.resolvedPlace.confidence === 'medium' ? 'medium' : 'high'
      };
    case 'baseline.fetch_natal_source': {
      if (source.birthTimeCertainty === 'window') {
        return unavailableStage('birth_time_window_engine_not_implemented');
      }
      const computed = await computeConfiguredBaseline(env, {
        birthDate: source.birthDate,
        birthTimeCertainty: source.birthTimeCertainty,
        birthplace: source.resolvedPlace.displayName,
        birthTimezone: source.resolvedPlace.timezone,
        locationPrecision: 'city_or_regional',
        ...(source.birthTime ? { birthTime: source.birthTime } : {})
      });
      if (computed.status !== 'completed') throw new Error('baseline_natal_source_unavailable');
      return {
        status: 'completed',
        output: { computed },
        validationStatus: 'supported_reduced',
        uncertainty: source.birthTimeCertainty === 'exact' ? 'low' : source.birthTimeCertainty === 'approximate' ? 'medium' : 'high',
        sourceVersion: baselineSourceVersion(computed)
      };
    }
    case 'baseline.compute_astrology': {
      const sourceData = await readFetchedSourceData(env, run.id);
      return {
        status: 'completed',
        output: {
          supported: ['natal_placements', 'major_aspects'],
          unavailable: ['ascendant', 'midheaven', 'house_cusps', 'placement_houses'],
          valueCount: sourceData.natalBodies.length + sourceData.aspects.length
        },
        validationStatus: 'supported_reduced',
        uncertainty: sourceData.uncertainty,
        sourceVersion: sourceData.version
      };
    }
    case 'baseline.compute_human_design':
      return unavailableStage('complete_human_design_not_implemented');
    case 'baseline.compute_gene_keys':
      return unavailableStage('complete_gene_keys_not_implemented');
    case 'baseline.compute_name_systems':
      return unavailableStage('name_systems_not_implemented');
    case 'baseline.validate': {
      const sourceData = await readFetchedSourceData(env, run.id);
      baselineSourceDataSchema.parse(sourceData);
      return {
        status: 'completed',
        output: {
          validationLevel: 'supported_reduced',
          fullCompilerReady: false,
          unavailableModules: ['houses', 'complete_human_design', 'complete_gene_keys', 'name_systems']
        },
        validationStatus: 'supported_reduced',
        uncertainty: sourceData.uncertainty,
        sourceVersion: sourceData.version
      };
    }
    case 'baseline.generate_facets': {
      const sourceData = await readFetchedSourceData(env, run.id);
      const profile = await ensureBaselineFacetProfile(env, {
        accountId: run.account_id,
        inputHash: run.source_input_hash,
        source: sourceData,
        refresh: true
      });
      if (!profile) throw new Error('baseline_facets_unavailable');
      return {
        status: 'completed',
        output: { profile },
        validationStatus: 'supported_reduced',
        uncertainty: sourceData.uncertainty,
        sourceVersion: profile.version
      };
    }
    case 'baseline.finalize': {
      const fetched = await readStageOutput(env, run.id, 'baseline.fetch_natal_source');
      const generated = await readStageOutput(env, run.id, 'baseline.generate_facets');
      const computed = asRecord(fetched.computed);
      const reducedContext = asRecord(computed.reducedContext);
      const profile = generated.profile;
      const finalContext = {
        ...reducedContext,
        facetProfile: profile,
        facetProfileStatus: profile ? 'ready' : 'pending',
        compiler: {
          runId: run.id,
          version: BASELINE_COMPILER_VERSION,
          validationStatus: 'supported_reduced',
          completeness: 'reduced',
          fullCompilerReady: false
        }
      };
      const provenance = {
        ...asRecord(computed.provenance),
        compilerVersion: BASELINE_COMPILER_VERSION,
        encryptedRecomputableSource: true,
        fullCompilerReady: false
      };
      await env.DB.prepare(`INSERT INTO baseline_onboarding (
          account_id, input_hash, protected_input_json, reduced_context_json, computation_version,
          provenance_json, status, uncertainty, last_computed_at, provider_status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'degraded', ?, datetime('now'), 'computed', datetime('now'))
        ON CONFLICT(account_id) DO UPDATE SET
          input_hash = excluded.input_hash,
          protected_input_json = excluded.protected_input_json,
          reduced_context_json = excluded.reduced_context_json,
          computation_version = excluded.computation_version,
          provenance_json = excluded.provenance_json,
          status = 'degraded',
          uncertainty = excluded.uncertainty,
          last_computed_at = datetime('now'),
          provider_status = 'computed',
          updated_at = datetime('now')`)
        .bind(
          run.account_id,
          run.source_input_hash,
          JSON.stringify({ sourceRecord: 'encrypted', sourceInputVersion: BASELINE_SOURCE_INPUT_VERSION }),
          JSON.stringify(finalContext),
          String(computed.computationVersion ?? BASELINE_COMPILER_VERSION),
          JSON.stringify(provenance),
          String(computed.uncertainty ?? 'high')
        )
        .run();
      await env.DB.prepare(`UPDATE baseline_compiler_runs SET
        status = 'degraded', current_stage = NULL, validation_status = 'supported_reduced',
        failure_code = NULL, completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
        .bind(run.id)
        .run();
      return {
        status: 'completed',
        output: { status: 'degraded', fullCompilerReady: false },
        validationStatus: 'supported_reduced',
        uncertainty: computed.uncertainty === 'low' || computed.uncertainty === 'medium' ? computed.uncertainty : 'high'
      };
    }
  }
}

function unavailableStage(reason: string): StageExecutionResult {
  return {
    status: 'unavailable',
    output: { reason, guessed: false },
    validationStatus: 'pending',
    uncertainty: 'high'
  };
}

async function loadSourceRecord(env: Env, accountId: string, expectedHash: string): Promise<SourceRecordRow> {
  const row = await env.DB.prepare(`SELECT source_contract_version, source_input_version,
      encryption_key_version, nonce_b64, ciphertext_b64, normalized_input_hash, status
    FROM baseline_source_records WHERE account_id = ?`)
    .bind(accountId)
    .first<SourceRecordRow>();
  if (!row || row.status !== 'confirmed' || row.normalized_input_hash !== expectedHash) {
    throw new Error('baseline_source_record_unavailable');
  }
  return row;
}

async function markStageRunning(env: Env, run: CompilerRunRow, stage: BaselineCompilerStage) {
  await env.DB.prepare(`UPDATE baseline_compiler_runs SET
    status = 'computing', current_stage = ?, started_at = COALESCE(started_at, datetime('now')),
    updated_at = datetime('now') WHERE id = ?`)
    .bind(stage, run.id)
    .run();
  await env.DB.prepare(`INSERT INTO baseline_compiler_stage_results (
      id, run_id, stage, status, output_json, validation_status, uncertainty, started_at, updated_at
    ) VALUES (?, ?, ?, 'running', '{}', 'pending', 'high', datetime('now'), datetime('now'))
    ON CONFLICT(run_id, stage) DO UPDATE SET
      status = 'running', output_json = '{}', validation_status = 'pending', uncertainty = 'high',
      failure_code = NULL, started_at = datetime('now'), completed_at = NULL, updated_at = datetime('now')`)
    .bind(`baseline_stage_${crypto.randomUUID()}`, run.id, stage)
    .run();
}

async function completeStage(
  env: Env,
  run: CompilerRunRow,
  stage: BaselineCompilerStage,
  result: StageExecutionResult
) {
  await env.DB.prepare(`UPDATE baseline_compiler_stage_results SET
    status = ?, output_json = ?, validation_status = ?, uncertainty = ?, source_version = ?,
    failure_code = NULL, completed_at = datetime('now'), updated_at = datetime('now')
    WHERE run_id = ? AND stage = ?`)
    .bind(
      result.status,
      JSON.stringify(result.output),
      result.validationStatus,
      result.uncertainty,
      result.sourceVersion ?? null,
      run.id,
      stage
    )
    .run();
}

async function enqueueCompilerStage(env: Env, accountId: string, runId: string, stage: BaselineCompilerStage) {
  await env.DB.prepare(`INSERT INTO background_jobs (
    id, account_id, kind, status, payload_json, max_attempts, run_after
  ) VALUES (?, ?, ?, 'queued', ?, 4, datetime('now'))`)
    .bind(`job_${crypto.randomUUID()}`, accountId, stage, JSON.stringify({ runId }))
    .run();
}

function nextStage(stage: BaselineCompilerStage): BaselineCompilerStage | null {
  const index = BASELINE_COMPILER_STAGES.indexOf(stage);
  return BASELINE_COMPILER_STAGES[index + 1] ?? null;
}

async function readFetchedSourceData(env: Env, runId: string): Promise<BaselineSourceData> {
  const output = await readStageOutput(env, runId, 'baseline.fetch_natal_source');
  const computed = asRecord(output.computed);
  const reduced = asRecord(computed.reducedContext);
  return baselineSourceDataSchema.parse(reduced.sourceData);
}

async function readStageOutput(env: Env, runId: string, stage: BaselineCompilerStage): Promise<Record<string, unknown>> {
  const row = await env.DB.prepare(`SELECT output_json FROM baseline_compiler_stage_results
    WHERE run_id = ? AND stage = ? AND status = 'completed'`)
    .bind(runId, stage)
    .first<{ output_json: string }>();
  if (!row) throw new Error('baseline_prior_stage_unavailable');
  return safeJson(row.output_json);
}

async function writePendingBaselineState(env: Env, accountId: string, runId: string, inputHash: string) {
  await env.DB.prepare(`INSERT INTO baseline_onboarding (
      account_id, input_hash, protected_input_json, reduced_context_json, computation_version,
      provenance_json, status, uncertainty, last_computed_at, provider_status, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'recompute_queued', 'high', datetime('now'), 'pending', datetime('now'))
    ON CONFLICT(account_id) DO UPDATE SET
      input_hash = excluded.input_hash,
      protected_input_json = excluded.protected_input_json,
      reduced_context_json = excluded.reduced_context_json,
      computation_version = excluded.computation_version,
      provenance_json = excluded.provenance_json,
      status = 'recompute_queued', uncertainty = 'high', provider_status = 'pending', updated_at = datetime('now')`)
    .bind(
      accountId,
      inputHash,
      JSON.stringify({ sourceRecord: 'encrypted', sourceInputVersion: BASELINE_SOURCE_INPUT_VERSION }),
      JSON.stringify({ compiler: { runId, version: BASELINE_COMPILER_VERSION, status: 'recompute_queued' } }),
      BASELINE_COMPILER_VERSION,
      JSON.stringify({ encryptedRecomputableSource: true, rawBirthInputReturned: false })
    )
    .run();
}

function baselineSourceVersion(computed: unknown): string | undefined {
  const reduced = asRecord(asRecord(computed).reducedContext);
  const source = asRecord(reduced.sourceData);
  return typeof source.version === 'string' ? source.version : undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function safeJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return asRecord(parsed);
  } catch {
    return {};
  }
}

function safeFailureCode(error: unknown): string {
  const code = error instanceof Error ? error.message : 'baseline_stage_failed';
  const allowed = new Set([
    'baseline_stage_unsupported',
    'baseline_run_missing',
    'baseline_compiler_version_mismatch',
    'baseline_stage_out_of_order',
    'baseline_source_record_unavailable',
    'baseline_source_key_version_unavailable',
    'baseline_source_encryption_key_missing',
    'baseline_source_encryption_key_version_missing',
    'baseline_source_encryption_key_invalid',
    'baseline_natal_source_unavailable',
    'baseline_facets_unavailable',
    'baseline_prior_stage_unavailable'
  ]);
  return allowed.has(code) ? code : 'baseline_stage_failed';
}
