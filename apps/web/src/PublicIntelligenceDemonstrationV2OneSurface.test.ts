import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');

describe('public demo v2 one-surface composition', () => {
  it('uses the same DemoSurface component for all three capabilities', () => {
    expect((stories.match(/<DemoSurface/g) ?? []).length).toBe(3);
    expect(stories).toContain("kind: 'self' | 'relationship' | 'system'");
  });
});