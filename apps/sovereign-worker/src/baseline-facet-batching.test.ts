import { describe, expect, it } from 'vitest';
import { baselineFacetIds } from './baseline-contracts';
import {
  FACET_BATCH_ATTEMPTS,
  FACET_BATCH_SIZE,
  FACET_BATCH_TIMEOUT_MS,
  baselineFacetBatches,
  parseFacetBatch
} from './baseline-facets';

describe('Baseline facet batch preparation', () => {
  it('splits all required facets into bounded batches without loss or duplication', () => {
    const batches = baselineFacetBatches();
    expect(FACET_BATCH_SIZE).toBe(6);
    expect(FACET_BATCH_ATTEMPTS).toBe(2);
    expect(FACET_BATCH_TIMEOUT_MS).toBe(12_000);
    expect(batches.map((batch) => batch.length)).toEqual([6, 6, 5]);
    expect(batches.flat()).toEqual([...baselineFacetIds]);
    expect(new Set(batches.flat()).size).toBe(baselineFacetIds.length);
  });

  it('accepts only the exact requested facet order for a batch', () => {
    const expected = baselineFacetIds.slice(0, 2);
    const facet = (id: (typeof baselineFacetIds)[number]) => ({
      id,
      title: id === 'core_orientation' ? 'Core orientation' : 'Identity and purpose',
      description: 'A specific interpretive description long enough for the contract.',
      shadowExpression: 'Under pressure this quality can narrow into an observable overreach.',
      giftExpression: 'With awareness this quality can become a useful and observable strength.',
      alignmentMarkers: ['The pattern is visible in behavior.', 'The person can choose a different response.'],
      uncertainty: 'low',
      basisRefs: ['natal.sun']
    });

    const valid = JSON.stringify({ facets: expected.map(facet) });
    expect(parseFacetBatch(valid, expected).map((item) => item.id)).toEqual(expected);

    const reversed = JSON.stringify({ facets: [...expected].reverse().map(facet) });
    expect(() => parseFacetBatch(reversed, expected)).toThrow(/expected core_orientation at position 1/i);
  });
});
