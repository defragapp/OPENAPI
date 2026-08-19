import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');

describe('public demo v2 visual centers', () => {
  it('centers the key comprehension object for each capability', () => {
    expect(stories).toContain('the choice');
    expect(stories).toContain('making it acceptable');
    expect(stories).toContain('What happens between you');
    expect(stories).toContain('communication has to find another route');
  });
});