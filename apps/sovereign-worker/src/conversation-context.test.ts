import { describe, expect, it } from 'vitest';
import { expressionAxisIds } from '@sovereign/agent-contracts';
import { parseConversationContext, projectExpressionFieldContext, projectModelSafeConversationContext, requireConversationContextEntitlement } from './conversation-context';

describe('conversation context input', () => {
  it('routes user-facing surfaces into internal Defrag or Alignment modes', () => {
    expect(parseConversationContext({ surface: 'People', personId: 'person_1' })).toEqual({ surface: 'People', mode: 'defrag', personId: 'person_1' });
    expect(parseConversationContext({ surface: 'Explore' })).toEqual({ surface: 'Explore', mode: 'alignment' });
    expect(parseConversationContext({ systemId: 'system-1' })).toEqual({ mode: 'defrag', systemId: 'system-1' });
    expect(parseConversationContext(undefined)).toEqual({ mode: 'defrag' });
  });

  it('rejects ambiguous identifiers, unsafe identifiers, and invented surfaces', () => {
    expect(() => parseConversationContext({ personId: '../other' })).toThrow();
    expect(() => parseConversationContext({ personId: 'p1', systemId: 's1' })).toThrow();
    expect(() => parseConversationContext({ surface: 'Workspace' })).toThrow();
    expect(() => parseConversationContext({ surface: 'Covenant' })).toThrow();
  });

  it('enforces paid relational context after a plan downgrade', () => {
    const free = { plan: 'free', features: ['baseline.today'], asOf: '2026-07-27' };
    expect(() => requireConversationContextEntitlement({ personId: 'person_1' }, free)).toThrow();
    expect(() => requireConversationContextEntitlement({ systemId: 'system_1' }, free)).toThrow();
    expect(() => requireConversationContextEntitlement(
      { personId: 'person_1' },
      { ...free, plan: 'sovereign_plus', features: ['people.compare'] }
    )).not.toThrow();
  });

  it('removes database identifiers and private names before model use', () => {
    const projected = projectModelSafeConversationContext({
      kind: 'pair',
      personId: 'person_private',
      system: { id: 'system_private', name: 'My family' },
      participants: [
        { personId: 'self', label: 'You', baseline: { baselineTendency: 'direct' } },
        { personId: 'person_private', label: 'Private Name', boundAccountId: 'acct_private', baseline: { baselineTendency: 'reflective' } }
      ],
      provenance: { consentCheckedAt: 'now', rawBirthInputShared: false }
    });
    const encoded = JSON.stringify(projected);
    expect(encoded).not.toMatch(/person_private|system_private|acct_private|Private Name|My family|consentCheckedAt/);
    expect(encoded).toContain('Other person');
    expect(encoded).toContain('baselineTendency');
  });

  it('preserves safe facet identity and distinct pseudonymous system references', () => {
    const projected = projectModelSafeConversationContext({
      participants: [
        {
          key: 'member_1',
          label: 'Private Name',
          facets: [{
            id: 'communication',
            title: 'Communication',
            description: 'A permitted interpretive facet.',
            basisRefs: ['member_1.natal.mercury']
          }]
        }
      ],
      relationshipGraph: [
        { from: 'you', to: 'member_1', type: 'responsibility' },
        { from: 'member_1', to: 'member_2', type: 'communication' }
      ]
    }) as Record<string, any>;

    expect(projected.participants[0].label).toBe('Participant 1');
    expect(projected.participants[0].facets[0].id).toBe('communication');
    expect(projected.relationshipGraph).toEqual([
      { from: 'You', to: 'Participant 1', type: 'responsibility' },
      { from: 'Participant 1', to: 'Participant 2', type: 'communication' }
    ]);
    expect(JSON.stringify(projected)).not.toContain('Private Name');
  });

  it('projects permitted expression values for the interface without Basis references or private names', () => {
    const expressionAxes = expressionAxisIds.map((id, index) => ({
      id,
      label: id,
      baselineValue: 40 + index,
      currentDelta: 0,
      value: 40 + index,
      state: 'unconfirmed',
      confidence: 'supported',
      facetIds: ['private.facet'],
      basisRefs: ['private.basis'],
      summary: 'Private interpretive detail'
    }));
    const selectedContext = projectModelSafeConversationContext({
      kind: 'relationship',
      participants: [
        { key: 'you', label: 'You', role: 'self', expressionAxes },
        { key: 'other', label: 'Private Name', role: 'partner', expressionAxes }
      ]
    });
    const projected = projectExpressionFieldContext({ selectedContext }) as Record<string, any>;
    expect(projected.kind).toBe('relationship');
    expect(projected.subjects).toHaveLength(2);
    expect(projected.subjects[1].label).toBe('Other person');
    expect(projected.subjects[0].axes).toHaveLength(expressionAxisIds.length);
    expect(projected.subjects[0].axes[0].basisRefs).toEqual([]);
    expect(projected.subjects[0].axes[0].facetIds).toEqual([]);
    expect(JSON.stringify(projected)).not.toMatch(/Private Name|private\.basis|private\.facet|Private interpretive detail/);
  });

  it('fails closed when an expression field is incomplete or contains a non-finite value', () => {
    const incompleteAxes = expressionAxisIds.slice(0, -1).map((id) => ({
      id,
      label: id,
      baselineValue: 50,
      currentDelta: 0,
      value: id === 'clarity' ? Number.NaN : 50,
      state: 'unconfirmed',
      confidence: 'supported',
      facetIds: [],
      basisRefs: [],
      summary: ''
    }));
    expect(projectExpressionFieldContext({
      selectedContext: {
        kind: 'relationship',
        participants: [
          { key: 'you', label: 'You', expressionAxes: incompleteAxes },
          { key: 'other', label: 'Other person', expressionAxes: incompleteAxes }
        ]
      }
    })).toBeNull();
  });
});
