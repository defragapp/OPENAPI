import type { Env } from './env';
import { runtimeMode } from './runtime';

export interface EmailMessage { to: string; subject: string; text: string; html?: string; idempotencyKey?: string }
function validRecipient(to: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to); }
function redact(value: string): string { return value.replace(/token=[^\s]+/g, 'token=[redacted]'); }

export async function sendOperationalEmail(env: Env, message: EmailMessage): Promise<{ provider: string; id: string; retryable: boolean }> {
  if (!validRecipient(message.to)) throw new Response('Invalid email recipient', { status: 400 });
  if (runtimeMode(env) === 'test') {
    await env.KV?.put?.(`test-email:${crypto.randomUUID()}`, JSON.stringify({ to: message.to, subject: message.subject, text: message.text }), { expirationTtl: 3600 });
    return { provider: 'test-capture', id: `email_${crypto.randomUUID()}`, retryable: false };
  }
  if (!env.EMAIL_API_URL || !env.EMAIL_API_TOKEN || !env.EMAIL_FROM) throw new Response('Email delivery unavailable', { status: 503 });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(env.EMAIL_TIMEOUT_MS ?? 2500));
  try {
    const response = await fetch(env.EMAIL_API_URL, { method: 'POST', signal: controller.signal, headers: { authorization: `Bearer ${env.EMAIL_API_TOKEN}`, 'content-type': 'application/json', 'idempotency-key': message.idempotencyKey ?? crypto.randomUUID() }, body: JSON.stringify({ from: env.EMAIL_FROM, to: message.to, subject: message.subject, text: message.text, html: message.html }) });
    if (!response.ok) throw new Response('Email delivery unavailable', { status: response.status >= 500 || response.status === 429 ? 503 : 502 });
    return { provider: 'configured-http-email', id: response.headers.get('x-request-id') ?? `email_${crypto.randomUUID()}`, retryable: false };
  } catch (error) {
    console.warn('email_delivery_failed', { reason: error instanceof Error ? error.name : 'response', subject: message.subject, toHashOnly: true, body: redact(message.text).slice(0, 24) });
    throw new Response('Email delivery unavailable', { status: 503 });
  } finally { clearTimeout(timeout); }
}
