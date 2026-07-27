import { describe, expect, it } from 'vitest';
import { parseConversationContext, projectModelSafeConversationContext, requireConversationContextEntitlement } from './conversation-context';

describe('conversation context input', () => {
  it('accepts typed person or system identifiers and rejects ambiguous or unsafe input', () => {
    expect(parseConversationContext({ surface: 'People', personId: 'person_1' })).toEqual({ surface: 'People', personId: 'person_1' });
    expect(parseConversationContext({ systemId: 'system-1' })).toEqual({ systemId: 'system-1' });
    expect(() => parseConversationContext({ personId: '../other' })).toThrow();
    expect(() => parseConversationContext({ personId: 'p1', systemId: 's1' })).toThrow();
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
});
