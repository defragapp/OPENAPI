import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), 'utf8');

const activeExperience = [
  ['public landing', read('./PublicLanding.tsx')],
  ['landing demonstrations', read('./LandingProductStories.tsx')],
  ['account access', read('./App.tsx')],
  ['workspace', read('./SovereignIntelligenceWorkspace.tsx')],
  ['how it works', read('../public/how-it-works.html')],
  ['pricing', read('../public/pricing.html')],
  ['faq', read('../public/faq.html')]
] as const;

const publicFirstExplanation = activeExperience.filter(([label]) => [
  'public landing',
  'landing demonstrations',
  'how it works',
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
  "Tell me what's on your mind."
] as const;

const rejectedPublicCategoryPhrases = [
  'Understand both sides and what happens between you.',
  'One private reference beneath every question.',
  'One private foundation. More useful answers across the questions that shape your life.',
  'Separate helping from carrying the outcome.',
  'See where responsibility keeps landing.'
] as const;

describe('Sovereign.OS active experience language', () => {
  it.each(activeExperience)('%s excludes retired generic-chatbot language', (_label, source) => {
    for (const phrase of retired) expect(source).not.toContain(phrase);
  });

  it.each(publicFirstExplanation)('%s translates internal capacity language into concrete public language', (_label, source) => {
    expect(source.toLowerCase()).not.toContain('capacity beneath');
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

  it('keeps authenticated Explore, People, Systems, and Baseline language aligned with the same product model', () => {
    const workspace = activeExperience.find(([label]) => label === 'workspace')?.[1] ?? '';
    expect(workspace).toContain("{ name: 'Explore', label: 'Explore', description: 'Explore yourself more deeply' }");
    expect(workspace).toContain("{ name: 'People', label: 'People', description: 'See how the same moment can land differently' }");
    expect(workspace).toContain("{ name: 'Systems', label: 'Systems', description: 'See the whole system' }");
    expect(workspace).toContain('title="See how the same moment can land differently."');
    expect(workspace).toContain('body="Keep each person distinct, then examine the interaction and what may help close the gap."');
    expect(workspace).toContain("Explore: ['What part of myself do I want to understand more clearly?', 'What changes in me under pressure?']");
    expect(workspace).toContain("Systems: ['What role am I playing in this system?', 'What changes when the usual roles shift?']");
    expect(workspace).not.toContain('Understand both sides and what happens between you');
    expect(workspace).not.toContain('private foundation');
    expect(workspace).not.toContain('personal foundation');
    expect(workspace).not.toContain('same foundation');
    expect(workspace).not.toContain("Explore: ['Describe the pattern you want to look at.', 'Where does this change under pressure?']");
    expect(workspace).not.toContain("Systems: ['Where does responsibility keep landing?']");
  });
});