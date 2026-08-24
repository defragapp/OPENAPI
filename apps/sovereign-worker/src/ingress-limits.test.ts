import { describe, expect, it } from 'vitest';
import { AI_MESSAGE_CONTENT_LIMIT, AI_MESSAGE_JSON_BODY_LIMIT, enforceIngressLimits, GENERAL_API_BODY_LIMIT, STRIPE_WEBHOOK_BODY_LIMIT } from './entry';

describe('public ingress limits', () => {
  it.each([[GENERAL_API_BODY_LIMIT + 1, '/api/v1/people'], [AI_MESSAGE_JSON_BODY_LIMIT + 1, '/api/v1/threads/t/messages'], [STRIPE_WEBHOOK_BODY_LIMIT + 1, '/api/v1/stripe/webhook']] as const)('rejects %i bytes before routing', async (size, path) => {
    const result = await enforceIngressLimits(new Request(`https://app.test${path}`, { method: 'POST', body: new Uint8Array(size) }), path);
    expect(result).toBeInstanceOf(Response); expect((result as Response).status).toBe(413);
  });
  it('limits normalized message content', async () => {
    const body = JSON.stringify({ message: 'x'.repeat(AI_MESSAGE_CONTENT_LIMIT + 1) });
    const result = await enforceIngressLimits(new Request('https://app.test/api/v1/threads/t/messages', { method: 'POST', body }), '/api/v1/threads/t/messages');
    expect((result as Response).status).toBe(413);
  });
  it('preserves exact Stripe raw UTF-8 bytes before signature verification', async () => {
    const raw = '{ "emoji": "🔥", "amount":  100 }\n';
    const result = await enforceIngressLimits(new Request('https://app.test/api/v1/stripe/webhook', { method: 'POST', body: raw }), '/api/v1/stripe/webhook');
    expect(result).toBeInstanceOf(Request); expect(await (result as Request).text()).toBe(raw);
  });
  it('uses declared length to reject without consuming the request body', async () => {
    const request = new Request('https://app.test/api/v1/people', { method: 'POST', headers: { 'content-length': String(GENERAL_API_BODY_LIMIT + 1) }, body: '{}' });
    const result = await enforceIngressLimits(request, '/api/v1/people');
    expect((result as Response).status).toBe(413);
    await expect(request.text()).resolves.toBe('{}');
  });
});
