import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const stories = read('./LandingProductStories.tsx');
const demoStyles = read('./public-intelligence-demonstration-v2.css');

describe('public intelligence demo v2 scope', () => {
  it('keeps the redesign isolated to the product-story component and narrow demo authority', () => {
    expect(stories).toContain('data-product-stories="text-first-intelligence-v2"');
    expect(main).toContain("import publicIntelligenceDemonstrationV2Css from './public-intelligence-demonstration-v2.css?inline';");
    expect(main).toContain("dataset.sovereignPublicDemoAuthority = 'text-first-v2'");
    expect(demoStyles).toContain('Narrow authority for the three landing demonstrations only.');
  });

  it('does not define hero, pricing, auth, onboarding, billing, or workspace architecture in the demo layer', () => {
    for (const prohibited of [
      '.v0-hero',
      '.pricing-page',
      '.account-shell',
      '.plan-onboarding',
      '.intelligence-workspace',
      '.sovereign-composer',
      '.billing-',
      '.passkey-'
    ]) expect(demoStyles).not.toContain(prohibited);
  });
});