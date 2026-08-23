import { describe, expect, it } from 'vitest';
import {
  MAX_THREAD_MESSAGE_BODY_BYTES,
  MAX_THREAD_MESSAGE_CHARACTERS,
  readBoundedJson,
  readThreadMessageBody
} from './request-body';

describe('bounded thread message requests', () => {
  it('accepts and normalizes a valid message body', async () => {
    const result = await readThreadMessageBody(new Request('https://app.defrag.app/api/v1/threads/one/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: '  What is active today?  ', context: { surface: 'Today' } })
    }));

    expect(result).toMatchObject({
      ok: true,
      message: 'What is active today?',
      body: { context: { surface: 'Today' } }
    });
  });

  it('rejects a declared body above the byte ceiling before reading it', async () => {
    const result = await readBoundedJson(new Request('https://app.defrag.app/api/v1/threads/one/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': String(MAX_THREAD_MESSAGE_BODY_BYTES + 1)
      },
      body: '{}'
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it('rejects an oversized streamed body when content-length is absent', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(MAX_THREAD_MESSAGE_BODY_BYTES));
        controller.enqueue(new Uint8Array([1]));
        controller.close();
      }
    });
    const request = new Request('https://app.defrag.app/api/v1/threads/one/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: stream,
      duplex: 'half'
    } as RequestInit);

    const result = await readBoundedJson(request);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it('rejects invalid JSON without throwing', async () => {
    const result = await readBoundedJson(new Request('https://app.defrag.app/api/v1/threads/one/messages', {
      method: 'POST',
      body: '{'
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      await expect(result.response.json()).resolves.toMatchObject({ error: 'invalid_json' });
    }
  });

  it('rejects a message above the character ceiling', async () => {
    const result = await readThreadMessageBody(new Request('https://app.defrag.app/api/v1/threads/one/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'x'.repeat(MAX_THREAD_MESSAGE_CHARACTERS + 1) })
    }));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });
});
