import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';

const css = readFileSync(new URL('./app-shell.css', import.meta.url), 'utf8');

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

function answer(headline: string, directAnswer: string) {
  return {
    version: 'sovereign-answer.v2',
    headline,
    direct_answer: directAnswer
  };
}

function safety(presentation: string, category = 'substantial_distress') {
  return {
    version: 'sovereign-safety-response.v1',
    presentation,
    category,
    resourceCatalog: {
      version: 'sovereign-safety-resources.2026-08-02',
      jurisdiction: 'unknown',
      selectionSource: 'generic_fallback',
      selectionNotice: 'Use local human support.',
      disregardAllowed: true,
      resources: []
    }
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('safety response presentation runtime', () => {
  it('labels emergency responses from the explicit safety response contract and removes ordinary controls', async () => {
    const emergency = createAnswer('Immediate support', 'Bring in a real person now.', 'Sovereign · Baseline');
    installDeterministicDom([emergency]);
    const runtime = await import('./SafetyResponseRuntime');

    runtime.registerSafetyResponsePayload({
      answer: answer('Immediate support', 'Bring in a real person now.'),
      safety: safety('emergency', 'immediate_self_harm')
    });
    runtime.applySafetyResponsePresentation();

    expect(emergency.dataset.sovereignSafety).toBe('emergency');
    expect(emergency.dataset.sovereignSafetyCategory).toBe('immediate_self_harm');
    expect(emergency.dataset.sovereignSafetySource).toBe('safety-response-contract');
    expect(emergency.getAttribute('aria-label')).toBe('Emergency human support response');
    expect(emergency.label.textContent).toBe('Sovereign · Emergency help');
    expect(css).toContain('[data-sovereign-safety] .answer-actions');
    expect(css).toContain('[data-sovereign-safety] .answer-evidence-row');
    expect(css).toContain('display: none !important');
  });

  it('renders every supported safety presentation without headline allowlists', async () => {
    const presentations = [
      ['grounded', 'Sovereign · Grounded response'],
      ['supportive_resources', 'Sovereign · Human support'],
      ['urgent', 'Sovereign · Urgent support'],
      ['emergency', 'Sovereign · Emergency help'],
      ['secure_refusal', 'Sovereign · Protected boundary']
    ] as const;
    const answers = presentations.map(([presentation]) => createAnswer(`${presentation} headline`, `${presentation} body`));
    const ordinary = createAnswer('ordinary headline', 'ordinary body');
    installDeterministicDom([...answers, ordinary]);
    const runtime = await import('./SafetyResponseRuntime');

    runtime.registerSafetyResponsePayload([
      ...presentations.map(([presentation]) => ({
        answer: answer(`${presentation} headline`, `${presentation} body`),
        safety: safety(presentation)
      })),
      { answer: answer('ordinary headline', 'ordinary body') }
    ]);
    runtime.applySafetyResponsePresentation();

    presentations.forEach(([presentation, label], index) => {
      expect(answers[index]!.dataset.sovereignSafety).toBe(presentation);
      expect(answers[index]!.label.textContent).toBe(label);
    });
    expect(ordinary.dataset.sovereignSafety).toBeUndefined();
  });

  it('rejects answer-only safety inference and contains no hard-coded headline classifier', async () => {
    const answerOnly = createAnswer('Immediate human support matters most.', 'A response body.');
    installDeterministicDom([answerOnly]);
    const runtime = await import('./SafetyResponseRuntime');
    runtime.registerSafetyResponsePayload({ answer: answer('Immediate human support matters most.', 'A response body.') });
    runtime.applySafetyResponsePresentation();

    expect(answerOnly.dataset.sovereignSafety).toBeUndefined();
    const source = readFileSync(new URL('./SafetyResponseRuntime.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('SAFETY_HEADLINES');
    expect(source).not.toContain('presentationFromAnswer');
    expect(source).toContain("dataset.sovereignSafetySource = 'safety-response-contract'");
  });
});
