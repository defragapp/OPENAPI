import { afterEach, describe, expect, it, vi } from 'vitest';
import { getBaselineSummary, resolveExistingIdentity, searchLibrary } from './sovv';
import type { Env } from '../env';

const env = { APP_ENV: 'test', SOVV_INTERNAL_BASE_URL: 'https://sovv.test', SOVV_INTERNAL_AUTH_TOKEN: 'internal' } as Env;

afterEach(() => vi.restoreAllMocks());

describe('SOVV adapter contracts', () => {
  it('maps the verified /api/user/me identity contract without exposing cookie values', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: URL | RequestInfo, init?: RequestInit) => {
      expect(String(url)).toBe('https://sovv.test/api/user/me');
      expect(new Headers(init?.headers).get('cookie')).toBe('__sov_session=session_fixture');
      return Response.json({ id: 'u_123', email: 'person@example.test', tier: 'free', role: 'user' });
    }));
    const result = await resolveExistingIdentity(env, '__sov_session=session_fixture');
    expect(result.data.subject).toBe('sovv:user:u_123');
    expect(JSON.stringify(result)).not.toContain('session_fixture');
  });

  it('uses verified /api/baseline and /api/library shapes with reduced output', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: URL | RequestInfo) => {
      const pathname = new URL(String(url)).pathname;
      if (pathname === '/api/baseline') return Response.json({ baseline: { redacted: true }, datasetStatus: 'ready' });
      if (pathname === '/api/library') return Response.json({ items: [{ id: 'l1', title: 'Saved map', workspace_source: 'DEFRAG' }] });
      return Response.json({}, { status: 404 });
    }));
    const baseline = await getBaselineSummary(env, 'self');
    const library = await searchLibrary(env, 'map');
    expect(baseline.data.status).toBe('ready');
    expect(JSON.stringify(baseline)).not.toMatch(/dob|tob|pob|birth|latitude|longitude/i);
    expect(library.data.items[0]?.workspaceSource).toBe('DEFRAG');
  });
});
