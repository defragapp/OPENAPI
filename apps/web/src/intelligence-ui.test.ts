import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const space = readFileSync(new URL('./SovereignIntelligenceSpace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./space-chat.css', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const prompt = readFileSync(new URL('../../sovereign-worker/src/agent/prompt-v1.ts', import.meta.url), 'utf8');

describe('Baseline-first Sovereign answer UI', () => {
  it('ships one React-owned space without obsolete DOM enhancement runtimes', () => {
    expect(index).toContain('/src/main.tsx');
    for (const file of ['recognition-ui.js', 'intelligence-ui.js', 'ux-audit-runtime.js']) expect(index).not.toContain(file);
    expect(space).toContain('className={`intelligence-space');
    expect(space).toContain('className="sovereign-composer"');
    expect(space).not.toContain('MutationObserver');
  });

  it('renders the validated v2 answer and exact Basis values', () => {
    expect(space).toContain("version: 'sovereign-answer.v2'");
    expect(space).toContain("accept': 'application/vnd.sovereign.answer+json'");
    expect(space).toContain('<SovereignAnswerView');
    expect(space).toContain('<BasisStrip values={basis}');
    expect(space).toContain('value.accessibleLabel');
    expect(space).toContain('Calculated {formatDate(value.computedAt)}');
  });

  it('renders structured Alignment without a score or gauge', () => {
    for (const phrase of ['Supports the fit', 'Pulls against it', 'The real tradeoff', 'Still needed', 'A closer version']) expect(space).toContain(phrase);
    expect(space).not.toMatch(/percentage|score|needle|gauge/i);
  });

  it('keeps people and their interaction visually distinct', () => {
    expect(space).toContain('You may be bringing');
    expect(space).toContain('They may be bringing');
    expect(space).toContain('What happens between you');
    expect(styles).toContain('.relationship-answer > div');
    expect(styles).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
  });

  it('keeps Covenant contextual and explicitly confirmed', () => {
    expect(space).toContain("action.type === 'offer_covenant'");
    expect(space).toContain('Explore this through Covenant?');
    expect(space).toContain('Use for this question');
    expect(space).toContain('setCovenantEnabled(false)');
  });

  it('keeps the runtime prompt Baseline-first and user-correctable', () => {
    expect(prompt).toContain('Give the direct answer first');
    expect(prompt).toContain('Shadow and Gift');
    expect(prompt).toContain('Alignment is not a score or rule');
    expect(prompt).toContain('Keep the people and the interaction distinct');
    expect(prompt).toContain('System: Consider consented facets');
  });

  it('has physically removed the obsolete space and static enhancement files', () => {
    const removed = [
      new URL('./SovereignSpace.tsx', import.meta.url),
      new URL('../public/recognition-ui.js', import.meta.url),
      new URL('../public/intelligence-ui.js', import.meta.url),
      new URL('../public/ux-audit-runtime.js', import.meta.url)
    ];
    for (const file of removed) expect(existsSync(file)).toBe(false);
  });

  it('retires all browser caching rather than caching authenticated space assets', () => {
    expect(serviceWorker).toContain("const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17'");
    expect(serviceWorker).toContain('self.registration.unregister()');
    expect(serviceWorker).toContain('caches.keys()');
    expect(serviceWorker).not.toContain("addEventListener('fetch'");
    expect(serviceWorker).not.toContain("'/app'");
    expect(serviceWorker).not.toContain("'/intelligence-ui.js'");
  });
});
