import type { Env } from './env';
import { releaseWorkersAiCapacity, reserveWorkersAiCapacity } from './ai/free-tier-capacity';

export const D1_BOOKMARK_HEADER = 'x-d1-bookmark';
const MAX_D1_BOOKMARK_LENGTH = 1_024;
const CONTROL_CHARACTER = /[\u0000-\u001F\u007F]/;

export function createD1RequestSession(request: Request, db: D1Database): D1DatabaseSession | undefined {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return undefined;
  if (typeof db.withSession !== 'function') return undefined;

  const bookmark = readD1Bookmark(request) ?? 'first-primary';
  return db.withSession(bookmark);
}

export function withD1SessionEnv(env: Env, session: D1DatabaseSession): Env {
  const override: Partial<Env> = { DB: session as unknown as D1Database };
  if (env.AI) {
    const source = env.AI;
    const wrapped: NonNullable<Env['AI']> = {
      async run(model, input, options) {
        const normalizedInput = normalizeWorkersAiInput(model, input);
        const reservation = await reserveWorkersAiCapacity(session, model, normalizedInput);
        try {
          const result = await source.run(
            model,
            normalizedInput,
            normalizeGatewayOptions(options)
          );
          return normalizeWorkersAiOutput(model, result);
        } catch (error) {
          await releaseWorkersAiCapacity(session, reservation).catch((releaseError) => {
            console.error('workers_ai_capacity_release_failed', {
              error: releaseError instanceof Error ? releaseError.name : 'unknown'
            });
          });
          throw error;
        }
      }
    };
    if (source.aiGatewayLogId) wrapped.aiGatewayLogId = source.aiGatewayLogId;
    override.AI = wrapped;
  }
  return Object.assign(Object.create(env) as Env, override) as Env;
}

export function normalizeWorkersAiInput(model: string, input: unknown): unknown {
  if (!model.startsWith('@cf/')) return input;
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { prompt: String(input ?? '') };

  const source = input as Record<string, unknown>;
  const prompt = typeof source.input === 'string'
    ? source.input
    : typeof source.prompt === 'string'
      ? source.prompt
      : undefined;
  if (!prompt) return input;

  const output: Record<string, unknown> = { ...source };
  delete output.input;
  delete output.max_output_tokens;
  output.messages = [{ role: 'user', content: prompt }];
  if (typeof source.max_output_tokens === 'number') output.max_completion_tokens = source.max_output_tokens;
  if (!output.response_format) output.response_format = { type: 'json_object' };
  if (output.temperature === undefined) output.temperature = 0.2;
  return output;
}

export function normalizeWorkersAiOutput(model: string, result: unknown): unknown {
  if (!model.startsWith('@cf/') || result instanceof Response || result instanceof ReadableStream) return result;
  if (result && typeof result === 'object' && typeof (result as Record<string, unknown>).output_text === 'string') return result;
  const text = extractAiOutputText(result);
  return text === undefined ? result : { output_text: text };
}

function extractAiOutputText(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const parts = value.map(extractAiOutputText).filter((part): part is string => part !== undefined);
    return parts.length ? parts.join('') : undefined;
  }
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  for (const key of ['output_text', 'text', 'content']) {
    if (typeof record[key] === 'string') return record[key] as string;
  }
  for (const key of ['message', 'delta', 'response', 'result', 'output', 'choices']) {
    const text = extractAiOutputText(record[key]);
    if (text !== undefined) return text;
  }
  return undefined;
}

export function normalizeGatewayOptions(options: unknown): unknown {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return { gateway: { skipCache: true, collectLog: false } };
  }
  const source = options as Record<string, unknown>;
  const existingGateway = source.gateway && typeof source.gateway === 'object' && !Array.isArray(source.gateway)
    ? source.gateway as Record<string, unknown>
    : {};
  return {
    ...source,
    gateway: {
      ...existingGateway,
      skipCache: true,
      collectLog: false
    }
  };
}

export function attachD1Bookmark(response: Response, session?: D1DatabaseSession): Response {
  let bookmark: string | null | undefined;
  try { bookmark = session?.getBookmark(); } catch { return response; }
  if (!bookmark) return response;

  const headers = new Headers(response.headers);
  headers.set(D1_BOOKMARK_HEADER, bookmark);
  headers.delete('content-length');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function readD1Bookmark(request: Request): string | undefined {
  return normalizeD1Bookmark(request.headers.get(D1_BOOKMARK_HEADER));
}

export function normalizeD1Bookmark(value: string | null | undefined): string | undefined {
  const bookmark = value?.trim();
  if (!bookmark || bookmark.length > MAX_D1_BOOKMARK_LENGTH || CONTROL_CHARACTER.test(bookmark)) return undefined;
  return bookmark;
}
