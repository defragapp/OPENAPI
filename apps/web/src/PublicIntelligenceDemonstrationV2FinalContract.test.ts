import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const stories = read('./LandingProductStories.tsx');
const styles = read('./public-intelligence-demonstration-v2.css');
const rendered = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public intelligence demonstrations v2 final acceptance', () => {
  it('is text-first and removes visible workflow/tutorial UI', () => {
    expect((rendered.match(/<DemoSurface/g) ?? []).length).toBe(3);
    expect(rendered).not.toContain('<WorkflowPanel');
    expect(rendered).not.toContain('landing-workflow__progress');
    expect(rendered).not.toContain('landing-demo__traffic');
    expect(rendered).not.toContain('How Sovereign builds the answer');
  });

  it('locks self → relationship → system capability and answer value', () => {
    const ordered = [
      'How do I make decisions that actually fit me?',
      'The right decision may not be the easiest one to explain.',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'You may both be trying to reach clarity in opposite ways.',
      'What changes when I stop playing the role everyone expects?',
      'When one person changes roles, the system has to find another route.'
    ];
    let cursor = -1;
    for (const marker of ordered) {
      const index = rendered.indexOf(marker);
      expect(index).toBeGreaterThan(cursor);
      cursor = index;
    }
  });

  it('keeps each comprehension visual meaningful and progressively richer', () => {
    for (const marker of [
      'the choice',
      'making it acceptable',
      'What happens between you',
      'care now',
      'return at 7',
      'What happens now',
      'When you stop mediating',
      'communication has to find another route'
    ]) expect(rendered).toContain(marker);
  });

  it('keeps People and Systems boundaries explicit', () => {
    for (const marker of [
      'Both people choose what they share',
      'Only they can say what they actually felt or intended',
      'Roles and events are supplied in the example',
      'Each person controls whether their Baseline can be included',
      'What you told Sovereign'
    ]) expect(rendered).toContain(marker);
    expect(rendered.toLowerCase()).not.toContain('missing perspective');
  });

  it('is score-free while retaining a quiet compatibility boundary statement', () => {
    for (const prohibited of ['83%', 'compatibilityScore', 'compatibilityPercent', 'alignmentScore', 'Alignment meter']) expect(rendered).not.toContain(prohibited);
    expect(rendered).toContain('No compatibility score');
  });

  it('keeps exact representative sources collapsed and secondary', () => {
    expect(rendered).toContain('<details className="landing-evidence">');
    expect(rendered).toContain('<strong>See source details</strong>');
    expect(rendered).toContain('These values are not visitor data.');
    expect(rendered).not.toContain('<strong>Basis</strong>');
  });

  it('keeps calibration accessible, mobile visuals present, and motion finite', () => {
    expect(rendered).toContain('Does this fit?');
    expect(rendered).toContain('aria-pressed={choice === value}');
    expect(styles).toContain('min-width: 44px !important');
    expect(styles).toContain('min-height: 44px !important');
    expect(styles).toContain('@media (max-width: 760px)');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).not.toContain('infinite');
  });
});