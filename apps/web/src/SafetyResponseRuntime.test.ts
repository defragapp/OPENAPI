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

function safetyAnswer(headline: string, directAnswer: string, presentation: 'grounded' | 'supportive_resources' | 'urgent' | 'emergency' | 'secure_refusal') {
  return {
    answer: {
      version: 'sovereign-answer.v2',
      headline,
      direct_answer: directAnswer,
      safety: {
        version: 'sovereign-safety-response.v1',
        disposition: presentation === 'emergency' ? 'urgent' : presentation,
        category: presentation === 'secure_refusal' ? 'protected_system_request' : 'immediate_self_harm',
        presentation,
        resource_catalog_version: 'safety-resources.2026-07-31.1',
        resources: []
      }
    }
  };
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
  it('uses explicit server-owned metadata for emergency presentation and removes ordinary controls', async () => {
    const headline = 'Immediate human support matters most.';
    const directAnswer = 'Contact local emergency services and bring another person into this now.';
    const emergency = createAnswer(headline, directAnswer, 'Sovereign · Baseline');
    installDeterministicDom([emergency]);
    const { installSafetyResponseRuntime, registerSovereignSafetyPayload } = await import('./SafetyResponseRuntime');

    registerSovereignSafetyPayload(safetyAnswer(headline, directAnswer, 'emergency'));
    installSafetyResponseRuntime();

    expect(emergency.dataset.sovereignSafety).toBe('emergency');
    expect(emergency.getAttribute('aria-label')).toBe('Immediate human support response');
    expect(emergency.label.textContent).toBe('Sovereign · Immediate support');
    expect(css).toContain('[data-sovereign-safety] .answer-actions');
    expect(css).toContain('[data-sovereign-safety] .answer-evidence-row');
    expect(css).toContain('display: none !important');
  });

  it('supports grounded, supportive, urgent, and protected presentation states from metadata', async () => {
    const cases = [
      ['Grounded answer', 'Check what can be directly observed.', 'grounded', 'Sovereign · Grounded response'],
      ['Support answer', 'Bring another person into this today.', 'supportive_resources', 'Sovereign · Support resources'],
      ['Urgent answer', 'Contact urgent human support now.', 'urgent', 'Sovereign · Urgent support'],
      ['Protected answer', 'Private context stays protected.', 'secure_refusal', 'Sovereign · Protected boundary']
    ] as const;
    const answers = cases.map(([headline, direct]) => createAnswer(headline, direct));
    const ordinary = createAnswer('An ordinary Baseline answer.', 'This answer has no safety metadata.');
    installDeterministicDom([...answers, ordinary]);
    const { installSafetyResponseRuntime, registerSovereignSafetyPayload } = await import('./SafetyResponseRuntime');

    cases.forEach(([headline, direct, presentation]) => registerSovereignSafetyPayload(safetyAnswer(headline, direct, presentation)));
    installSafetyResponseRuntime();

    cases.forEach(([, , presentation, label], index) => {
      expect(answers[index]!.dataset.sovereignSafety).toBe(presentation.replaceAll('_', '-'));
      expect(answers[index]!.label.textContent).toBe(label);
    });
    expect(ordinary.dataset.sovereignSafety).toBeUndefined();
  });

  it('does not infer safety state from a headline without validated metadata', async () => {
    const oldHeadlineOnly = createAnswer('Immediate human support matters most.', 'No explicit safety field was supplied.');
    installDeterministicDom([oldHeadlineOnly]);
    const { installSafetyResponseRuntime } = await import('./SafetyResponseRuntime');

    installSafetyResponseRuntime();

    expect(oldHeadlineOnly.dataset.sovereignSafety).toBeUndefined();
  });
});
