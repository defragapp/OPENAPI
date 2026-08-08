import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const workspace = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
const authenticatedWorkspace = readFileSync(new URL('./AuthenticatedWorkspace.tsx', import.meta.url), 'utf8');
const css = [
  readFileSync(new URL('./workspace-chat.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-cohesion.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-modern.css', import.meta.url), 'utf8')
].join('\n');
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
    expect(main).toContain('<AuthenticatedWorkspace />');
    expect(authenticatedWorkspace).toContain('<SovereignIntelligenceWorkspace onboardingVerified />');
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
    expect(workspace).toContain('setCovenantEnabled(false)');
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

  it('ships the active responsive system for the canonical workspace', () => {
    expect(css).toContain('grid-template-columns: 248px minmax(0,1fr) minmax(0,0)');
    expect(css).toContain('340px');
    expect(css).toContain('@media (max-width: 900px)');
    expect(css).toContain('@media (max-width: 620px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
