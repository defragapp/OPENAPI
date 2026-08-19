import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 score boundary', () => {
  it('uses descriptive distinctions without numeric or compatibility scoring', () => {
    for (const prohibited of ['83%', '82%', 'compatibilityScore', 'compatibilityPercent', 'alignmentScore', 'Alignment meter']) {
      expect(rendered).not.toContain(prohibited);
    }
    expect(rendered).toContain('No compatibility score');
    expect(rendered).toContain('The real tradeoff');
    expect(rendered).toContain('The useful distinction');
  });
});