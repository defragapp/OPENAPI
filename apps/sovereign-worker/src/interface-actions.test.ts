import { describe, expect, it } from 'vitest';
import { buildInterfaceActions, parseInterfaceAction } from './interface-actions';

const free = { plan: 'free', features: ['baseline.today', 'baseline.explore'], asOf: '' };
const plus = { plan: 'sovereign_plus', features: ['people.compare', 'systems.family', 'covenant.lens'], asOf: '' };

describe('typed interface actions', () => {
  it('uses a closed allowlist and rejects invalid identifiers and action types', () => {
    expect(parseInterfaceAction({ type: 'delete_account', args: {} })).toBeNull();
    expect(parseInterfaceAction({ type: 'open_person', args: { personId: '../other' } })).toBeNull();
  });
  it('enforces feature access on the server and never emits a mutation', () => {
    expect(buildInterfaceActions('Show this relationship', { personId: 'person_1' }, free).primary).toEqual({ type: 'show_plan', args: { feature: 'people' } });
    expect(buildInterfaceActions('Show this relationship', { personId: 'person_1' }, plus).primary).toEqual({ type: 'open_person', args: { personId: 'person_1' } });
    expect(JSON.stringify(buildInterfaceActions('save share invite subscribe delete', {}, plus))).not.toMatch(/save|share|invite|subscribe|delete/);
  });
});
