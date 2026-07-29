import { describe, expect, it } from 'vitest';
import runtime from './runtime-entry';
import type { Env } from './env';

const executionContext = {} as ExecutionContext;
const env = {} as Env;

describe('public route aliases', () => {
  it('redirects Questions to the canonical public FAQ document', async () => {
    const response = await runtime.fetch(
      new Request('https://sovereign.defrag.app/questions'),
      env,
      executionContext
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://sovereign.defrag.app/faq.html');
  });

  it('moves the Questions alias off the private application hostname', async () => {
    const response = await runtime.fetch(
      new Request('https://app.defrag.app/questions?from=footer'),
      env,
      executionContext
    );

    expect(response.status).toBe(308);
    expect(response.headers.get('location')).toBe('https://sovereign.defrag.app/faq.html?from=footer');
  });
});
