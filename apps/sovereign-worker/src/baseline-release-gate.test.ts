import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const runtimeSource = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');

describe('full Baseline compiler release gate', () => {
  it('keeps readiness blocked until a distinct reviewed approval change', () => {
    expect(runtimeSource).toContain("const FULL_BASELINE_COMPILER_APPROVAL = 'validation-pending'");
    expect(runtimeSource).toContain('baselineFullCompiler: FULL_BASELINE_COMPILER_APPROVAL');
    expect(runtimeSource).toContain("dependencies.baselineFullCompiler === 'configured'");
    expect(runtimeSource).not.toContain("const FULL_BASELINE_COMPILER_APPROVAL = 'configured'");
  });

  it('reports the staged compiler migration without authorizing release', () => {
    expect(runtimeSource).toContain("migrationVersion: '0014_baseline_compiler_foundation'");
    expect(runtimeSource).toContain("baselineContract: 'baseline-source-submission.v1+baseline-source-input.v2+baseline-source-envelope.v1+baseline-source.v1+baseline-facets.v1'");
  });
});
