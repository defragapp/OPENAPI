import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const prompt = readFileSync(new URL('../../sovereign-worker/src/agent/prompt-v1.ts', import.meta.url), 'utf8');

describe('Baseline-first Sovereign answer UI', () => {
  it('ships one React-owned workspace without obsolete DOM enhancement runtimes', () => {
    expect(index).toContain('/src/main.tsx');
    for (const file of ['recognition-ui.js', 'intelligence-ui.js', 'ux-audit-runtime.js']) expect(index).not.toContain(file);
    expect(workspace).toContain('className={`intelligence-workspace');
    expect(workspace).toContain('className="sovereign-composer"');
    expect(workspace).not.toContain('MutationObserver');
  });

  it('renders the validated v2 answer and exact Basis values', () => {
    expect(workspace).toContain("version: 'sovereign-answer.v2'");
    expect(workspace).toContain("accept': 'application/vnd.sovereign.answer+json'");
    expect(workspace).toContain('<SovereignAnswerView');
    expect(workspace).toContain('<BasisStrip values={basis}');
    expect(workspace).toContain('value.accessibleLabel');
    expect(workspace).toContain('Calculated {formatDate(value.computedAt)}');
  });

  it('renders structured Alignment without a score or gauge', () => {
    for (const phrase of ['Supports the fit', 'Pulls against it', 'The real tradeoff', 'Still needed', 'A closer version']) expect(workspace).toContain(phrase);
    expect(workspace).not.toMatch(/percentage|score|needle|gauge/i);
  });

  it('keeps people and their interaction visually distinct', () => {
    expect(workspace).toContain('You may be bringing');
    expect(workspace).toContain('They may be bringing');
    expect(workspace).toContain('What happens between you');
    expect(styles).toContain('.relationship-answer > div');
    expect(styles).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
  });

  it('keeps Covenant contextual and explicitly confirmed', () => {
    expect(workspace).toContain("action.type === 'offer_covenant'");
    expect(workspace).toContain('Explore this through Covenant?');
    expect(workspace).toContain('Use for this question');
    expect(workspace).toContain('setCovenantEnabled(false)');
  });

  it('keeps the runtime prompt Baseline-first and user-correctable', () => {
    expect(prompt).toContain('Give the direct answer first');
    expect(prompt).toContain('Shadow and Gift');
    expect(prompt).toContain('Alignment is not a score or rule');
    expect(prompt).toContain('Keep the people and the interaction distinct');
    expect(prompt).toContain('System: Consider consented facets');
  });

  it('has physically removed the obsolete workspace and static enhancement files', () => {
    const removed = [
      new URL('./SovereignWorkspace.tsx', import.meta.url),
      new URL('../public/recognition-ui.js', import.meta.url),
      new URL('../public/intelligence-ui.js', import.meta.url),
      new URL('../public/ux-audit-runtime.js', import.meta.url)
    ];
    for (const file of removed) expect(existsSync(file)).toBe(false);
  });

  it('retires all browser caching rather than caching authenticated workspace assets', () => {
    expect(serviceWorker).toContain("const RETIREMENT_MARKER = 'sovereign-public-cache-retired-v17'");
    expect(serviceWorker).toContain('self.registration.unregister()');
    expect(serviceWorker).toContain('caches.keys()');
    expect(serviceWorker).not.toContain("addEventListener('fetch'");
    expect(serviceWorker).not.toContain("'/app'");
    expect(serviceWorker).not.toContain("'/intelligence-ui.js'");
  });
});
