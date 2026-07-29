import { describe, expect, it } from 'vitest';
import type { BasisRegistryItem } from '../baseline-contracts';
import {
  attachBasisValues,
  composeSovereignAnswerText,
  deriveAuthorizedBasisRegistry,
  parseSovereignAnswer
} from './recognition';

const registry: BasisRegistryItem[] = [{
  id: 'natal.sun',
  category: 'natal',
  display: '☉ CAN 04.2°',
  accessibleLabel: 'Sun in Cancer at 4.2 degrees',
  computedAt: '2026-07-28T12:00:00.000Z',
  uncertainty: 'low',
  provenance: 'NASA/JPL Horizons',
  subject: 'self'
}];

function answer(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    version: 'sovereign-answer.v2',
    mode: 'baseline',
    depth: 'standard',
    headline: 'Direction becomes responsibility quickly.',
    direct_answer: 'You may be quick to create direction when a situation has no clear owner, which can be useful until the consequences become yours without matching authority.',
    sections: [
      { id: 'shadow', label: 'Shadow', body: 'You may end uncertainty by taking over a decision before responsibility is shared.' },
      { id: 'gift', label: 'Gift', body: 'You can turn ambiguity into structure without becoming responsible for everyone inside it.' }
    ],
    basis_refs: ['natal.sun'],
    correction_prompt: 'Does this fit your experience?',
    actions: [{ type: 'explore_facet', label: 'Explore this quality' }],
    confidence: 'supported',
    safety_mode: 'standard',
    ...overrides
  });
}

describe('sovereign-answer.v2', () => {
  it('validates a useful answer and attaches exact server-owned Basis values', () => {
    const parsed = parseSovereignAnswer(answer(), registry);
    expect(parsed.version).toBe('sovereign-answer.v2');
    expect(parsed.sections).toHaveLength(2);
    expect(attachBasisValues(parsed, registry)).toEqual(registry);
    expect(composeSovereignAnswerText(parsed)).toContain('Direction becomes responsibility quickly.');
    expect(composeSovereignAnswerText(parsed)).not.toContain('☉ CAN 04.2°');
  });

  it('rejects an invented Basis reference', () => {
    expect(() => parseSovereignAnswer(answer({ basis_refs: ['natal.invented'] }), registry))
      .toThrow(/invented or unauthorized Basis reference/);
  });

  it('requires structured alignment distinctions rather than a score', () => {
    const sections = [
      { id: 'alignment', label: 'Supports the fit', body: 'The role uses a capacity already available to you.' },
      { id: 'responsibility', label: 'Pulls against it', body: 'The responsibility is clear while authority remains limited.' },
      { id: 'alignment', label: 'The real tradeoff', body: 'You would accept security in exchange for less control over the terms.' },
      { id: 'unknowns', label: 'Still needed', body: 'The decision changes if authority can be negotiated directly.' },
      { id: 'experiment', label: 'A closer version', body: 'Ask for decision authority that matches the outcome you would carry.' }
    ];
    const parsed = parseSovereignAnswer(answer({ mode: 'alignment', depth: 'deep', sections }), registry);
    expect(parsed.sections.map((section) => section.label)).toContain('The real tradeoff');
    expect(JSON.stringify(parsed)).not.toMatch(/score|percentage|gauge/i);
  });

  it('requires both people, the interaction, and unknowns in relationship mode', () => {
    const sections = [
      { id: 'you', label: 'You may be bringing', body: 'You may seek clarity by naming the question and starting movement.' },
      { id: 'other', label: 'They may be bringing', body: 'They may need time before their language becomes reliable.' },
      { id: 'interaction', label: 'What happens between you', body: 'Urgency can shorten the time needed for a considered answer.' },
      { id: 'responsibility', label: 'What each person can own', body: 'You can name the question without demanding an answer, and they can request time without leaving the pause undefined.' },
      { id: 'unknowns', label: 'What still needs to be asked directly', body: 'Their motive, feeling, and future action remain unknown.' }
    ];
    expect(parseSovereignAnswer(answer({ mode: 'relationship', depth: 'deep', sections }), registry).mode)
      .toBe('relationship');
  });

  it('collects only explicit validated Basis registry entries', () => {
    const context = {
      baseline: {
        status: 'completed',
        withheld: 'Type unavailable',
        basisRegistry: registry
      }
    };
    expect(deriveAuthorizedBasisRegistry(context)).toEqual(registry);
    expect(deriveAuthorizedBasisRegistry({ basisRegistry: [{ ...registry[0], display: 'status withheld' }] })).toEqual([]);
  });
});
