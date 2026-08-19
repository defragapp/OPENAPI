import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public demo v2 direct answer value', () => {
  it('contains specific answer copy before source mechanics', () => {
    for (const marker of [
      'Your Baseline suggests that clarity may come less from reaching certainty quickly',
      'Your Baseline suggests that uncertainty may stay active for you until the situation has a defined next step',
      'In the situation you described, mediation has become part of how the family reduces tension'
    ]) expect(rendered).toContain(marker);
    expect(rendered.indexOf('Your Baseline suggests that clarity')).toBeLessThan(rendered.indexOf('function SourceDetails'));
  });
});