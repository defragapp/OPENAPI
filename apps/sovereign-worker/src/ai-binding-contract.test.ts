import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const sovereign = readFileSync(new URL('./agent/sovereign.ts', import.meta.url), 'utf8');
const facets = readFileSync(new URL('./baseline-facets.ts', import.meta.url), 'utf8');

describe('Workers AI production request contract', () => {
  it('uses the supported GLM prompt and completion-token fields for Sovereign answers', () => {
    expect(sovereign).toContain('{ prompt, max_completion_tokens: 3_200 }');
    expect(sovereign).not.toContain('{ input: prompt, max_output_tokens: 3_200 }');
  });

  it('uses the supported GLM prompt and completion-token fields for Baseline facet generation', () => {
    expect(facets).toContain('{ prompt, max_completion_tokens: 4_200 }');
    expect(facets).not.toContain('{ input: prompt, max_output_tokens: 4_200 }');
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
