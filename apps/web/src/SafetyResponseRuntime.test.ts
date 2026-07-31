import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { installSafetyResponseRuntime } from './SafetyResponseRuntime';

const css = readFileSync(new URL('./safety-response-runtime.css', import.meta.url), 'utf8');

describe('safety response presentation runtime', () => {
  it('labels urgent deterministic responses and removes ordinary answer controls', () => {
    document.body.innerHTML = `
      <section class="sovereign-answer">
        <header><span>Sovereign · Baseline</span><h2>Immediate human support matters most.</h2></header>
        <div class="answer-evidence-row">Basis</div>
        <footer class="answer-actions">Continue</footer>
      </section>`;

    installSafetyResponseRuntime();
    const answer = document.querySelector<HTMLElement>('.sovereign-answer')!;
    expect(answer.dataset.sovereignSafety).toBe('urgent');
    expect(answer.getAttribute('aria-label')).toBe('Immediate human support response');
    expect(answer.querySelector('header > span')?.textContent).toBe('Sovereign · Immediate support');
    expect(css).toContain("[data-sovereign-safety] .answer-actions");
    expect(css).toContain("[data-sovereign-safety] .answer-evidence-row");
    expect(css).toContain('display: none !important');
  });

  it('recognizes grounded and protected-boundary deterministic responses only', async () => {
    document.body.innerHTML = `
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>Separate what is happening from what it may mean.</h2></header></section>
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>Private system details stay protected.</h2></header></section>
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>An ordinary Baseline answer.</h2></header></section>`;
    document.body.append(document.createElement('i'));
    await Promise.resolve();

    const answers = [...document.querySelectorAll<HTMLElement>('.sovereign-answer')];
    expect(answers[0]?.dataset.sovereignSafety).toBe('grounded');
    expect(answers[1]?.dataset.sovereignSafety).toBe('secure-refusal');
    expect(answers[2]?.dataset.sovereignSafety).toBeUndefined();
  });
});
