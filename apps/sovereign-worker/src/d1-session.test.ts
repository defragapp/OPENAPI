import { describe, expect, it, vi } from 'vitest';
import {
  D1_BOOKMARK_HEADER,
  attachD1Bookmark,
  createD1RequestSession,
  normalizeD1Bookmark,
  readD1Bookmark
} from './d1-session';

describe('D1 request sessions', () => {
  it('starts API requests from the primary when no bookmark is available', () => {
    const session = { getBookmark: () => 'bookmark-next' } as unknown as D1DatabaseSession;
    const withSession = vi.fn(() => session);
    const db = { withSession } as unknown as D1Database;

    expect(createD1RequestSession(new Request('https://app.defrag.app/api/v1/you'), db)).toBe(session);
    expect(withSession).toHaveBeenCalledWith('first-primary');
  });

  it('continues from a valid browser bookmark', () => {
    const session = { getBookmark: () => 'bookmark-next' } as unknown as D1DatabaseSession;
    const withSession = vi.fn(() => session);
    const db = { withSession } as unknown as D1Database;
    const request = new Request('https://app.defrag.app/api/v1/library', {
      headers: { [D1_BOOKMARK_HEADER]: 'bookmark-previous' }
    });

    expect(readD1Bookmark(request)).toBe('bookmark-previous');
    expect(createD1RequestSession(request, db)).toBe(session);
    expect(withSession).toHaveBeenCalledWith('bookmark-previous');
  });

  it('does not create sessions for static navigation requests', () => {
    const withSession = vi.fn();
    const db = { withSession } as unknown as D1Database;

    expect(createD1RequestSession(new Request('https://app.defrag.app/app'), db)).toBeUndefined();
    expect(withSession).not.toHaveBeenCalled();
  });

  it('rejects oversized or control-character bookmarks', () => {
    expect(normalizeD1Bookmark('a'.repeat(1_025))).toBeUndefined();
    expect(normalizeD1Bookmark('bookmark\nforged')).toBeUndefined();
  });

  it('returns the latest bookmark without changing the response body', async () => {
    const session = { getBookmark: () => 'bookmark-next' } as unknown as D1DatabaseSession;
    const response = attachD1Bookmark(Response.json({ ok: true }), session);

    expect(response.headers.get(D1_BOOKMARK_HEADER)).toBe('bookmark-next');
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
