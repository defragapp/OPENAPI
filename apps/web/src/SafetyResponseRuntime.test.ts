import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const css = readFileSync(new URL('./safety-response-runtime.css', import.meta.url), 'utf8');

type FakeTextNode = { textContent: string };
type FakeAnswer = {
  dataset: Record<string, string>;
  attributes: Map<string, string>;
  headline: FakeTextNode;
  directAnswer: FakeTextNode;
  label: FakeTextNode;
  querySelector: (selector: string) => FakeTextNode | null;
  setAttribute: (name: string, value: string) => void;
  getAttribute: (name: string) => string | null;
};

function createAnswer(headline: string, directAnswer: string, label = 'Sovereign'): FakeAnswer {
  const answer: FakeAnswer = {
    dataset: {},
    attributes: new Map(),
    headline: { textContent: headline },
    directAnswer: { textContent: directAnswer },
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
    : selector === '.direct-answer'
      ? answer.directAnswer
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

function safetyAnswer(overrides: Record<string, unknown>) {
  return {
    version: 'sovereign-answer.v2',
    headline: 'Safety response',
    direct_answer: 'A deterministic response that is long enough to be presented clearly.',
    safety_mode: 'grounded',
    confidence: 'supported',
    basis_refs: [],
    actions: [],
    ...overrides
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('safety response presentation runtime', () => {
  it('labels urgent deterministic responses from the answer contract and removes ordinary controls', async () => {
    const urgent = createAnswer('Immediate support', 'Bring in a real person now.', 'Sovereign · Baseline');
    installDeterministicDom([urgent]);
    const runtime = await import('./SafetyResponseRuntime');

    runtime.registerSafetyResponsePayload({ answer: safetyAnswer({
      headline: 'Immediate support',
      direct_answer: 'Bring in a real person now.',
      safety_mode: 'escalate',
      confidence: 'confirmed'
    }) });
    runtime.applySafetyResponsePresentation();

    expect(urgent.dataset.sovereignSafety).toBe('urgent');
    expect(urgent.dataset.sovereignSafetySource).toBe('answer-contract');
    expect(urgent.getAttribute('aria-label')).toBe('Immediate human support response');
    expect(urgent.label.textContent).toBe('Sovereign · Immediate support');
    expect(css).toContain('[data-sovereign-safety] .answer-actions');
    expect(css).toContain('[data-sovereign-safety] .answer-evidence-row');
    expect(css).toContain('display: none !important');
  });

  it('distinguishes grounded and protected-boundary responses without headline allowlists', async () => {
    const grounded = createAnswer('Any grounded headline', 'A grounded response body.');
    const protectedBoundary = createAnswer('Any protected headline', 'A protected response body.');
    const ordinary = createAnswer('An ordinary Baseline answer.', 'An ordinary response body.');
    installDeterministicDom([grounded, protectedBoundary, ordinary]);
    const runtime = await import('./SafetyResponseRuntime');

    runtime.registerSafetyResponsePayload([
      { answer: safetyAnswer({ headline: 'Any grounded headline', direct_answer: 'A grounded response body.' }) },
      { answer: safetyAnswer({
        headline: 'Any protected headline',
        direct_answer: 'A protected response body.',
        confidence: 'confirmed'
      }) },
      { answer: safetyAnswer({
        headline: 'An ordinary Baseline answer.',
        direct_answer: 'An ordinary response body.',
        safety_mode: 'standard'
      }) }
    ]);
    runtime.applySafetyResponsePresentation();

    expect(grounded.dataset.sovereignSafety).toBe('grounded');
    expect(grounded.label.textContent).toBe('Sovereign · Grounded response');
    expect(protectedBoundary.dataset.sovereignSafety).toBe('secure-refusal');
    expect(protectedBoundary.label.textContent).toBe('Sovereign · Protected boundary');
    expect(ordinary.dataset.sovereignSafety).toBeUndefined();
  });

  it('contains no hard-coded safety headline classifier', async () => {
    const source = readFileSync(new URL('./SafetyResponseRuntime.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('SAFETY_HEADLINES');
    expect(source).not.toContain('Immediate human support matters most.');
    expect(source).not.toContain('Separate what is happening from what it may mean.');
    expect(source).toContain("dataset.sovereignSafetySource = 'answer-contract'");
  });
});
