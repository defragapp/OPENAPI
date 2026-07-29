import { describe, expect, it } from 'vitest';
import { parseConversationContext, projectModelSafeConversationContext, requireConversationContextEntitlement } from './conversation-context';

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
});
