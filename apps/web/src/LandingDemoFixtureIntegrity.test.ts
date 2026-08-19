import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  representativeBaselineFacetIds,
  SELF_CLAIM_SUPPORT,
  SELF_PRODUCT_PROOF,
  SELF_REPRESENTATIVE_PROFILE,
  SELF_REPRESENTATIVE_SOURCES,
  validateRepresentativeSelfFixture
} from './landing-demo-fixtures';

const workerBaselineContract = readFileSync(
  new URL('../../sovereign-worker/src/baseline-contracts.ts', import.meta.url),
  'utf8'
);

const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

describe('representative landing intelligence fixtures', () => {
  it('keeps the Self fixture aligned with the production Baseline facet contract', () => {
    expect(() => validateRepresentativeSelfFixture()).not.toThrow();
    expect(SELF_REPRESENTATIVE_PROFILE.facets).toHaveLength(representativeBaselineFacetIds.length);

    for (const id of representativeBaselineFacetIds) {
      expect(workerBaselineContract).toContain(`'${id}'`);
      expect(SELF_REPRESENTATIVE_PROFILE.facets.some((facet) => facet.id === id)).toBe(true);
    }
  });

  it('keeps every representative facet grounded in the explicit source registry', () => {
    const sourceIds = new Set(SELF_REPRESENTATIVE_SOURCES.map((source) => source.id));
    const sourceCodes = SELF_REPRESENTATIVE_SOURCES.map((source) => source.code);

    expect(sourceCodes).toEqual(['HD G13.1', 'GK ACT13', 'N LP1', '☉ CAN 04.2°']);
    for (const facet of SELF_REPRESENTATIVE_PROFILE.facets) {
      expect(facet.basisRefs.length).toBeGreaterThan(0);
      expect(facet.basisRefs.every((id) => sourceIds.has(id))).toBe(true);
    }
  });

  it('requires semantic facet support for every marketing claim', () => {
    const facets = new Set(SELF_REPRESENTATIVE_PROFILE.facets.map((facet) => facet.id));
    const claims = SELF_CLAIM_SUPPORT.map((support) => support.claim);

    expect(claims).toEqual([
      'fast-relational-attunement',
      'outside-in-pressure',
      'decision-crowding',
      'underused-self-position',
      'alignment-after-self-positioning'
    ]);

    for (const support of SELF_CLAIM_SUPPORT) {
      expect(support.facets.length).toBeGreaterThan(0);
      expect(support.facets.every((id) => facets.has(id))).toBe(true);
      expect(support.explanation.length).toBeGreaterThan(24);
    }
  });

  it('keeps the Self marketing proof human, concise, and framework-light in the user prompt', () => {
    expect(SELF_PRODUCT_PROOF.question).toBe('Why am I so good at knowing what everyone else needs from me, but so unsure what I want?');
    expect(SELF_PRODUCT_PROOF.question).not.toMatch(/Baseline|Shadow|Gift|Alignment|Human Design|Gene Keys|natal|facet/i);

    const visibleAnswer = [
      SELF_PRODUCT_PROOF.directAnswer,
      ...SELF_PRODUCT_PROOF.mechanism,
      SELF_PRODUCT_PROOF.insight,
      SELF_PRODUCT_PROOF.closing
    ].join(' ');

    expect(wordCount(visibleAnswer)).toBeGreaterThanOrEqual(90);
    expect(wordCount(visibleAnswer)).toBeLessThanOrEqual(150);
    expect(SELF_PRODUCT_PROOF.insight).toContain('responsiveness become the way the decision gets made');
  });
});
