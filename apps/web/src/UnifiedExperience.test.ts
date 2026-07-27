import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./unified-entry.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('unified Sovereign intelligence experience', () => {
  it('gives users four clear ways to begin from Today', () => {
    expect(workspace).toContain('WHAT WOULD YOU LIKE TO UNDERSTAND?');
    expect(workspace).toContain('UNDERSTAND MYSELF');
    expect(workspace).toContain('EXAMINE A CHOICE');
    expect(workspace).toContain('UNDERSTAND A RELATIONSHIP');
    expect(workspace).toContain('MAP A HUMAN SYSTEM');
    expect(workspace).toContain('Choose one place to begin.');
  });

  it('treats Today, Explore, People, Systems, Library, and You as surfaces of one intelligence', () => {
    for (const surface of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) {
      expect(workspace).toContain(`name: '${surface}'`);
    }
    expect(workspace).toContain('Sovereign navigation');
    expect(workspace).toContain('＋ New exploration');
    expect(workspace).not.toContain('Loading your workspace');
  });

  it('starts a new exploration when the user changes surfaces with active content', () => {
    expect(workspace).toContain("if (next !== surface && (messages.length > 0 || draft.trim()))");
    expect(workspace).toContain('startNewThread(next)');
    expect(workspace).toContain('setThreadId(newThreadId(nextSurface))');
  });

  it('restores the original surface and permitted context for saved conversations', () => {
    expect(workspace).toContain('validSurface(lastContext.surface)');
    expect(workspace).toContain('setSurface(restoredSurface)');
    expect(workspace).toContain("restoredSurface === 'People'");
    expect(workspace).toContain("restoredSurface === 'Systems'");
    expect(workspace).toContain("typeof lastContext.covenantEnabled === 'boolean'");
    expect(workspace).toContain('Conversation restored in its original context.');
  });

  it('keeps each local message attached to the context used for that question', () => {
    expect(workspace).toContain('const messageContext = {');
    expect(workspace).toContain("role: 'user', text: clean, context: messageContext");
    expect(workspace).toContain("role: 'assistant', text: '', context: messageContext");
    expect(workspace).toContain('validSurface(message.context?.surface)');
  });

  it('preserves real relationship and system data after a response', () => {
    expect(workspace).toContain('<PerspectiveSplit person={selectedPerson} today={today} onPrompt={onPrompt} />');
    expect(workspace).toContain('<SystemMap system={selectedSystem} people={people} onPrompt={onPrompt} />');
    expect(workspace).not.toContain('today={null}');
    expect(workspace).not.toContain('people={[]}');
  });

  it('exposes the existing consent controls from the mounted experience', () => {
    expect(workspace).toContain("new CustomEvent('sovereign:open-consent-controls')");
    expect(workspace).toContain('People & permissions');
    expect(workspace).toContain('Privacy');
    expect(workspace).toContain('Terms');
    expect(workspace).toContain('Support');
  });

  it('ships responsive premium styling for the guided entry', () => {
    expect(main).toContain("import './unified-entry.css'");
    expect(css).toContain('.guided-start-grid');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toContain('@media (max-width: 820px)');
    expect(css).toContain('@media (max-width: 640px)');
    expect(css).toContain('@media (prefers-contrast: more)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
