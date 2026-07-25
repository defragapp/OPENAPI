import { describe, expect, it } from 'vitest';
import { composeRecognitionResponse, deriveAvailableBasis, parseRecognitionPlan, renderBasisFooter } from './recognition';

const emptyBasis = { human_design: [], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] };
const hiddenVisualStory = {
  should_show: false,
  mode: 'self' as const,
  primary: { archetype: 'fool' as const, title: '', phase: 'shadow' as const },
  secondary: null,
  tertiary: null,
  origin: '',
  shadow: '',
  gift: '',
  current: '',
  next_step: '',
  visual_reason: ''
};

describe('inner recognition structured output', () => {
  it('derives exact verified values and renders the compact footer', () => {
    const available = deriveAvailableBasis({
      baseline: {
        reducedContext: {
          deterministicCalculation: {
            humanDesign: { profile: '5/1', channels: ['13–33'] },
            geneKeys: { lifeWork: '16.1', evolution: '9.1' },
            natalPlacements: { sun: 'Leo', moon: 'Scorpio' },
            numerology: { lifePath: 7 }
          }
        }
      }
    });
    expect(available.human_design).toEqual(expect.arrayContaining(['5/1', '13–33']));
    expect(available.gene_keys).toEqual(expect.arrayContaining(['16.1', '9.1']));
    expect(available.astrology).toEqual(expect.arrayContaining(['☉ Leo', '☾ Scorpio']));
    expect(renderBasisFooter({ user_confirmed: true, human_design: ['5/1', '13–33'], gene_keys: ['16.1'], astrology: ['☾ Scorpio'], relationship: [], live: [], numerology: [] }))
      .toBe('BASIS · U✓ | HD 5/1 · 13–33 | GK 16.1 | A ☾ Scorpio');
  });

  it('rejects an invented footer value', () => {
    const raw = JSON.stringify({
      response_phase: 'question', recognition: 'Something changed.', inward_question: 'What feels at risk?',
      candidate_hidden_expectation: '', protected_need: '', clearer_form: '', practical_action: '',
      module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
      basis: { user_confirmed: false, human_design: ['7/2'], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] },
      confidence: 'exploratory', safety_mode: 'standard'
    });
    expect(() => parseRecognitionPlan(raw, { ...emptyBasis, human_design: ['5/1'] }))
      .toThrow(/unverified human_design/);
  });

  it('keeps question phase short, unconfirmed, and without action or module content', () => {
    const plan = parseRecognitionPlan(JSON.stringify({
      response_phase: 'question', recognition: 'You may be trying to make the outcome certain.', inward_question: 'What are you trying to prevent',
      candidate_hidden_expectation: 'Should be removed', protected_need: 'connection', clearer_form: 'Should be removed', practical_action: 'Should be removed',
      module_suggestion: { should_offer: true, title: 'Should not show', reason: 'too early', format: 'reflection' },
      basis: { user_confirmed: true, human_design: [], gene_keys: [], astrology: [], relationship: [], live: [], numerology: [] },
      confidence: 'exploratory', safety_mode: 'standard'
    }), emptyBasis);
    const response = composeRecognitionResponse(plan);
    expect(response).toContain('WHAT I NOTICE');
    expect(response).toContain('LOOK INWARD');
    expect(response).not.toContain('WHAT TO DO');
    expect(response).not.toContain('Should not show');
    expect(response.match(/\?/g)).toHaveLength(1);
    expect(plan.basis.user_confirmed).toBe(false);
  });

  it('rejects empty inward questions and incomplete integration plans', () => {
    const question = JSON.stringify({
      response_phase: 'question', recognition: 'Something changed.', inward_question: '??',
      candidate_hidden_expectation: '', protected_need: '', clearer_form: '', practical_action: '',
      module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
      basis: { user_confirmed: false, ...emptyBasis }, confidence: 'exploratory', safety_mode: 'standard'
    });
    expect(() => parseRecognitionPlan(question, emptyBasis)).toThrow(/empty inward question/);

    const integration = JSON.stringify({
      response_phase: 'integration', recognition: 'The answer matters.', inward_question: 'What fits now?',
      candidate_hidden_expectation: 'You may expect waiting to mean you do not matter.', protected_need: 'connection', clearer_form: '', practical_action: '',
      module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
      basis: { user_confirmed: true, ...emptyBasis }, confidence: 'confirmed', safety_mode: 'standard'
    });
    expect(() => parseRecognitionPlan(integration, emptyBasis)).toThrow(/missing clearer_form/);
  });

  it('requires a complete module offer and removes offers during grounding', () => {
    const missingReason = JSON.stringify({
      response_phase: 'integration', recognition: 'The answer matters.', inward_question: 'What fits now?',
      candidate_hidden_expectation: 'You may expect waiting to mean you do not matter.', protected_need: 'connection',
      clearer_form: 'Ask for information without making it prove your worth.', practical_action: 'Wait until the agreed response time.',
      module_suggestion: { should_offer: true, title: 'When waiting feels personal', reason: '', format: 'reflection' },
      basis: { user_confirmed: true, ...emptyBasis }, confidence: 'confirmed', safety_mode: 'standard'
    });
    expect(() => parseRecognitionPlan(missingReason, emptyBasis)).toThrow(/requires a title and reason/);

    const grounded = parseRecognitionPlan(JSON.stringify({
      response_phase: 'integration', recognition: 'You sound frightened.', inward_question: 'Who can help right now?',
      candidate_hidden_expectation: 'The fear is making it hard to know what is directly observable.', protected_need: 'safety',
      clearer_form: 'Focus on immediate safety and one trusted person.', practical_action: 'Contact someone you trust and seek appropriate support.',
      module_suggestion: { should_offer: true, title: 'Later reflection', reason: 'save it', format: 'reflection' },
      basis: { user_confirmed: true, ...emptyBasis }, confidence: 'confirmed', safety_mode: 'grounded'
    }), emptyBasis);
    expect(grounded.module_suggestion.should_offer).toBe(false);
  });

  it('removes symbolic footer detail in grounded safety mode', () => {
    const response = composeRecognitionResponse({
      response_phase: 'integration', recognition: 'You sound frightened.', inward_question: 'Who can help you feel safe right now?',
      candidate_hidden_expectation: 'The fear is making it hard to know what is directly observable.', protected_need: 'safety',
      clearer_form: 'Focus on immediate safety and one trusted person.', practical_action: 'Contact someone you trust and stay with them while you seek appropriate support.',
      module_suggestion: { should_offer: false, title: '', reason: '', format: 'reflection' },
      visual_story: hiddenVisualStory,
      basis: { user_confirmed: true, human_design: ['5/1'], gene_keys: ['16.1'], astrology: ['☾ Scorpio'], relationship: [], live: ['♃ Leo'], numerology: [] },
      confidence: 'confirmed', safety_mode: 'grounded'
    });
    expect(response).toContain('BASIS · U✓');
    expect(response).not.toContain('HD 5/1');
    expect(response).not.toContain('LIVE');
  });
});