import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const css = readFileSync(new URL('./safety-response-runtime.css', import.meta.url), 'utf8');

type FakeTextNode = { textContent: string };
type FakeAnswer = {
  dataset: Record<string, string>;
  attributes: Map<string, string>;
  headline: FakeTextNode;
  label: FakeTextNode;
  querySelector: (selector: string) => FakeTextNode | null;
  setAttribute: (name: string, value: string) => void;
  getAttribute: (name: string) => string | null;
};

function createAnswer(headline: string, label = 'Sovereign'): FakeAnswer {
  const answer: FakeAnswer = {
    dataset: {},
    attributes: new Map(),
    headline: { textContent: headline },
    label: { textContent: label },
    querySelector: () => null,
    setAttribute(name, value) {
      answer.attributes.set(name, value);
    },
    getAttribute(name) {
      return answer.attributes.get(name) ?? null;
    }
  };
  answer.querySelector = (selector) => selector === 'h2'
    ? answer.headline
    : selector === 'header > span'
      ? answer.label
      : null;
  return answer;
}

function installDeterministicDom(answers: FakeAnswer[]): void {
  class TestMutationObserver {
    constructor(_callback: MutationCallback) {}
    observe(): void {}
    disconnect(): void {}
    takeRecords(): MutationRecord[] { return []; }
  }

  vi.stubGlobal('document', {
    documentElement: {},
    querySelectorAll: () => answers
  } as unknown as Document);
  vi.stubGlobal('MutationObserver', TestMutationObserver);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('safety response presentation runtime', () => {
  it('labels urgent deterministic responses and removes ordinary answer controls', async () => {
    const urgent = createAnswer('Immediate human support matters most.', 'Sovereign · Baseline');
    installDeterministicDom([urgent]);
    const { installSafetyResponseRuntime } = await import('./SafetyResponseRuntime');

    installSafetyResponseRuntime();

    expect(urgent.dataset.sovereignSafety).toBe('urgent');
    expect(urgent.getAttribute('aria-label')).toBe('Immediate human support response');
    expect(urgent.label.textContent).toBe('Sovereign · Immediate support');
    expect(css).toContain('[data-sovereign-safety] .answer-actions');
    expect(css).toContain('[data-sovereign-safety] .answer-evidence-row');
    expect(css).toContain('display: none !important');
  });

  it('recognizes grounded and protected-boundary deterministic responses only', async () => {
    const grounded = createAnswer('Separate what is happening from what it may mean.');
    const protectedBoundary = createAnswer('Private system details stay protected.');
    const ordinary = createAnswer('An ordinary Baseline answer.');
    installDeterministicDom([grounded, protectedBoundary, ordinary]);
    const { installSafetyResponseRuntime } = await import('./SafetyResponseRuntime');

    installSafetyResponseRuntime();

    expect(grounded.dataset.sovereignSafety).toBe('grounded');
    expect(grounded.label.textContent).toBe('Sovereign · Grounded response');
    expect(protectedBoundary.dataset.sovereignSafety).toBe('secure-refusal');
    expect(protectedBoundary.label.textContent).toBe('Sovereign · Protected boundary');
    expect(ordinary.dataset.sovereignSafety).toBeUndefined();
  });
});
