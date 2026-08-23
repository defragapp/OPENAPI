export const MAX_THREAD_MESSAGE_BODY_BYTES = 64 * 1024;
export const MAX_THREAD_MESSAGE_CHARACTERS = 12_000;

export type ThreadMessageBody = {
  message: string;
  context?: unknown;
};

export type ThreadMessageReadResult =
  | { ok: true; body: ThreadMessageBody; message: string }
  | { ok: false; response: Response };

function jsonError(status: number, error: string, message: string): Response {
  return Response.json({ error, message }, {
    status,
    headers: { 'cache-control': 'private, no-store' }
  });
}

function tooLargeResponse(): Response {
  return jsonError(
    413,
    'sovereign_message_too_large',
    'Keep each message under 10,000 characters and try again.'
  );
}

export async function readBoundedJson(
  request: Request,
  maxBytes = MAX_THREAD_MESSAGE_BODY_BYTES
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  const declaredLength = request.headers.get('content-length');
  if (declaredLength) {
    const parsedLength = Number(declaredLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) {
      return { ok: false, response: tooLargeResponse() };
    }
  }

  if (!request.body) return { ok: true, value: {} };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel('request_body_limit_exceeded').catch(() => undefined);
      return { ok: false, response: tooLargeResponse() };
    }
    chunks.push(value);
  }

  if (totalBytes === 0) return { ok: true, value: {} };

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return {
      ok: false,
      response: jsonError(400, 'invalid_json', 'Request body must be valid JSON.')
    };
  }
}

export async function readThreadMessageBody(request: Request): Promise<ThreadMessageReadResult> {
  const parsed = await readBoundedJson(request);
  if (!parsed.ok) return parsed;

  if (!parsed.value || typeof parsed.value !== 'object' || Array.isArray(parsed.value)) {
    return {
      ok: false,
      response: jsonError(400, 'invalid_message', 'Message required')
    };
  }

  const record = parsed.value as Record<string, unknown>;
  const message = typeof record.message === 'string' ? record.message.trim() : '';
  if (!message) {
    return {
      ok: false,
      response: jsonError(400, 'invalid_message', 'Message required')
    };
  }
  if (message.length > MAX_THREAD_MESSAGE_CHARACTERS) {
    return { ok: false, response: tooLargeResponse() };
  }

  return {
    ok: true,
    message,
    body: {
      message,
      ...(record.context !== undefined ? { context: record.context } : {})
    }
  };
}
