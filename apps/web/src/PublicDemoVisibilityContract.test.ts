import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const visibility = read('./public-demo-visibility-contract.css');
const demo = read('./public-intelligence-demonstration-v2.css');

describe('public demo visibility contract', () => {
  it('loads a fail-open visibility rule before terminal inline visual authorities', () => {
    expect(main).toContain("import './public-demo-visibility-contract.css';");
    expect(main.indexOf("import './public-demo-visibility-contract.css';")).toBeLessThan(main.indexOf("import './passkey-auth.css';"));
    expect(main).toContain("style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;");
  });

  it('keeps every text-first demo layer visible without IntersectionObserver state', () => {
    expect(visibility).toContain("[data-product-stories='text-first-intelligence-v2']");
    for (const selector of [
      '.landing-demo-question',
      '.landing-demo-copy',
      '.landing-demo-visual',
      '.landing-demo-insights',
      '.landing-intelligence-demo'
    ]) expect(visibility).toContain(selector);
    expect(visibility).toContain('opacity: 1 !important');
    expect(visibility).toContain('visibility: visible !important');
    expect(visibility).not.toContain('display: none');
    expect(visibility).not.toContain('opacity: 0');
  });

  it('retains optional finite motion but never relies on it for meaning', () => {
    expect(demo).toContain(".landing-story[data-visible='true'] .landing-demo-question");
    expect(demo).toContain('@keyframes public-demo-line-v2');
    expect(demo).toContain('@media (prefers-reduced-motion: reduce)');
    expect(demo).not.toContain('infinite');
  });
});
