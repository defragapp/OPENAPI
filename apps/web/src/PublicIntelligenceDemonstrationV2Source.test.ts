import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 source treatment', () => {
  it('keeps exact representative values inside the collapsed source component rather than answer copy', () => {
    const sourceComponentIndex = rendered.indexOf('function SourceDetails');
    expect(sourceComponentIndex).toBeGreaterThan(0);
    expect(rendered).toContain('<details className="landing-evidence">');
    expect(rendered).toContain('<strong>See source details</strong>');
    expect(rendered).toContain('Representative example');
    expect(rendered).toContain('These values are not visitor data.');
  });

  it('does not expose internal transport vocabulary in visible labels', () => {
    expect(rendered).not.toContain('<strong>Basis</strong>');
    expect(rendered).not.toContain('provider');
    expect(rendered).not.toContain('confidence class');
    expect(rendered).not.toContain('authorization');
  });
});