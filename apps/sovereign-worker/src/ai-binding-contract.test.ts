import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const sovereign = readFileSync(new URL('./agent/sovereign.ts', import.meta.url), 'utf8');
const facets = readFileSync(new URL('./baseline-facets.ts', import.meta.url), 'utf8');

describe('Workers AI production request contract', () => {
  it('uses the supported GLM prompt and completion-token fields for Sovereign answers', () => {
    expect(sovereign).toContain('{ prompt, max_completion_tokens: 3_200 }');
    expect(sovereign).not.toContain('{ input: prompt, max_output_tokens: 3_200 }');
  });

  it('uses bounded supported GLM prompt and completion-token fields for Baseline facet batches', () => {
    expect(facets).toContain('export const FACET_BATCH_SIZE = 6');
    expect(facets).toContain('export const FACET_BATCH_TIMEOUT_MS = 12_000');
    expect(facets).toContain('export const FACET_BATCH_ATTEMPTS = 2');
    expect(facets).toContain('{ prompt, max_completion_tokens: 1_600 }');
    expect(facets).not.toContain('{ input: prompt, max_output_tokens: 1_600 }');
    expect(facets).not.toContain('{ prompt, max_completion_tokens: 4_200 }');
  });

  it('decodes current chat-completion result shapes for Baseline facet generation', () => {
    expect(facets).toContain('Array.isArray(record.choices)');
    expect(facets).toContain('if (record.message)');
    expect(facets).toContain('if (record.content)');
  });

  it('keeps the privacy-preserving AI Gateway options on both production model calls', () => {
    for (const source of [sovereign, facets]) {
      expect(source).toContain('gateway: {');
      expect(source).toContain('skipCache: true');
      expect(source).toContain('collectLog: false');
    }
  });
});
