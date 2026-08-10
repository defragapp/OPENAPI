import { describe, expect, it } from 'vitest';
import runtime from './runtime-entry';
import type { Env } from './env';

const executionContext = {} as ExecutionContext;
const env = {} as Env;

function assetEnvironment(onRequest: (request: Request) => void): Env {
  return {
    ASSETS: {
      fetch: async (request) => {
        onRequest(request);
        return new Response('<!doctype html><title>Sovereign.OS</title>', {
          headers: { 'content-type': 'text/html; charset=UTF-8' }
        });
      }
    }
  } as Env;
}

describe('public route aliases', () => {
  it('redirects Questions to the canonical public FAQ document', async () => {
    const response = await runtime.fetch(
      new Request('https://sovereign.defrag.app/questions'),
      env,
      executionContext
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://sovereign.defrag.app/faq');
  });

  it('moves the Questions alias off the private application hostname', async () => {
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/questions?from=footer'),
      env,
      executionContext
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://sovereign.defrag.app/faq?from=footer');
  });

  it('keeps clean public support routes off the private application hostname', async () => {
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/pricing'),
      env,
      executionContext
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://sovereign.defrag.app/pricing');
  });
});

describe('navigation asset routing', () => {
  it('redirects unauthenticated private workspace routes before any SPA document is served', async () => {
    let assetUrl = '';
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/app/thread_123?view=detail'),
      assetEnvironment((request) => { assetUrl = request.url; }),
      executionContext
    );

    expect(response.status).toBe(302);
    expect(assetUrl).toBe('');
    const location = new URL(response.headers.get('location')!);
    expect(location.origin).toBe('https://app.defrag.app');
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('returnTo')).toBe('/app/thread_123?view=detail');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('serves public account routes from the React entry document', async () => {
    let assetUrl = '';
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/login?returnTo=%2Fapp'),
      assetEnvironment((request) => { assetUrl = request.url; }),
      executionContext
    );

    expect(response.status).toBe(200);
    expect(assetUrl).toBe('https://app.defrag.app/');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });

  it('serves React policy routes from the entry document', async () => {
    let assetUrl = '';
    await runtime.fetch(
      new Request('https://sovereign.defrag.app/privacy?from=footer'),
      assetEnvironment((request) => { assetUrl = request.url; }),
      executionContext
    );

    expect(assetUrl).toBe('https://sovereign.defrag.app/');
  });

  it('protects the standalone consent manager before its private document is served', async () => {
    let assetUrl = '';
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/consent.html?token=invitation'),
      assetEnvironment((request) => { assetUrl = request.url; }),
      executionContext
    );

    expect(response.status).toBe(302);
    expect(assetUrl).toBe('');
    const location = new URL(response.headers.get('location')!);
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('returnTo')).toBe('/consent.html?token=invitation');
  });

  it('returns a Worker 404 for an unknown Worker-first path', async () => {
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/api/not-a-route'),
      env,
      executionContext
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('preserves Expression Field authentication status through the production runtime boundary', async () => {
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/api/v1/expression-field?mode=live'),
      env,
      executionContext
    );

    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
