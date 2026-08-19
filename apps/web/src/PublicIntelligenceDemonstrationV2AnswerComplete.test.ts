import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');

describe('public demo v2 answer completeness', () => {
  it('contains direct answer and useful distinction before the source component definition', () => {
    const sourceIndex = stories.indexOf('function SourceDetails');
    for (const marker of [
      'The real tradeoff',
      'The conversation may be caught in timing before it is caught in disagreement.',
      'Change one position and everyone else has to respond to a different structure.'
    ]) expect(stories.indexOf(marker)).toBeGreaterThan(0);
    expect(stories.indexOf('The real tradeoff')).toBeLessThan(sourceIndex);
  });
});