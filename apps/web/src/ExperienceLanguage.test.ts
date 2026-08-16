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

describe('Sovereign.OS active experience language', () => {
  it.each(activeExperience)('%s excludes retired generic-chatbot language', (_label, source) => {
    for (const phrase of retired) expect(source).not.toContain(phrase);
  });

  it('uses situational recognition instead of a blank-chat invitation', () => {
    const landing = activeExperience.find(([label]) => label === 'public landing')?.[1] ?? '';
    const workspace = activeExperience.find(([label]) => label === 'workspace')?.[1] ?? '';
    expect(landing).toContain('Start with what’s actually happening.');
    expect(workspace).toContain('Look closer at the pattern.');
    expect(workspace).toContain('What keeps happening between you?');
    expect(workspace).toContain('Where does responsibility keep landing?');
  });
});
