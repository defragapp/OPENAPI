import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const entry = readFileSync(new URL('./entry.ts', import.meta.url), 'utf8');

describe('private inline visual response transport', () => {
  it('keeps the plain answer private and uncached', () => {
    expect(entry).toContain("'cache-control': 'private, no-store'");
  });

  it('bounds Basis evidence before encoding it into a response header', () => {
    expect(entry).toContain('compactVisualStoryPayload');
    expect(entry).toContain('values.slice(0, 2)');
    expect(entry).toContain('value.slice(0, 96)');
    expect(entry).toContain('encodeVisualStoryHeader(compactVisualStoryPayload(result.plan))');
  });

  it('does not emit visual metadata for a suppressed story', () => {
    expect(entry).toContain("result.plan.visual_story.should_show");
    expect(entry).toContain(": ''");
  });
});
