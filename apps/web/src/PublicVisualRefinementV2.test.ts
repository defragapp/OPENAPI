import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const stories = read('./LandingProductStories.tsx');
const refinement = read('./public-visual-refinement-v2.css');

describe('public visual refinement v2', () => {
  it('loads the bounded refinement immediately before terminal production authority', () => {
    expect(main).toContain("import publicVisualRefinementV2Css from './public-visual-refinement-v2.css?inline';");
    const refinementIndex = main.indexOf('style.textContent += `\\n${publicVisualRefinementV2Css}`;');
    const authorityIndex = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    expect(refinementIndex).toBeGreaterThan(main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationCss}`;'));
    expect(authorityIndex).toBeGreaterThan(refinementIndex);
    expect(main).toContain("document.documentElement.dataset.sovereignPublicVisualRefinement = 'v2';");
  });

  it('keeps the existing story architecture while making the AI answer the visual proof point', () => {
    for (const marker of [
      'grid-template-columns: minmax(280px, 0.72fr) minmax(0, 1.28fr)',
      '.landing-demo--workflow',
      '.landing-demo--chat',
      '.landing-workflow > li:not(.is-active) .landing-workflow__copy > span',
      '.landing-answer__direct',
      'font-size: 1.06rem !important',
      '.landing-answer__section',
      'grid-template-columns: minmax(92px, 0.24fr) minmax(0, 0.76fr)',
      '.landing-message--user',
      'max-width: 72% !important'
    ]) expect(refinement).toContain(marker);
  });

  it('uses a deliberate native display treatment without restoring retired product fonts', () => {
    expect(refinement).toContain('--sovereign-display-v2:');
    expect(refinement).toContain('"Helvetica Neue"');
    expect(refinement).toContain('-apple-system');
    expect(refinement).toContain('"SF Pro Display"');
    expect(refinement).toContain('"Segoe UI Variable Display"');
    expect(refinement).not.toContain('"Avenir Next"');
    expect(refinement).not.toContain('Optima');
    expect(refinement).not.toContain('Sovereign Display');
    expect(refinement).not.toContain('Sovereign Sans');
  });

  it('reduces the public demonstrations to three understandable reasoning steps and three compact answer rows', () => {
    for (const marker of [
      'Start with the question',
      'Find the useful difference',
      'Give you something you can try',
      'Start with what happened',
      'Show what happens between you',
      'Find a lower-pressure next step',
      'Start with what you told Sovereign',
      'Show how pressure moves',
      'Change one thing and watch what happens',
      'Am I refining this idea—or editing myself to avoid other people’s reactions?',
      'I want to resolve things now. My partner goes quiet.',
      'Why do I keep ending up as the mediator in my family?'
    ]) expect(stories).toContain(marker);

    expect((stories.match(/const SELF_FLOW[\s\S]*?\] as const;/) ?? [''])[0].match(/kind:/g)?.length).toBe(3);
    expect((stories.match(/const RELATIONSHIP_FLOW[\s\S]*?\] as const;/) ?? [''])[0].match(/kind:/g)?.length).toBe(3);
    expect((stories.match(/const SYSTEM_FLOW[\s\S]*?\] as const;/) ?? [''])[0].match(/kind:/g)?.length).toBe(3);
    expect((stories.match(/sections=\{\[/g) ?? []).length).toBe(3);
    expect(stories).not.toContain('<SystemAnalysis />');
  });

  it('preserves consent, source details, and reduced-motion/mobile behavior', () => {
    expect(stories).toContain('Both people must agree before their Baselines can be used together');
    expect(stories).toContain('Each person controls whether their Baseline can be included');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).toContain('These values are not visitor data.');
    expect(refinement).toContain('@media (max-width: 900px)');
    expect(refinement).toContain('@media (max-width: 560px)');
    expect((refinement.match(/{/g) ?? []).length).toBe((refinement.match(/}/g) ?? []).length);
  });
});
