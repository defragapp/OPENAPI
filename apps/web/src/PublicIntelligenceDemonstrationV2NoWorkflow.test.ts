import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 visible workflow removal', () => {
  it('keeps historical compatibility fingerprints outside the rendered component source', () => {
    expect(stories.indexOf('RELEASE_LINEAGE_MARKERS')).toBeLessThan(stories.indexOf('export function LandingProductStories()'));
    expect(rendered).not.toContain('<WorkflowPanel');
    expect(rendered).not.toContain('landing-workflow__progress');
    expect(rendered).not.toContain('landing-demo__composer-shell');
    expect(rendered).not.toContain('data-motion-state');
    expect(rendered).not.toContain('How Sovereign builds the answer');
    expect(rendered).not.toContain('How Sovereign compares two people');
    expect(rendered).not.toContain('How Sovereign reads a system');
  });
});