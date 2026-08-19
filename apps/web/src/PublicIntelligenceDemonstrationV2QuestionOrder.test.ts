import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 question order', () => {
  it('progresses from self to relationship to system', () => {
    const questions = [
      'How do I make decisions that actually fit me?',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'What changes when I stop playing the role everyone expects?'
    ];
    let cursor = -1;
    for (const question of questions) {
      const index = rendered.indexOf(question);
      expect(index).toBeGreaterThan(cursor);
      cursor = index;
    }
  });
});