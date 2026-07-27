import { describe, expect, it } from 'vitest';
import { groundedConcepts, groundedIntelligencePrompt, routeGroundedIntelligence } from './grounded-intelligence';

describe('private grounded-intelligence routing', () => {
  it('stores the complete approved concept contract with source references', () => {
    expect(groundedConcepts).toHaveLength(13);
    for (const concept of groundedConcepts) {
      expect(concept.internalDefinition.length).toBeGreaterThan(20);
      expect(concept.plainLanguage.length).toBeGreaterThan(10);
      expect(concept.usefulFor.length).toBeGreaterThan(0);
      expect(concept.cannotInfer.length).toBeGreaterThan(0);
      expect(concept.safeExamples.length).toBeGreaterThan(0);
      expect(concept.unsafeExamples.length).toBeGreaterThan(0);
      expect(concept.source.url).toMatch(/^https:\/\//);
    }
  });

  it('selects only the smallest relevant set', () => {
    const selected = routeGroundedIntelligence('I feel responsible for everyone and keep stepping in to fix everything.');
    expect(selected.map(({ id }) => id)).toEqual(['overfunctioning_underfunctioning', 'system_anxiety']);
    expect(selected).toHaveLength(2);
  });

  it('routes spiritual language to a grounded possibility without asserting a curse', () => {
    const prompt = groundedIntelligencePrompt('Is this a generational curse? How do I break this family chain?');
    expect(prompt).toContain('multigenerational_transmission');
    expect(prompt).toContain('cannotInfer');
    expect(prompt).not.toContain('bloodline carries this wound');
  });

  it('does not force a concept when no signal is relevant', () => {
    expect(routeGroundedIntelligence('What time is my appointment?')).toEqual([]);
    expect(groundedIntelligencePrompt('What time is my appointment?')).toContain('Do not force a psychological explanation');
  });
});
