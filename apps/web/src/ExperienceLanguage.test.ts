import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const activeExperience = [
  ['public landing', read('./PublicLanding.tsx')],
  ['landing demonstrations', read('./LandingProductStories.tsx')],
  ['account access', read('./App.tsx')],
  ['workspace', read('./SovereignIntelligenceWorkspace.tsx')],
  ['onboarding', read('./PlanOnboarding.tsx')],
  ['how it works', read('../public/how-it-works.html')],
  ['pricing', read('../public/pricing.html')],
  ['faq', read('../public/faq.html')]
] as const;

const publicFirstExplanation = activeExperience.filter(([label]) => [
  'public landing',
  'landing demonstrations',
  'how it works',
  'pricing',
  'faq'
].includes(label));

const retired = [
  'Ask about your life.',
  'Ask about your life. Get an answer built around you.',
  'Get an answer built around you.',
  'What do you want to understand?',
  'Bring the question you already have.',
  'Bring the question you actually have.',
  'What would you like to explore?',
  'What can I help you understand?',
  'Ask anything.',
  "Tell me what's on my mind."
] as const;

const rejectedPublicCategoryPhrases = [
  'Understand both sides and what happens between you.',
  'One private reference beneath every question.',
  'One private foundation. More useful answers across the questions that shape your life.',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.',
  'Ordinary questions. More context when it belongs.'
] as const;

const rejectedPublicImplementationLanguage = [
  'Example Basis',
  'server-approved',
  'authorized references',
  'permitted context',
  'consented people',
  'permitted perspectives',
  'confirmed responsibilities'
] as const;

describe('Sovereign.OS active experience language', () => {
  it.each(activeExperience)('%s excludes retired generic-chatbot language', (_label, source) => {
    for (const phrase of retired) expect(source).not.toContain(phrase);
  });

  it.each(publicFirstExplanation)('%s translates internal concepts into concrete public language', (_label, source) => {
    for (const phrase of rejectedPublicImplementationLanguage) expect(source).not.toContain(phrase);
  });

  it('uses self exploration before expanding to People and Systems', () => {
    const landing = activeExperience.find(([label]) => label === 'public landing')?.[1] ?? '';
    const stories = activeExperience.find(([label]) => label === 'landing demonstrations')?.[1] ?? '';

    expect(landing).toContain('How do I make decisions that actually fit me?');
    expect(stories).toContain('01 · You');
    expect(stories).toContain('See how you think, decide, communicate, create, connect, and grow.');
    expect(stories).toContain('02 · You + your people');
    expect(stories).toContain('See why the same moment lands differently');
    expect(stories).toContain('03 · From 1:1 to the whole system');
    expect(stories).toContain('See the whole system.');

    for (const phrase of rejectedPublicCategoryPhrases) {
      expect(landing).not.toContain(phrase);
      expect(stories).not.toContain(phrase);
    }
  });

  it('keeps public workflows in approved adult language and hides exact source codes until inspection', () => {
    const stories = activeExperience.find(([label]) => label === 'landing demonstrations')?.[1] ?? '';
    for (const marker of [
      'Start with the question',
      'Draw from your Baseline',
      'Find the useful distinction',
      'Leave what is not known unanswered',
      'Give you something you can try',
      'Start with what happened',
      'Keep each person separate',
      'Show what happens between you',
      'Do not guess private feelings',
      'Find a lower-pressure next step',
      'Start with what you told Sovereign',
      'Show how pressure moves',
      'Show why the role keeps returning',
      'Change one thing and watch what happens',
      '<strong>See source details</strong>',
      '<details className="landing-evidence">'
    ]) expect(stories).toContain(marker);

    expect(stories).not.toContain('<strong>Example Basis</strong>');
    expect(stories).not.toContain('Exact values used by this representative fixture');
    expect(stories).not.toContain("chips: ['HD G13.1'");
    expect(stories).not.toContain("chips: ['You · HD G22.4'");
  });

  it('keeps secondary pages understandable before framework/source mechanics', () => {
    const how = activeExperience.find(([label]) => label === 'how it works')?.[1] ?? '';
    const faq = activeExperience.find(([label]) => label === 'faq')?.[1] ?? '';

    expect(how).toContain('Start with yourself. Add another person or the wider situation only when it helps.');
    expect(how).toContain('Ask about what you actually want to understand.');
    expect(how).toContain('<summary>See source details</summary>');
    expect(how).toContain('<dt>Sources</dt>');
    expect(how).not.toContain('EXAMPLE BASIS');
    expect(how).not.toContain('HD G13.1 · GK ACT13 · ☉ CAN 04.2°');

    expect(faq).toContain('Can I see what information Sovereign used for an answer?');
    expect(faq).toContain('Do those source details prove the interpretation is true?');
    expect(faq).not.toContain('What is Basis?');
    expect(faq).not.toContain('What does Basis prove?');
  });

  it('keeps authenticated Explore, People, Systems, and source-detail language aligned with the same product model', () => {
    const workspace = activeExperience.find(([label]) => label === 'workspace')?.[1] ?? '';
    expect(workspace).toContain("{ name: 'Explore', label: 'Explore', description: 'Explore yourself more deeply' }");
    expect(workspace).toContain("{ name: 'People', label: 'People', description: 'See how the same moment can land differently' }");
    expect(workspace).toContain("{ name: 'Systems', label: 'Systems', description: 'See the whole system' }");
    expect(workspace).toContain('title="See what happens between you."');
    expect(workspace).toContain('body="Keep each person distinct. See what each person brings');
    expect(workspace).toContain("Explore: ['What capacity or pattern do I want to understand?', 'What changes in me under pressure?']");
    expect(workspace).toContain("Systems: ['What role do I keep ending up in?', 'What changes when the usual roles shift?']");
    expect(workspace).toContain('<strong>Sources</strong>');
    expect(workspace).toContain('<h2 id="basis-title">Source details</h2>');
    expect(workspace).toContain('These are the source values Sovereign used for this answer.');
    expect(workspace).not.toContain('aria-label={`Basis. Open ${available.length} source values.`}');
    expect(workspace).not.toContain('<strong>Basis</strong>');
    expect(workspace).not.toContain('<h2 id="basis-title">Basis</h2>');
    expect(workspace).not.toContain('Understand both sides and what happens between you');
    expect(workspace).not.toContain('private foundation');
    expect(workspace).not.toContain('personal foundation');
    expect(workspace).not.toContain('same foundation');
  });

  it('keeps onboarding progress user-facing while internal readiness fields remain implementation-only', () => {
    const onboarding = activeExperience.find(([label]) => label === 'onboarding')?.[1] ?? '';
    for (const marker of ['Checking your details', 'Building your Baseline', 'Preparing your Baseline', 'Opening your workspace', 'Your Baseline is ready to use across the questions, relationships, and systems you choose to explore.']) {
      expect(onboarding).toContain(marker);
    }
    for (const phrase of ['Calculating source positions', 'Calculating your exact source positions', 'Preparing your Baseline profile', 'exact source and validated plain-language Baseline profile', 'Source and Baseline profile validated', 'Interpretive uncertainty', 'exact approved Basis values']) {
      expect(onboarding).not.toContain(phrase);
    }
  });
});