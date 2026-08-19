import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 language boundary', () => {
  it('uses plain product language and excludes prohibited framing from rendered demonstrations', () => {
    for (const prohibited of [
      'possible interaction vector',
      'emotional vector',
      'emotional field model',
      'reading',
      'chart says',
      'universe is telling you',
      'calculated solution',
      'compatibility score',
      'alignment score',
      'missing perspective',
      'choose yourself',
      'return to yourself',
      'healing journey',
      'unlock your potential',
      'break the cycle',
      'one clean next move'
    ]) expect(rendered.toLowerCase()).not.toContain(prohibited.toLowerCase());
  });

  it('keeps canonical helpful terms available where they improve understanding', () => {
    for (const marker of ['Baseline', 'People', 'system', 'See source details']) expect(rendered).toContain(marker);
  });
});