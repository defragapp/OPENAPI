import type { Env } from './env';

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
  return Object.assign(Object.create(env) as Env, { DB: session }) as Env;
}

export function attachD1Bookmark(response: Response, session?: D1DatabaseSession): Response {
  const bookmark = session?.getBookmark();
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
