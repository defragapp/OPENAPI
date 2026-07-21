import { describe, expect, it } from 'vitest';
import { applyBiblicalLens, assertCovenantSafe, normalizeReference, retrieveScripture } from './scripture';

describe('Covenant Scripture provider', () => {
  it('normalizes references and retrieves configured fixture passages with citations', () => {
    expect(normalizeReference('  James   1:5 ')).toBe('james 1:5');
    const passage = retrieveScripture('James 1:5', 'WEB');
    expect(passage.citation).toBe('James 1:5 (WEB)');
    expect(passage.text).toContain('wisdom');
  });

  it('separates passage retrieval from interpretation', () => {
    const passage = retrieveScripture('Romans 12:18', 'WEB');
    const lens = applyBiblicalLens(passage, 'a family boundary');
    expect(lens.passage).toEqual(passage);
    expect(lens.interpretation).toContain('Interpretation:');
    expect(lens.boundaries).toContain('Scripture is separate from interpretation.');
  });

  it('fails closed for unavailable passages and translations', () => {
    expect(() => retrieveScripture('Imaginary 1:1', 'WEB')).toThrow(Response);
    expect(() => retrieveScripture('James 1:5', 'UNCONFIGURED')).toThrow(Response);
  });

  it('rejects spiritual certainty and coercive covenant output', () => {
    expect(() => assertCovenantSafe('God told me this is your only path.')).toThrow('Covenant output failed safety validation');
    expect(() => assertCovenantSafe('Use wisdom while preserving agency.')).not.toThrow();
  });
});
