import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const stories = read('./LandingProductStories.tsx');
const styles = read('./public-intelligence-demonstration-v2.css');

describe('public intelligence demo isolation hooks', () => {
  it('exposes stable section and demo identities for screenshot review', () => {
    for (const marker of [
      'data-viewport-section="personal"',
      'data-viewport-section="relationship"',
      'data-viewport-section="system"',
      'data-demo-kind={kind}',
      'landing-intelligence-demo--${kind}'
    ]) expect(stories).toContain(marker);
  });

  it('keeps each isolated demo self-explanatory without surrounding marketing copy', () => {
    for (const marker of [
      '<small>Question</small>',
      '<small>Sovereign</small>',
      'The right decision may not be the easiest one to explain.',
      'You may both be trying to reach clarity in opposite ways.',
      'When one person changes roles, the system has to find another route.',
      'What happens between you',
      'What happens now',
      'When you stop mediating',
      'Does this fit?',
      '<strong>See source details</strong>'
    ]) expect(stories).toContain(marker);
  });

  it('does not require surrounding cards, windows, or decorative browser chrome for comprehension', () => {
    expect(stories).not.toContain('landing-demo__traffic');
    expect(styles).not.toContain('.landing-demo__traffic');
    expect(styles).not.toContain('browser');
    expect(styles).not.toContain('traffic-light');
  });
});