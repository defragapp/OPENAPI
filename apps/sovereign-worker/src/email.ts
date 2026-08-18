import type { Env } from './env';
import { runtimeMode } from './runtime';

export type EmailCategory =
  | 'account_signup'
  | 'account_signin'
  | 'account_security'
  | 'relationship_invitation'
  | 'relationship_invitation_resend'
  | 'consent_update'
  | 'operational';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  idempotencyKey?: string;
  category?: EmailCategory;
}

export interface SovereignEmailTemplate {
  eyebrow: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  details?: string[];
  footer?: string;
  preheader?: string;
  contactEmail?: string;
}

const DEFAULT_FROM_ADDRESS = 'info@defrag.app';
const DEFAULT_PUBLIC_CONTACT = 'info@defrag.app';
const BRAND_MARK_URL = 'https://sovereign.defrag.app/brand-mark.svg';
const EMAIL_DISPLAY_FONT = "Optima,'Helvetica Neue',Arial,sans-serif";
const EMAIL_BODY_FONT = "-apple-system,BlinkMacSystemFont,'Helvetica Neue','Segoe UI',Arial,sans-serif";

function validRecipient(to: string): boolean { return to.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to); }
function validAddress(value?: string): value is string { return Boolean(value && validRecipient(value.trim())); }
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

function fromAddress(env: Env): string {
  return validAddress(env.TRANSACTIONAL_FROM_EMAIL) ? env.TRANSACTIONAL_FROM_EMAIL.trim() : DEFAULT_FROM_ADDRESS;
}

function contactAddress(env: Env): string {
  return validAddress(env.PUBLIC_CONTACT_EMAIL) ? env.PUBLIC_CONTACT_EMAIL.trim() : DEFAULT_PUBLIC_CONTACT;
}

function safeTag(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'operational';
}

export function transactionalEmailProvider(env: Env): 'resend' | 'cloudflare-binding' | 'missing' {
  if (env.RESEND_API_KEY) return 'resend';
  if (env.EMAIL) return 'cloudflare-binding';
  return 'missing';
}

export function buildSovereignEmail(template: SovereignEmailTemplate): { text: string; html: string } {
  const actionUrl = safeActionUrl(template.actionUrl);
  const details = (template.details ?? []).map((detail) => detail.trim()).filter(Boolean).slice(0, 10);
  const footer = template.footer?.trim() || 'You control what enters Sovereign.OS and what may be shared.';
  const support = validAddress(template.contactEmail) ? template.contactEmail.trim() : DEFAULT_PUBLIC_CONTACT;
  const preheader = template.preheader?.trim() || template.intro.trim();
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
    `Questions or account support: ${support}`,
    '',
    'This is a private account message. Do not forward it.'
  ].filter((line): line is string => typeof line === 'string').join('\n');

  const detailRows = details.map((detail) => `
    <tr>
      <td style="padding:0 0 11px;color:#a39c8f;font:400 14px/1.65 ${EMAIL_BODY_FONT};">
        <span style="color:#e8ddd0;padding-right:9px;">✓</span>${escapeHtml(detail)}
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
<body style="margin:0;padding:0;background:#0f0f0f;color:#f5f1e8;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#0f0f0f;background-image:radial-gradient(circle at 50% 0%,rgba(232,221,208,.055),transparent 560px);">
    <tr>
      <td align="center" style="padding:42px 16px 50px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;">
          <tr>
            <td style="padding:0 4px 22px;border-bottom:1px solid rgba(245,241,232,.11);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="40" valign="middle">
                    <img src="${BRAND_MARK_URL}" width="40" height="40" alt="" style="display:block;width:40px;height:40px;border:1px solid rgba(245,241,232,.16);border-radius:50%;">
                  </td>
                  <td style="padding-left:13px;color:#f5f1e8;font:600 17px/1 ${EMAIL_DISPLAY_FONT};letter-spacing:.8px;">SOVEREIGN.OS</td>
                  <td align="right" style="color:#746f67;font:650 10px/1.2 ${EMAIL_BODY_FONT};letter-spacing:1.6px;text-transform:uppercase;">Private account message</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:48px 40px 42px;border:1px solid rgba(245,241,232,.11);border-top:0;border-radius:0 0 18px 18px;background:#151515;background-image:linear-gradient(180deg,rgba(255,255,255,.018),transparent 28%);box-shadow:0 30px 80px rgba(0,0,0,.45);">
              <p style="margin:0 0 15px;color:#e8ddd0;font:700 10px/1.4 ${EMAIL_BODY_FONT};letter-spacing:2px;text-transform:uppercase;">${escapeHtml(template.eyebrow)}</p>
              <h1 style="margin:0;max-width:520px;color:#f5f1e8;font:600 44px/1.04 ${EMAIL_DISPLAY_FONT};letter-spacing:-1.5px;">${escapeHtml(template.title)}</h1>
              <p style="margin:22px 0 0;max-width:520px;color:#a39c8f;font:400 16px/1.75 ${EMAIL_BODY_FONT};">${escapeHtml(template.intro)}</p>
              ${details.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;padding-top:22px;border-top:1px solid rgba(245,241,232,.09);">${detailRows}</table>` : ''}
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:32px;">
                <tr>
                  <td align="center" style="border:1px solid rgba(232,221,208,.86);border-radius:2px;background:#e8ddd0;box-shadow:0 12px 28px rgba(0,0,0,.22);">
                    <a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:14px 20px;color:#141412;font:700 13px/1.2 ${EMAIL_BODY_FONT};letter-spacing:.2px;text-decoration:none;border-radius:2px;">${escapeHtml(template.actionLabel)} &nbsp;→</a>
                  </td>
                </tr>
              </table>
              <p style="margin:27px 0 0;color:#746f67;font:400 11px/1.65 ${EMAIL_BODY_FONT};word-break:break-all;">Button not working? Open this private link:<br><a href="${escapeHtml(actionUrl)}" style="color:#a39c8f;text-decoration:underline;">${escapeHtml(actionUrl)}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:25px 8px 0;color:#746f67;font:400 12px/1.7 ${EMAIL_BODY_FONT};">
              <p style="margin:0;color:#a39c8f;">${escapeHtml(footer)}</p>
              <p style="margin:10px 0 0;">Questions or account support? Reply or contact <a href="mailto:${escapeHtml(support)}" style="color:#e8ddd0;">${escapeHtml(support)}</a>.</p>
              <p style="margin:10px 0 0;">This is a private account message. Do not forward it.</p>
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
    await env.KV?.put?.(`test-email:${crypto.randomUUID()}`, JSON.stringify({ to: message.to, subject: message.subject, text: message.text, html: message.html, category: message.category }), { expirationTtl: 3600 });
    return { provider: 'test-capture', id: `email_${crypto.randomUUID()}`, retryable: false };
  }

  const from = `Sovereign.OS <${fromAddress(env)}>`;
  const replyTo = contactAddress(env);

  try {
    if (env.RESEND_API_KEY) {
      const category = safeTag(message.category ?? 'operational');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(8_000),
        headers: {
          authorization: `Bearer ${env.RESEND_API_KEY}`,
          'content-type': 'application/json',
          'idempotency-key': message.idempotencyKey ?? crypto.randomUUID()
        },
        body: JSON.stringify({
          from,
          reply_to: replyTo,
          to: [message.to],
          subject: message.subject,
          text: message.text,
          ...(message.html ? { html: message.html } : {}),
          tags: [
            { name: 'product', value: 'sovereign-os' },
            { name: 'category', value: category },
            { name: 'environment', value: safeTag(env.APP_ENV || 'production') }
          ]
        })
      });
      const payload = await response.json().catch(() => ({})) as { id?: string; message?: string };
      if (!response.ok) throw new Error(`resend_${response.status}_${String(payload.message ?? 'request_failed').slice(0, 48)}`);
      return { provider: 'resend', id: payload.id ?? `email_${crypto.randomUUID()}`, retryable: false };
    }

    if (env.EMAIL) {
      const result = await env.EMAIL.send({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        ...(message.html ? { html: message.html } : {})
      });
      return { provider: 'cloudflare-email-binding', id: requestId(result), retryable: false };
    }

    throw new Error('provider_missing');
  } catch (error) {
    console.warn('email_delivery_failed', {
      provider: transactionalEmailProvider(env),
      reason: error instanceof Error ? error.message.slice(0, 72) : 'response',
      category: message.category ?? 'operational',
      subject: message.subject,
      toHashOnly: true,
      retryable: true,
      redacted: redact(error instanceof Error ? error.message : 'response')
    });
    throw new Response('Email delivery is temporarily unavailable', {
      status: 503,
      headers: { 'retry-after': '60' }
    });
  }
}

function requestId(value: unknown): string {
  if (typeof value === 'string' && value) return value;
  if (value && typeof value === 'object') {
    const id = (value as { id?: unknown }).id;
    if (typeof id === 'string' && id) return id;
  }
  return `email_${crypto.randomUUID()}`;
}
