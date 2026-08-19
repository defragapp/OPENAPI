import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');

describe('public demo v2 integrated structure', () => {
  it('uses one dominant interaction surface per capability', () => {
    expect((stories.match(/<DemoSurface/g) ?? []).length).toBe(3);
    expect(stories).toContain('className={`landing-demo landing-intelligence-demo landing-intelligence-demo--${kind}`}');
    expect(stories).toContain('className="landing-demo-question"');
    expect(stories).toContain('className="landing-demo-core"');
    expect(stories).toContain('className="landing-demo-insights"');
    expect(stories).toContain('className="landing-demo-close"');
  });
});