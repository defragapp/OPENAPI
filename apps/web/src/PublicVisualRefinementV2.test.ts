import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const main = read('./main.tsx');
const stories = read('./LandingProductStories.tsx');
const refinement = read('./public-visual-refinement-v2.css');
const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public visual refinement v2', () => {
  it('loads the bounded refinement immediately before terminal production authority', () => {
    expect(main).toContain("import publicVisualRefinementV2Css from './public-visual-refinement-v2.css?inline';");
    const refinementIndex = main.indexOf('style.textContent += `\\n${publicVisualRefinementV2Css}`;');
    const authorityIndex = main.indexOf('style.textContent += `\\n${productionVisualAuthorityCss}`;');
    expect(refinementIndex).toBeGreaterThan(main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationCss}`;'));
    expect(authorityIndex).toBeGreaterThan(refinementIndex);
    expect(main).toContain("document.documentElement.dataset.sovereignPublicVisualRefinement = 'v2';");
  });

  it('makes one answer surface the public proof point instead of presenting a workflow beside it', () => {
    for (const marker of [
      'display: block !important',
      '.landing-demo--workflow',
      'display: none !important',
      '.landing-demo--chat',
      'width: min(980px, 100%) !important',
      '.landing-demo__traffic',
      '.landing-answer__direct',
      'font-size: 1.13rem !important',
      '.landing-answer__section',
      '.landing-demo__composer-shell'
    ]) expect(refinement).toContain(marker);
  });

  it('uses the native system display stack without restoring retired product fonts', () => {
    expect(refinement).toContain('--sovereign-display-v2:');
    expect(refinement).toContain('-apple-system');
    expect(refinement).toContain('BlinkMacSystemFont');
    expect(refinement).toContain('"SF Pro Display"');
    expect(refinement).toContain('"Segoe UI Variable Display"');
    expect(refinement).not.toContain('"Helvetica Neue"');
    expect(refinement).not.toContain('"Avenir Next"');
    expect(refinement).not.toContain('Optima');
    expect(refinement).not.toContain('Sovereign Display');
    expect(refinement).not.toContain('Sovereign Sans');
  });

  it('uses documented human questions and direct Sovereign intelligence instead of coaching-workbook vocabulary', () => {
    for (const marker of [
      'How do I know when I’m adapting too early?',
      'You may be changing yourself around an anticipated reaction before you have finished deciding what you actually think.',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      'This may be a timing mismatch before it is a disagreement about care, commitment, or the relationship itself.',
      'Why does one disagreement pull the whole family into it?',
      'The whole family may be reacting to how the disagreement moves through the group, not only to the original issue.'
    ]) expect(renderedStories).toContain(marker);

    for (const prohibited of [
      'Name the loop',
      'The loop',
      'A bridge',
      'timing loop',
      'interaction loop',
      'lower pressure without leaving the issue indefinite',
      'What may be happening',
      'Try this',
      'Still unknown'
    ]) expect(renderedStories).not.toContain(prohibited);
  });

  it('keeps explanation in natural prose rather than visible template labels', () => {
    expect((stories.match(/sections=\{\[/g) ?? []).length).toBe(3);
    expect(renderedStories).not.toContain('<small>{section.label}</small>');
    expect(refinement).toContain('.landing-answer__section > small');
    expect(refinement).toContain('display: none !important');
  });

  it('preserves consent, source details, and mobile behavior', () => {
    expect(stories).toContain('Both people must agree before their Baselines can be used together');
    expect(stories).toContain('Each person controls whether their Baseline can be included');
    expect(stories).toContain('<strong>See source details</strong>');
    expect(stories).toContain('These values are not visitor data.');
    expect(refinement).toContain('@media (max-width: 900px)');
    expect(refinement).toContain('@media (max-width: 560px)');
    expect((refinement.match(/{/g) ?? []).length).toBe((refinement.match(/}/g) ?? []).length);
  });
});
