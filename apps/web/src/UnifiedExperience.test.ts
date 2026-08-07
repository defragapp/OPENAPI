import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const space = readFileSync(new URL('./SovereignIntelligenceSpace.tsx', import.meta.url), 'utf8');
const authenticatedSpace = readFileSync(new URL('./AuthenticatedSpace.tsx', import.meta.url), 'utf8');
const css = [
  readFileSync(new URL('./space-chat.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-cohesion.css', import.meta.url), 'utf8'),
  readFileSync(new URL('./sovereign-modern.css', import.meta.url), 'utf8')
].join('\n');
const main = readFileSync(new URL('./main.tsx', import.meta.url), 'utf8');

describe('unified Sovereign intelligence experience', () => {
  it('offers useful Baseline questions before an incident is supplied', () => {
    for (const phrase of ['What remains steady in me?', 'What may be louder right now?', 'My Baseline', 'Shadow & Gift', 'Alignment', 'Learning', 'Family Role']) {
      expect(space).toContain(phrase);
    }
  });

  it('treats Today, Explore, People, Systems, Library, and You as one intelligence', () => {
    for (const surface of ['Today', 'Explore', 'People', 'Systems', 'Library', 'You']) expect(space).toContain(`name: '${surface}'`);
    expect(space).toContain('Sovereign navigation');
    expect(space).toContain('New exploration');
    expect(main).toContain('<AuthenticatedSpace />');
    expect(authenticatedSpace).toContain('<SovereignIntelligenceSpace onboardingVerified />');
  });

  it('starts a clean exploration when context changes with active content', () => {
    expect(space).toContain('if (next !== surface && (messages.length || draft.trim())) startNewThread(next)');
    expect(space).toContain('setThreadId(newThreadId(nextSurface))');
    expect(space).toContain("if (nextSurface !== 'People') setSelectedPerson('')");
    expect(space).toContain("if (nextSurface !== 'Systems') setSelectedSystem('')");
  });

  it('restores the original surface and permission-bound context', () => {
    expect(space).toContain('validSurface(lastContext.surface)');
    expect(space).toContain('setSurface(restoredSurface)');
    expect(space).toContain("restoredSurface === 'People'");
    expect(space).toContain("restoredSurface === 'Systems'");
    expect(space).toContain('setCovenantEnabled(false)');
  });

  it('keeps each message attached to the context used for the question', () => {
    expect(space).toContain('const messageContext = {');
    expect(space).toContain("role: 'user', text: clean, context: messageContext");
    expect(space).toContain("role: 'assistant', text: '', context: messageContext");
    expect(space).toContain("...(row.context && typeof row.context === 'object' ? { context: row.context } : {})");
  });

  it('uses structured relationship and system data', () => {
    expect(space).toContain('<RelationshipOverview person={selectedPerson}');
    expect(space).toContain('<SystemOverview system={selectedSystem}');
    expect(space).toContain('/comparison');
    expect(space).toContain('/analysis');
    expect(space).toContain('relationshipGraph');
  });

  it('exposes permission and account controls without a permanent Covenant toggle', () => {
    expect(space).toContain("new CustomEvent('sovereign:open-consent-controls')");
    expect(space).toContain('PEOPLE AND PERMISSIONS');
    expect(space).toContain('PRIVACY AND SAVED DATA');
    expect(space).toContain('PLAN AND BILLING');
    expect(space).not.toContain('COVENANT PREFERENCE');
  });

  it('ships the active responsive system for the canonical space', () => {
    expect(css).toContain('grid-template-columns: 248px minmax(0,1fr) minmax(0,0)');
    expect(css).toContain('340px');
    expect(css).toContain('@media (max-width: 900px)');
    expect(css).toContain('@media (max-width: 620px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
