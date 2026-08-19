import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 rendered boundary', () => {
  it('keeps historical workflow fingerprints outside the rendered component tree', () => {
    expect(stories.indexOf('RELEASE_LINEAGE_MARKERS')).toBeLessThan(stories.indexOf('export function LandingProductStories()'));
    expect(rendered).not.toContain('<WorkflowPanel');
    expect(rendered).not.toContain('landing-workflow__progress');
    expect(rendered).not.toContain('data-motion-state');
  });
});