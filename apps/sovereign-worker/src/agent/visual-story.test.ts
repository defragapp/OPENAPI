import { describe, expect, it } from 'vitest';
import { parseRecognitionPlan, recognitionJsonContract } from './recognition';

const emptyBasis = { human_design: [], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] };

function plan(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    response_phase: 'integration',
    recognition: 'The role may be trying to protect connection.',
    inward_question: 'Does that fit?',
    candidate_hidden_expectation: 'You may expect understanding to prove the connection is safe.',
    protected_need: 'connection',
    clearer_form: 'Make one clear request without making the answer decide your value.',
    practical_action: 'Send one direct request and stop before repeating it.',
    module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
    visual_story: {
      should_show: true,
      mode: 'self',
      primary: { archetype: 'three_of_cups', title: 'Preserving belonging', phase: 'shadow' },
      secondary: null,
      tertiary: null,
      origin: 'This role may have learned that keeping the group calm protected connection.',
      shadow: 'It may make personal needs smaller so the connection feels safe.',
      gift: 'It can create belonging without requiring anyone to disappear inside the group.',
      current: 'The need to remain included may be louder in this moment.',
      next_step: 'Name one need without withdrawing your warmth.',
      visual_reason: 'Three figures help show how belonging can become either shared support or self-erasure.'
    },
    basis: { user_confirmed: true, ...emptyBasis },
    confidence: 'confirmed',
    safety_mode: 'standard',
    ...overrides
  });
}

describe('inline visual story contract', () => {
  it('keeps a complete self visual only after confirmed integration', () => {
    const parsed = parseRecognitionPlan(plan(), emptyBasis);
    expect(parsed.visual_story.should_show).toBe(true);
    expect(parsed.visual_story.primary.archetype).toBe('three_of_cups');
    expect(parsed.visual_story.primary.phase).toBe('shadow');
  });

  it('suppresses visual stories in question phase', () => {
    const parsed = parseRecognitionPlan(plan({
      response_phase: 'question',
      candidate_hidden_expectation: '',
      protected_need: '',
      clearer_form: '',
      practical_action: '',
      basis: { user_confirmed: true, ...emptyBasis }
    }), emptyBasis);
    expect(parsed.visual_story.should_show).toBe(false);
    expect(parsed.basis.user_confirmed).toBe(false);
  });

  it('suppresses a visual when the user has not confirmed the recognition', () => {
    const parsed = parseRecognitionPlan(plan({ basis: { user_confirmed: false, ...emptyBasis } }), emptyBasis);
    expect(parsed.visual_story.should_show).toBe(false);
  });

  it('suppresses interaction and family visuals without verified relationship evidence', () => {
    const interaction = parseRecognitionPlan(plan({
      visual_story: {
        should_show: true,
        mode: 'interaction',
        primary: { archetype: 'magician', title: 'Shaping the outcome', phase: 'shadow' },
        secondary: { archetype: 'hermit', title: 'Protecting space', phase: 'shadow' },
        tertiary: null,
        origin: 'A past protection.',
        shadow: 'A repeating interaction.',
        gift: 'A clearer interaction.',
        current: 'The loop is active.',
        next_step: 'Change one observable move.',
        visual_reason: 'Two figures make the interaction easier to see.'
      }
    }), emptyBasis);
    expect(interaction.visual_story.should_show).toBe(false);

    const family = parseRecognitionPlan(plan({
      visual_story: {
        should_show: true,
        mode: 'family',
        primary: { archetype: 'three_of_cups', title: 'Role taken', phase: 'shadow' },
        secondary: { archetype: 'tower', title: 'Role expected', phase: 'origin' },
        tertiary: { archetype: 'fool', title: 'Role emerging', phase: 'gift' },
        origin: 'A past family protection.',
        shadow: 'A repeated system role.',
        gift: 'A new role becomes available.',
        current: 'The old expectation is visible.',
        next_step: 'Name one responsibility that is not yours.',
        visual_reason: 'Three cards show the role taken, expected, and emerging.'
      }
    }), emptyBasis);
    expect(family.visual_story.should_show).toBe(false);
  });

  it('suppresses all visual symbolism during grounded safety handling', () => {
    const parsed = parseRecognitionPlan(plan({ safety_mode: 'grounded' }), emptyBasis);
    expect(parsed.visual_story.should_show).toBe(false);
  });

  it('documents interpretation-first visual fields in the model contract', () => {
    const contract = recognitionJsonContract(emptyBasis);
    expect(contract).toContain('visual_story');
    expect(contract).toContain('fool | magician | three_of_cups | hermit | strength | tower');
    expect(contract).toContain('origin | shadow | gift');
    expect(contract).toContain('self | interaction | family');
  });
});