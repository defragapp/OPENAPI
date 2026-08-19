import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');

describe('public demo v2 quiet source UI', () => {
  it('shows one collapsed source disclosure after continuation and calibration', () => {
    const demo = stories.slice(stories.indexOf('function DemoSurface'));
    expect(demo.indexOf('landing-demo-continuation')).toBeLessThan(demo.indexOf('<FitCheck />'));
    expect(demo.indexOf('<FitCheck />')).toBeLessThan(demo.indexOf('<SourceDetails groups={sources} />'));
    expect(stories).toContain('<details className="landing-evidence">');
  });
});