import type { Env } from './env';
import { runtimeMode } from './runtime';

export interface EmailMessage { to: string; subject: string; text: string; html?: string; idempotencyKey?: string }

export interface SovereignEmailTemplate {
  eyebrow: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  details?: string[];
  footer?: string;
}

const FROM = 'Sovereign.OS <info@defrag.app>';
const REPLY_TO = 'info@defrag.app';
const SUPPORT = 'info@defrag.app';

function validRecipient(to: string): boolean { return to.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to); }
function redact(value: string): string { return value.replace(/token=[^\s]+/g, 'token=[redacted]'); }
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character] ?? character);
}

function safeActionUrl(value: string): string {
  if (value.length > 2048) throw new Error('email_action_url_too_long');
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('email_action_url_invalid');
  return url.toString();
}

export function buildSovereignEmail(template: SovereignEmailTemplate): { text: string; html: string } {
  const actionUrl = safeActionUrl(template.actionUrl);
  const details = (template.details ?? []).map((detail) => detail.trim()).filter(Boolean).slice(0, 10);
  const footer = template.footer?.trim() || 'You control what enters your Sovereign.OS workspace and what may be shared.';
  const text = [
    'SOVEREIGN.OS',
    template.eyebrow.trim().toUpperCase(),
    '',
    template.title.trim(),
    '',
    template.intro.trim(),
    '',
    ...details.map((detail) => `• ${detail}`),
    details.length ? '' : undefined,
    `${template.actionLabel.trim()}:`,
    actionUrl,
    '',
    footer,
    `Questions or safety concerns: ${SUPPORT}`,
    '',
    'This message contains a private account link. Do not forward it.'
  ].filter((line): line is string => typeof line === 'string').join('\n');

  const detailRows = details.map((detail) => `
    <tr>
      <td style="padding:0 0 10px 0;color:#c8c0b6;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <span style="color:#d99c6b;padding-right:8px;">•</span>${escapeHtml(detail)}
      </td>
    </tr>`).join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${escapeHtml(template.title)}</title>
</head>
<body style="margin:0;padding:0;background:#0d0d0e;color:#f3efe8;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(template.intro)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#0d0d0e;">
    <tr>
      <td align="center" style="padding:34px 16px 42px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td style="padding:0 0 20px;border-bottom:1px solid rgba(243,239,232,.14);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="38" height="38" align="center" valign="middle" style="width:38px;height:38px;border:1px solid rgba(217,156,107,.45);border-radius:50%;color:#d99c6b;font:500 18px/38px Georgia,serif;">S</td>
                  <td style="padding-left:12px;color:#f3efe8;font:800 12px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:2.1px;">SOVEREIGN.OS</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:42px 36px 38px;border:1px solid rgba(243,239,232,.14);border-top:0;border-radius:0 0 24px 24px;background:#171718;box-shadow:0 28px 80px rgba(0,0,0,.28);">
              <p style="margin:0 0 12px;color:#dea074;font:800 11px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:1.8px;text-transform:uppercase;">${escapeHtml(template.eyebrow)}</p>
              <h1 style="margin:0;color:#f3efe8;font:500 42px/1.02 Georgia,'Times New Roman',serif;letter-spacing:-1.7px;">${escapeHtml(template.title)}</h1>
              <p style="margin:20px 0 0;color:#c8c0b6;font:400 16px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${escapeHtml(template.intro)}</p>
              ${details.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">${detailRows}</table>` : ''}
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px;">
                <tr>
                  <td align="center" style="border-radius:999px;background:#ece5da;">
                    <a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:14px 22px;color:#1b1815;font:800 15px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;text-decoration:none;border-radius:999px;">${escapeHtml(template.actionLabel)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#8f887f;font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;word-break:break-all;">Button not working? Open this private link:<br><a href="${escapeHtml(actionUrl)}" style="color:#c8c0b6;text-decoration:underline;">${escapeHtml(actionUrl)}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 8px 0;color:#817a72;font:400 12px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <p style="margin:0;">${escapeHtml(footer)}</p>
              <p style="margin:10px 0 0;">Questions or safety concerns? Reply to this email or contact <a href="mailto:${SUPPORT}" style="color:#b5afa6;">${SUPPORT}</a>.</p>
              <p style="margin:10px 0 0;">This message contains a private account link. Do not forward it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { text, html };
}

export async function sendOperationalEmail(env: Env, message: EmailMessage): Promise<{ provider: string; id: string; retryable: boolean }> {
  if (!validRecipient(message.to)) throw new Response('Invalid email recipient', { status: 400 });
  if (runtimeMode(env) === 'test') {
    await env.KV?.put?.(`test-email:${crypto.randomUUID()}`, JSON.stringify({ to: message.to, subject: message.subject, text: message.text, html: message.html }), { expirationTtl: 3600 });
    return { provider: 'test-capture', id: `email_${crypto.randomUUID()}`, retryable: false };
  }

  try {
    if (env.EMAIL) {
      const result = await env.EMAIL.send({
        from: FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {})
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
