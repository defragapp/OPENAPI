import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./public-intelligence-demonstration-v2.css', import.meta.url), 'utf8');

describe('public demo v2 motion', () => {
  it('reveals a section once when it enters the viewport', () => {
    expect(stories).toContain('const observer = new IntersectionObserver');
    expect(stories).toContain("section.dataset.visible = 'true';");
    expect(stories).toContain('observer.disconnect();');
  });

  it('contains no perpetual demo animations', () => {
    expect(styles).not.toContain('infinite');
    expect(styles).toContain('@keyframes public-demo-arrive-v2');
    expect(styles).toContain('@keyframes public-demo-line-v2');
    expect(styles).toContain('@keyframes public-demo-resolve-v2');
  });
});