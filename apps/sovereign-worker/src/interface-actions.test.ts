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
    expect(buildInterfaceActions('Show this relationship', { personId: 'person_1' }, free).primary).toEqual({
      type: 'show_plan',
      label: 'Compare permitted Baselines with Sovereign+',
      feature: 'people'
    });
    expect(buildInterfaceActions('Show this relationship', { personId: 'person_1' }, plus).primary).toEqual({
      type: 'open_person',
      label: 'Open this relationship',
      target_id: 'person_1'
    });
    expect(JSON.stringify(buildInterfaceActions('share subscribe delete', {}, plus))).not.toMatch(/share|subscribe|delete_account|remove_account/);
  });
  it('offers Covenant for a relevant family dynamic without religious keywords and hides it for unrelated questions', () => {
    const relevant = buildInterfaceActions('Why am I carrying this family role?', {}, plus);
    expect(relevant.contextual).toContainEqual({ type: 'offer_covenant', label: 'Explore through Covenant' });
    const irrelevant = buildInterfaceActions('What responsibility belongs to me in this decision?', {}, plus);
    expect([irrelevant.primary, ...irrelevant.contextual]).not.toContainEqual(expect.objectContaining({ type: 'offer_covenant' }));
  });
});
