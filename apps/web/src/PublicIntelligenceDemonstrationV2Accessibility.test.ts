import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./public-intelligence-demonstration-v2.css', import.meta.url), 'utf8');

describe('public demo v2 accessibility', () => {
  it('provides textual meaning for each visual understanding moment', () => {
    for (const marker of [
      'aria-label="A representative decision separates the choice itself',
      'aria-label="A representative interaction loop between You and Alex',
      'aria-label="A representative three-person family system',
      '<figcaption>Separate the decision',
      '<figcaption>A small timing change',
      '<figcaption>You remain in the system'
    ]) expect(stories).toContain(marker);
  });

  it('keeps calibration and disclosures keyboard-accessible', () => {
    expect(stories).toContain('<button key={value} type="button" aria-pressed={choice === value}');
    expect(stories).toContain('<details className="landing-evidence">');
    expect(stories).toContain('<summary aria-label="See source details for this representative example">');
    expect(styles).toContain('min-width: 44px !important');
    expect(styles).toContain('min-height: 44px !important');
  });

  it('preserves complete static meaning for reduced motion', () => {
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('animation: none !important');
    expect(styles).toContain('opacity: 1 !important');
    expect(styles).toContain('stroke-dashoffset: 0 !important');
  });
});