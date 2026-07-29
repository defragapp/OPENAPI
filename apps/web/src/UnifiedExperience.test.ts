import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./experience-reconciliation.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('unified Sovereign intelligence experience', () => {
  it('offers useful Baseline questions before an incident is supplied', () => {
    for (const phrase of ['What remains steady in me?', 'What may be louder right now?', 'My Baseline', 'Shadow & Gift', 'Alignment', 'Learning', 'Family Role']) {
      expect(workspace).toContain(phrase);
    }
  });

  it('treats Today, Explore, People, Systems, Library, and You as one intelligence', () => {
    for (const surface of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) expect(workspace).toContain(`name: '${surface}'`);
    expect(workspace).toContain('Sovereign navigation');
    expect(workspace).toContain('New exploration');
    expect(main).toContain('<SovereignIntelligenceWorkspace />');
  });

  it('starts a clean exploration when context changes with active content', () => {
    expect(workspace).toContain('if (next !== surface && (messages.length || draft.trim())) startNewThread(next)');
    expect(workspace).toContain('setThreadId(newThreadId(nextSurface))');
    expect(workspace).toContain("if (nextSurface !== 'People') setSelectedPerson('')");
    expect(workspace).toContain("if (nextSurface !== 'Systems') setSelectedSystem('')");
  });

  it('restores the original surface and permission-bound context', () => {
    expect(workspace).toContain('validSurface(lastContext.surface)');
    expect(workspace).toContain('setSurface(restoredSurface)');
    expect(workspace).toContain("restoredSurface === 'People'");
    expect(workspace).toContain("restoredSurface === 'Systems'");
    expect(workspace).toContain("setCovenantEnabled(false)");
  });

  it('keeps each message attached to the context used for the question', () => {
    expect(workspace).toContain('const messageContext = {');
    expect(workspace).toContain("role: 'user', text: clean, context: messageContext");
    expect(workspace).toContain("role: 'assistant', text: '', context: messageContext");
    expect(workspace).toContain("...(row.context && typeof row.context === 'object' ? { context: row.context } : {})");
  });

  it('uses structured relationship and system data', () => {
    expect(workspace).toContain('<RelationshipOverview person={selectedPerson}');
    expect(workspace).toContain('<SystemOverview system={selectedSystem}');
    expect(workspace).toContain('/comparison');
    expect(workspace).toContain('/analysis');
    expect(workspace).toContain('relationshipGraph');
  });

  it('exposes permission and account controls without a permanent Covenant toggle', () => {
    expect(workspace).toContain("new CustomEvent('sovereign:open-consent-controls')");
    expect(workspace).toContain('PEOPLE AND PERMISSIONS');
    expect(workspace).toContain('PRIVACY AND SAVED DATA');
    expect(workspace).toContain('PLAN AND BILLING');
    expect(workspace).not.toContain('COVENANT PREFERENCE');
  });

  it('ships responsive styling for the canonical workspace', () => {
    expect(css).toContain('width: 220px');
    expect(css).toContain('width: 360px');
    expect(css).toContain('@media (max-width: 980px)');
    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
