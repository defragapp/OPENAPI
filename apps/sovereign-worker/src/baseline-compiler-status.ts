import type { Env } from './env';
import { getBaselineCompilerStatus as getRunStatus } from './baseline-compiler';

interface LegacyBaselineRow {
  status: string;
  provider_status: string;
  computation_version: string;
  uncertainty: string;
}

export async function getBaselineCompilerStatus(env: Env, accountId: string) {
  const runStatus = await getRunStatus(env, accountId);
  if (runStatus.status !== 'not_started') return runStatus;

  const legacy = await env.DB.prepare(`SELECT status, provider_status, computation_version, uncertainty
    FROM baseline_onboarding WHERE account_id = ?`)
    .bind(accountId)
    .first<LegacyBaselineRow>();
  if (!legacy) return runStatus;

  if (legacy.status === 'legacy_reduced' || legacy.provider_status === 'source_reentry_required') {
    return {
      status: 'legacy_reduced' as const,
      sourceStatus: 'source_reentry_required' as const,
      computationVersion: legacy.computation_version,
      uncertainty: legacy.uncertainty,
      message: 'This Baseline contains reduced output only. Re-enter the private source to create an encrypted recomputable Baseline.'
    };
  }

  return {
    status: legacy.status,
    sourceStatus: 'unavailable' as const,
    computationVersion: legacy.computation_version,
    uncertainty: legacy.uncertainty
  };
}
