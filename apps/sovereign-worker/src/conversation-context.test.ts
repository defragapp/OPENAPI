import { describe, expect, it } from 'vitest';
import { parseConversationContext } from './conversation-context';

describe('conversation context input', () => {
  it('accepts typed person or system identifiers and rejects ambiguous or unsafe input', () => {
    expect(parseConversationContext({ surface: 'People', personId: 'person_1' })).toEqual({ surface: 'People', personId: 'person_1' });
    expect(parseConversationContext({ systemId: 'system-1' })).toEqual({ systemId: 'system-1' });
    expect(() => parseConversationContext({ personId: '../other' })).toThrow();
    expect(() => parseConversationContext({ personId: 'p1', systemId: 's1' })).toThrow();
  });
});
