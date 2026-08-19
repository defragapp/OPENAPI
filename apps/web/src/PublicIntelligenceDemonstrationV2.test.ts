import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const stories = read('./LandingProductStories.tsx');
const styles = read('./public-intelligence-demonstration-v2.css');
const main = read('./main.tsx');

const renderedStories = stories.slice(stories.indexOf('export function LandingProductStories()'));

describe('public intelligence demonstrations v2', () => {
  it('locks the three questions and capability progression', () => {
    const markers = [
      '01 · You',
      'How do I make decisions that actually fit me?',
      '02 · You + your people',
      'Why does the same conversation feel urgent to me and pressuring to them?',
      '03 · From 1:1 to the whole system',
      'What changes when I stop playing the role everyone expects?'
    ];
    let previous = -1;
    for (const marker of markers) {
      const index = renderedStories.indexOf(marker);
      expect(index).toBeGreaterThan(previous);
      previous = index;
    }
  });

  it('locks the three edited Sovereign answer headlines', () => {
    for (const headline of [
      'The right decision may not be the easiest one to explain.',
      'You may both be trying to reach clarity in opposite ways.',
      'When one person changes roles, the system has to find another route.'
    ]) expect(renderedStories).toContain(headline);
  });

  it('removes visible workflow/tutorial anatomy from the rendered product stories', () => {
    expect(renderedStories).not.toContain('function WorkflowPanel(');
    expect(renderedStories).not.toContain('useWorkflowProgress');
    expect(renderedStories).not.toContain('landing-workflow__progress');
    expect(renderedStories).not.toContain('landing-demo__traffic');
    expect(renderedStories).not.toContain('Step 1');
    expect(renderedStories).toContain('landing-intelligence-demo');
  });

  it('keeps one useful distinction and one natural continuation per demonstration', () => {
    for (const marker of [
      'The real tradeoff',
      'A closer version',
      'Explore what changes when pressure enters the decision →',
      'The useful distinction',
      'A bridge',
      'What would clear communication look like for each of us? →',
      'Why the role can keep returning',
      'The system-level change',
      'Show me how this same system looks when I don’t mediate →'
    ]) expect(renderedStories).toContain(marker);
  });

  it('uses one progressively richer comprehension visual without scores', () => {
    for (const marker of [
      'function DecisionField()',
      'decision-field__choice',
      'decision-field__adapt',
      'function RelationshipField()',
      'relationship-field__center',
      'What happens between you',
      'function SystemField()',
      'system-field__state--current',
      'system-field__state--changed'
    ]) expect(renderedStories).toContain(marker);
    for (const prohibited of ['83%', 'alignmentScore', 'compatibilityScore', 'compatibilityPercent', 'personality score']) {
      expect(renderedStories.toLowerCase()).not.toContain(prohibited.toLowerCase());
    }
  });

  it('keeps relationship participants distinct and system roles supplied rather than inferred', () => {
    for (const marker of [
      '<strong>You</strong>',
      '<strong>Alex</strong>',
      'Both people choose what they share',
      'Only they can say what they actually felt or intended',
      'Roles and events are supplied in the example',
      'What you told Sovereign',
      'You remain in the system; the communication path is what changes.'
    ]) expect(renderedStories).toContain(marker);
    expect(renderedStories.toLowerCase()).not.toContain('missing perspective');
    expect(renderedStories.toLowerCase()).not.toContain('authority as a systems');
  });

  it('keeps exact representative source values collapsed and secondary', () => {
    for (const marker of [
      "{ code: 'HD G13.1'",
      "{ code: 'GK ACT13'",
      "{ code: '☉ CAN 04.2°'",
      "{ code: 'HD G22.4'",
      "{ code: 'HD G57.2'",
      "{ code: 'REL ☿ □ ☿ 1.8°'"
    ]) expect(stories).toContain(marker);
    expect(renderedStories).toContain('<details className="landing-evidence">');
    expect(renderedStories).toContain('<strong>See source details</strong>');
    expect(renderedStories).toContain('These values are not visitor data.');
  });

  it('provides quiet correctable calibration with accessible pressed states', () => {
    expect(renderedStories).toContain('Does this fit?');
    expect(renderedStories).toContain("['yes', 'Yes']");
    expect(renderedStories).toContain("['partly', 'Partly']");
    expect(renderedStories).toContain("['no', 'Not really']");
    expect(renderedStories).toContain('aria-pressed={choice === value}');
    expect(styles).toContain('.landing-fit-check button');
    expect(styles).toContain('min-width: 44px !important');
    expect(styles).toContain('min-height: 44px !important');
  });

  it('uses finite explanatory motion only and leaves meaning visible under reduced motion', () => {
    for (const marker of [
      '@keyframes public-demo-arrive-v2',
      '@keyframes public-demo-line-v2',
      '@keyframes public-demo-resolve-v2',
      '@media (prefers-reduced-motion: reduce)',
      'animation: none !important',
      'opacity: 1 !important'
    ]) expect(styles).toContain(marker);
    expect(styles).not.toContain('infinite');
  });

  it('preserves the intelligence on mobile rather than replacing visuals with paragraphs', () => {
    expect(styles).toContain('@media (max-width: 760px)');
    expect(styles).toContain('.relationship-field__people');
    expect(styles).toContain('grid-template-columns: 1fr !important');
    expect(styles).toContain('.landing-understanding--system');
    expect(styles).toContain('min-height: 470px !important');
    expect(styles).not.toContain('.landing-understanding {\n    display: none');
  });

  it('loads after the senior global visual system as a narrow public-demo authority', () => {
    const senior = main.indexOf('style.textContent += `\\n${seniorDesignSystemCss}`;');
    const demo = main.indexOf('style.textContent += `\\n${publicIntelligenceDemonstrationV2Css}`;');
    expect(demo).toBeGreaterThan(senior);
    expect(main).toContain("dataset.sovereignProductStories = 'text-first-intelligence-v2'");
    expect(main).toContain("dataset.sovereignPublicDemoAuthority = 'text-first-v2'");
  });

  it('keeps presentation CSS structurally balanced', () => {
    expect((styles.match(/{/g) ?? []).length).toBe((styles.match(/}/g) ?? []).length);
  });
});