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
    expect(source.toLowerCase()).not.toContain('capacity beneath');
    for (const phrase of rejectedPublicImplementationLanguage) expect(source).not.toContain(phrase);
  });

  it('uses self exploration before expanding to People and Systems', () => {
    const landing = activeExperience.find(([label]) => label === 'public landing')?.[1] ?? '';
    const stories = activeExperience.find(([label]) => label === 'landing demonstrations')?.[1] ?? '';

    expect(landing).toContain('You → your people → the whole system');
    expect(landing).toContain('Start with yourself. Expand outward when it matters.');
    expect(landing).toContain('How do I make decisions that actually fit me?');
    expect(stories).toContain('01 · You');
    expect(stories).toContain('Explore how you think, decide, communicate, create, connect, and grow.');
    expect(stories).toContain('02 · You + your people');
    expect(stories).toContain('See why the same moment lands differently—and how to bridge the gap.');
    expect(stories).toContain('03 · From 1:1 to the whole system');
    expect(stories).toContain('See the whole system.');

    for (const phrase of rejectedPublicCategoryPhrases) {
      expect(landing).not.toContain(phrase);
      expect(stories).not.toContain(phrase);
    }
  });

  it('makes the demonstrations sound like edited Sovereign answers instead of workflow narration', () => {
    const stories = activeExperience.find(([label]) => label === 'landing demonstrations')?.[1] ?? '';
    for (const marker of [
      'The right decision may not be the easiest one to explain.',
      'Your Baseline suggests that clarity may come less from reaching certainty quickly',
      'The real tradeoff',
      'A closer version',
      'You may both be trying to reach clarity in opposite ways.',
      'The conversation may be caught in timing before it is caught in disagreement.',
      'Reassurance now. Resolution at a defined time.',
      'When one person changes roles, the system has to find another route.',
      'The role can keep returning because it works for the system',
      'Change one position and everyone else has to respond to a different structure.',
      '<strong>See source details</strong>',
      '<details className="landing-evidence">'
    ]) expect(stories).toContain(marker);

    expect(stories).not.toContain('function WorkflowPanel(');
    expect(stories).not.toContain('useWorkflowProgress');
    expect(stories).not.toContain('<strong>Example Basis</strong>');
  });

  it('keeps People language consent-aware, compatibility-free, and avoids private-state claims', () => {
    const stories = activeExperience.find(([label]) => label === 'landing demonstrations')?.[1] ?? '';
    for (const marker of [
      'Both people choose what they share',
      'Only they can say what they actually felt or intended',
      'Alex’s shared Baseline',
      'keeping both people distinct'
    ]) expect(stories).toContain(marker);
    for (const prohibited of ['They secretly', 'They definitely feel', 'compatibility', 'compatibilityScore', 'compatibilityPercent']) expect(stories.toLowerCase()).not.toContain(prohibited.toLowerCase());
  });

  it('keeps Systems language grounded in supplied roles, observed interaction, and chosen information', () => {
    const stories = activeExperience.find(([label]) => label === 'landing demonstrations')?.[1] ?? '';
    for (const marker of [
      'Roles and events are supplied in the example',
      'What you told Sovereign',
      'A parent pushes for immediate resolution.',
      'A sibling pulls away when tension rises.',
      'You often step in to translate or mediate',
      'information each participant chose to share',
      'You remain in the system; the communication path is what changes.'
    ]) expect(stories).toContain(marker);
    expect(stories.toLowerCase()).not.toContain('missing perspective');
    expect(stories.toLowerCase()).not.toContain('consented participant context');
  });

  it('keeps secondary pages understandable before framework/source mechanics', () => {
    const how = activeExperience.find(([label]) => label === 'how it works')?.[1] ?? '';
    const faq = activeExperience.find(([label]) => label === 'faq')?.[1] ?? '';

    expect(how).toContain('Start with yourself. Add another person or the wider situation only when it helps.');
    expect(how).toContain('Ask about what you actually want to understand.');
    expect(how).toContain('<summary>See source details</summary>');
    expect(how).toContain('<dt>Sources</dt>');
    expect(how).not.toContain('EXAMPLE BASIS');

    expect(faq).toContain('Can I see what information Sovereign used for an answer?');
    expect(faq).toContain('Do those source details prove the interpretation is true?');
    expect(faq).not.toContain('What is Basis?');
    expect(faq).not.toContain('What does Basis prove?');
    expect(faq.toLowerCase()).not.toContain('compatibility');
  });

  it('keeps authenticated Explore, People, Systems, and source-detail language aligned with the same product model', () => {
    const workspace = activeExperience.find(([label]) => label === 'workspace')?.[1] ?? '';
    expect(workspace).toContain("{ name: 'Explore', label: 'Explore', description: 'Explore yourself more deeply' }");
    expect(workspace).toContain("{ name: 'People', label: 'People', description: 'See how the same moment can land differently' }");
    expect(workspace).toContain("{ name: 'Systems', label: 'Systems', description: 'See the whole system' }");
    expect(workspace).toContain('title="See how the same moment can land differently."');
    expect(workspace).toContain('body="Keep each person distinct, then examine the interaction and what may help close the gap."');
    expect(workspace).toContain('<strong>Sources</strong>');
    expect(workspace).toContain('<h2 id="basis-title">Source details</h2>');
    expect(workspace).not.toContain('<strong>Basis</strong>');
    expect(workspace).not.toContain('Understand both sides and what happens between you');
  });

  it('keeps onboarding progress user-facing while internal readiness fields remain implementation-only', () => {
    const onboarding = activeExperience.find(([label]) => label === 'onboarding')?.[1] ?? '';
    for (const marker of ['Checking your details', 'Building your Baseline', 'Preparing your Baseline', 'Opening Sovereign.OS', 'Your Baseline is ready to use across the questions, relationships, and systems you choose to explore.']) expect(onboarding).toContain(marker);
    for (const phrase of ['Calculating source positions', 'Calculating your exact source positions', 'Preparing your Baseline profile', 'exact source and validated plain-language Baseline profile', 'Source and Baseline profile validated', 'Interpretive uncertainty', 'exact approved Basis values']) expect(onboarding).not.toContain(phrase);
  });
});