import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');

describe('public demo v2 correction', () => {
  it('offers calibration rather than reaction buttons', () => {
    expect(stories).toContain('Does this fit?');
    expect(stories).toContain("['yes', 'Yes']");
    expect(stories).toContain("['partly', 'Partly']");
    expect(stories).toContain("['no', 'Not really']");
    expect(stories).toContain('aria-pressed={choice === value}');
  });
});