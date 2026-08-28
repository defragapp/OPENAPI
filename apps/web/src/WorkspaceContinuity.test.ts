import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const source = readFileSync(new URL('./SovereignIntelligenceWorkspace.tsx', import.meta.url), 'utf8');
describe('workspace continuity', () => {
  it('keeps navigation non-destructive and reset explicit', () => { expect(source).not.toContain("startNewThread(next)"); expect(source).toContain('Ask something new'); });
  it('uses one honest assistant processing state', () => { expect(source).toContain("const preparing = 'Thinking about your question…'"); expect(source).not.toContain("'Connecting your Baseline'"); });
  it('restores drafts and sanitizes provider failures', () => { expect(source).toContain("setDraft(previousDraft || clean)"); expect(source).toContain('Your draft and conversation are unchanged.'); });
  it('never forwards arbitrary API or provider strings into workspace status', () => { expect(source).toContain("throw new Error('This request could not be completed. Your information is safe. Try again when ready.')"); expect(source).not.toContain('problem.message || problem.error || textMessage'); });
  it('bounds the public composer', () => expect(source).toContain('maxLength={10_000}'));
});
