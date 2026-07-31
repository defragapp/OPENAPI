import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Env } from './env';

const getRunStatus = vi.hoisted(() => vi.fn());

vi.mock('./baseline-compiler', () => ({
  getBaselineCompilerStatus: getRunStatus
}));

import { getBaselineCompilerStatus } from './baseline-compiler-status';

function envWithLegacyRow(row: Record<string, unknown> | null): Env {
  return {
    APP_ENV: 'test',
    APP_VERSION: 'baseline-status-test',
    DB: {
      prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
          first: vi.fn(async () => row)
        }))
      }))
    } as unknown as D1Database,
    THREADS: {} as DurableObjectNamespace,
    STRIPE_SECRET_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
    SESSION_SIGNING_SECRET: 'test-session-secret'
  };
}

describe('Baseline compiler status', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns the active compiler run without consulting legacy output', async () => {
    getRunStatus.mockResolvedValue({
      runId: 'baseline_run_active',
      status: 'computing',
      currentStage: 'baseline.compute_astrology'
    });
    const env = envWithLegacyRow({ status: 'legacy_reduced' });

    await expect(getBaselineCompilerStatus(env, 'acct_test')).resolves.toEqual({
      runId: 'baseline_run_active',
      status: 'computing',
      currentStage: 'baseline.compute_astrology'
    });
    expect(env.DB.prepare).not.toHaveBeenCalled();
  });

  it('requires source re-entry for migrated reduced Baselines', async () => {
    getRunStatus.mockResolvedValue({ status: 'not_started' });
    const env = envWithLegacyRow({
      status: 'legacy_reduced',
      provider_status: 'source_reentry_required',
      computation_version: 'openapi-baseline-engine-v3',
      uncertainty: 'medium'
    });

    await expect(getBaselineCompilerStatus(env, 'acct_test')).resolves.toEqual({
      status: 'legacy_reduced',
      sourceStatus: 'source_reentry_required',
      computationVersion: 'openapi-baseline-engine-v3',
      uncertainty: 'medium',
      message: 'This Baseline contains reduced output only. Re-enter the private source to create an encrypted recomputable Baseline.'
    });
  });

  it('does not invent a legacy status when no Baseline exists', async () => {
    getRunStatus.mockResolvedValue({ status: 'not_started' });
    const env = envWithLegacyRow(null);

    await expect(getBaselineCompilerStatus(env, 'acct_test')).resolves.toEqual({ status: 'not_started' });
  });
});
