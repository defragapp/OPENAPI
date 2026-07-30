import { describe, expect, it, vi } from 'vitest';
import {
  D1_BOOKMARK_HEADER,
  attachD1Bookmark,
  createD1RequestSession,
  normalizeD1Bookmark,
  normalizeGatewayOptions,
  normalizeWorkersAiInput,
  normalizeWorkersAiOutput,
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

  it('preserves the response when no bookmark can be produced', async () => {
    const session = { getBookmark: () => { throw new Error('no query executed'); } } as unknown as D1DatabaseSession;
    const response = attachD1Bookmark(Response.json({ ok: true }), session);

    expect(response.headers.get(D1_BOOKMARK_HEADER)).toBeNull();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});

describe('Workers AI free-tier normalization', () => {
  it('converts Responses-style input into the Cloudflare-hosted model shape', () => {
    expect(normalizeWorkersAiInput('@cf/zai-org/glm-4.7-flash', {
      input: 'Return one JSON object.',
      max_output_tokens: 3_200
    })).toEqual({
      messages: [{ role: 'user', content: 'Return one JSON object.' }],
      max_completion_tokens: 3_200,
      response_format: { type: 'json_object' },
      temperature: 0.2
    });
  });

  it('normalizes Cloudflare chat-completion output for existing parsers', () => {
    expect(normalizeWorkersAiOutput('@cf/zai-org/glm-4.7-flash', {
      choices: [{ message: { content: '{"ok":true}' } }]
    })).toEqual({ output_text: '{"ok":true}' });
  });

  it('leaves non-Workers-AI input and output unchanged', () => {
    const input = { input: 'unchanged', max_output_tokens: 10 };
    const output = { output_text: 'unchanged' };
    expect(normalizeWorkersAiInput('openai/gpt-5.5', input)).toBe(input);
    expect(normalizeWorkersAiOutput('openai/gpt-5.5', output)).toBe(output);
  });

  it('forces personalized gateway calls to bypass cache and persistent logs', () => {
    expect(normalizeGatewayOptions({
      gateway: { id: 'sovereign', skipCache: false, collectLog: true, metadata: { plan: 'free' } }
    })).toEqual({
      gateway: { id: 'sovereign', skipCache: true, collectLog: false, metadata: { plan: 'free' } }
    });
  });
});
