import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 permission boundaries', () => {
  it('keeps relationship sharing explicit', () => {
    expect(rendered).toContain('Both people choose what they share');
    expect(rendered).toContain('Alex’s shared Baseline');
    expect(rendered).toContain('Only they can say what they actually felt or intended');
  });

  it('keeps system participation and supplied roles explicit', () => {
    expect(rendered).toContain('Roles and events are supplied in the example');
    expect(rendered).toContain('Each person controls whether their Baseline can be included');
    expect(rendered).toContain('What you told Sovereign');
  });
});