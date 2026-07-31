import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { installSafetyResponseRuntime } from './SafetyResponseRuntime';

const css = readFileSync(new URL('./safety-response-runtime.css', import.meta.url), 'utf8');

describe('safety response presentation runtime', () => {
  it('labels emergency responses and removes ordinary answer controls', () => {
    document.body.innerHTML = `
      <section class="sovereign-answer">
        <header><span>Sovereign · Baseline</span><h2>Your immediate safety comes first.</h2></header>
        <div class="answer-evidence-row">Basis</div>
        <footer class="answer-actions">Continue</footer>
      </section>`;

    installSafetyResponseRuntime();
    const answer = document.querySelector<HTMLElement>('.sovereign-answer')!;
    expect(answer.dataset.sovereignSafety).toBe('emergency');
    expect(answer.getAttribute('aria-label')).toBe('Emergency human support response');
    expect(answer.getAttribute('role')).toBe('alert');
    expect(answer.getAttribute('aria-live')).toBe('assertive');
    expect(answer.querySelector('header > span')?.textContent).toBe('Sovereign · Immediate safety');
    expect(css).toContain("[data-sovereign-safety] .answer-actions");
    expect(css).toContain("[data-sovereign-safety] .answer-evidence-row");
    expect(css).toContain('display: none !important');
  });

  it('recognizes all current safety states without changing ordinary answers', async () => {
    document.body.innerHTML = `
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>Pause the interpretation and check safety.</h2></header></section>
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>Bring in a grounded human point of contact.</h2></header></section>
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>Keep meaning and evidence separate.</h2></header></section>
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>That internal access is not available.</h2></header></section>
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>An ordinary Baseline answer.</h2></header></section>`;
    document.body.append(document.createElement('i'));
    await Promise.resolve();

    const answers = [...document.querySelectorAll<HTMLElement>('.sovereign-answer')];
    expect(answers[0]?.dataset.sovereignSafety).toBe('urgent');
    expect(answers[0]?.getAttribute('role')).toBe('alert');
    expect(answers[1]?.dataset.sovereignSafety).toBe('supportive');
    expect(answers[1]?.getAttribute('role')).toBe('region');
    expect(answers[2]?.dataset.sovereignSafety).toBe('grounded');
    expect(answers[3]?.dataset.sovereignSafety).toBe('secure-refusal');
    expect(answers[4]?.dataset.sovereignSafety).toBeUndefined();
  });

  it('preserves presentation for already-persisted legacy safety answers', async () => {
    document.body.innerHTML = `
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>Immediate human support matters most.</h2></header></section>
      <section class="sovereign-answer"><header><span>Sovereign</span><h2>Private system details stay protected.</h2></header></section>`;
    document.body.append(document.createElement('i'));
    await Promise.resolve();

    const answers = [...document.querySelectorAll<HTMLElement>('.sovereign-answer')];
    expect(answers[0]?.dataset.sovereignSafety).toBe('urgent');
    expect(answers[1]?.dataset.sovereignSafety).toBe('secure-refusal');
  });
});
