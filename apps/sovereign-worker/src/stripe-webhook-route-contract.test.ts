import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const runtime = readFileSync(new URL('./runtime-entry.ts', import.meta.url), 'utf8');

describe('Stripe webhook route compatibility', () => {
  it('accepts the canonical route and every deployed legacy route', () => {
    for (const path of [
      '/api/v1/stripe/webhook',
      '/api/billing/webhook',
      '/api/stripe/webhook',
      '/api/webhooks/stripe',
      '/stripe/webhook',
      '/webhooks/stripe'
    ]) {
      expect(runtime).toContain(`'${path}'`);
    }
  });

  it('forwards every accepted route internally without redirecting or changing the signed body', () => {
    expect(runtime).toContain("request.method === 'POST' && STRIPE_WEBHOOK_PATHS.has(url.pathname)");
    expect(runtime).toContain("target.pathname = '/api/v1/stripe/webhook'");
    expect(runtime).toContain('headers: request.headers');
    expect(runtime).toContain('body: request.body');
    expect(runtime).toContain('return worker.fetch(forwarded, env, executionContext)');
  });

  it('publishes the accepted paths in health metadata for release verification', () => {
    expect(runtime).toContain('stripeWebhookPaths: [...STRIPE_WEBHOOK_PATHS]');
  });
});
