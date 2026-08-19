import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');

describe('public demo v2 answer hierarchy', () => {
  it('renders question, direct answer, visual, distinctions, continuation, and source detail in order', () => {
    const demo = stories.slice(stories.indexOf('function DemoSurface'));
    const markers = [
      'landing-demo-question',
      'landing-demo-copy',
      'landing-demo-visual',
      'landing-demo-insights',
      'landing-demo-continuation',
      '<FitCheck />',
      '<SourceDetails groups={sources} />'
    ];
    let cursor = -1;
    for (const marker of markers) {
      const index = demo.indexOf(marker);
      expect(index).toBeGreaterThan(cursor);
      cursor = index;
    }
  });
});