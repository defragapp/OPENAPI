import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stories = readFileSync(new URL('./LandingProductStories.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./public-intelligence-demonstration-v2.css', import.meta.url), 'utf8');

describe('public demo v2 non-dashboard presentation', () => {
  it('does not introduce dashboard or browser-window product chrome', () => {
    for (const prohibited of ['dashboard', 'traffic-light', 'landing-demo__traffic']) {
      expect(stories.toLowerCase()).not.toContain(prohibited.toLowerCase());
      expect(styles.toLowerCase()).not.toContain(prohibited.toLowerCase());
    }
  });
});