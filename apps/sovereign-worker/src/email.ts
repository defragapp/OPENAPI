import type { Env } from './env';
import { runtimeMode } from './runtime';

export interface EmailMessage { to: string; subject: string; text: string; html?: string; idempotencyKey?: string }

const FROM = 'Sovereign.OS <info@defrag.app>';
const REPLY_TO = 'info@defrag.app';

function validRecipient(to: string): boolean { return to.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to); }
function redact(value: string): string { return value.replace(/token=[^\s]+/g, 'token=[redacted]'); }

export async function sendOperationalEmail(env: Env, message: EmailMessage): Promise<{ provider: string; id: string; retryable: boolean }> {
  if (!validRecipient(message.to)) throw new Response('Invalid email recipient', { status: 400 });
  if (runtimeMode(env) === 'test') {
    await env.KV?.put?.(`test-email:${crypto.randomUUID()}`, JSON.stringify({ to: message.to, subject: message.subject, text: message.text }), { expirationTtl: 3600 });
    return { provider: 'test-capture', id: `email_${crypto.randomUUID()}`, retryable: false };
  }

  try {
    if (env.EMAIL) {
      const result = await env.EMAIL.send({
        from: FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html
      });
      return { provider: 'cloudflare-email-binding', id: requestId(result), retryable: false };
    }

    if (env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(8_000),
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json',
          'idempotency-key': message.idempotencyKey ?? crypto.randomUUID()
        },
        body: JSON.stringify({
          from: FROM,
          reply_to: REPLY_TO,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          ...(message.html ? { html: message.html } : {})
        })
      });
      const payload = await response.json().catch(() => ({})) as { id?: string };
      if (!response.ok) throw new Error(`resend_${response.status}`);
      return { provider: 'resend', id: payload.id ?? `email_${crypto.randomUUID()}`, retryable: false };
    }

    throw new Error('provider_missing');
  } catch (error) {
    console.warn('email_delivery_failed', {
      reason: error instanceof Error ? error.message.slice(0, 48) : 'response',
      subject: message.subject,
      toHashOnly: true,
      body: redact(message.text).slice(0, 24)
    });
    throw new Response('Email delivery unavailable', { status: 503 });
  }
}

function requestId(value: unknown): string {
  if (value && typeof value === 'object' && 'messageId' in value && typeof value.messageId === 'string') return value.messageId;
  return `email_${crypto.randomUUID()}`;
}
