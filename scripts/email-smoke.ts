import type { Env } from '../apps/sovereign-worker/src/env';
import { buildSovereignEmail, sendOperationalEmail } from '../apps/sovereign-worker/src/email';

const apiKey = String(process.env.RESEND_API_KEY || '').trim();
const appVersion = String(process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA || process.env.APP_VERSION || 'manual').trim();
const releaseLabel = appVersion.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 18) || 'manual';
const defaultRecipient = `delivered+sovereign-${releaseLabel}@resend.dev`;
const recipient = String(process.env.EMAIL_SMOKE_TEST_RECIPIENT || defaultRecipient).trim().toLowerCase();
const fromAddress = String(process.env.TRANSACTIONAL_FROM_EMAIL || 'info@sovereign.defrag.app').trim().toLowerCase();
const contactAddress = String(process.env.PUBLIC_CONTACT_EMAIL || 'info@sovereign.defrag.app').trim().toLowerCase();
const deliveryTimeoutMs = Math.max(15_000, Number(process.env.EMAIL_SMOKE_TIMEOUT_MS || 120_000));

if (!apiKey) throw new Error('RESEND_API_KEY is required for the live email smoke test.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error('EMAIL_SMOKE_TEST_RECIPIENT must be a valid email address.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromAddress)) throw new Error('TRANSACTIONAL_FROM_EMAIL must be a valid email address.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactAddress)) throw new Error('PUBLIC_CONTACT_EMAIL must be a valid email address.');

const template = buildSovereignEmail({
  eyebrow: 'Delivery verification',
  title: 'Sovereign.OS email is configured.',
  intro: 'This operational test confirms that the production Resend integration can deliver the same branded template used for account access and permission invitations.',
  actionLabel: 'Open Sovereign.OS',
  actionUrl: 'https://app.defrag.app/login',
  details: [
    `Release: ${appVersion.slice(0, 40)}`,
    'Sender authentication must match the verified Resend domain.',
    'Reply handling uses the public Sovereign.OS contact address.'
  ],
  footer: 'No account action is required. This message was generated only to verify transactional email delivery.',
  contactEmail: contactAddress
});

const env = {
  APP_ENV: 'production',
  APP_VERSION: appVersion,
  RESEND_API_KEY: apiKey,
  TRANSACTIONAL_FROM_EMAIL: fromAddress,
  PUBLIC_CONTACT_EMAIL: contactAddress
} as unknown as Env;

async function main(): Promise<void> {
  const result = await sendOperationalEmail(env, {
    to: recipient,
    subject: `Sovereign.OS email delivery verified · ${appVersion.slice(0, 7)}`,
    ...template,
    idempotencyKey: `sovereign-email-smoke-${releaseLabel}`,
    category: 'operational'
  });

  const delivery = await waitForDelivery(result.id, deliveryTimeoutMs);

  console.log(JSON.stringify({
    ok: delivery.lastEvent === 'delivered',
    provider: result.provider,
    providerMessageId: result.id,
    lastEvent: delivery.lastEvent,
    recipientDomain: recipient.split('@')[1],
    fromDomain: fromAddress.split('@')[1],
    version: appVersion
  }, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Email smoke failed: ${message}`);
  process.exit(1);
});

async function waitForDelivery(emailId: string, timeoutMs: number): Promise<{ lastEvent: string }> {
  const deadline = Date.now() + timeoutMs;
  const failureEvents = new Set(['bounced', 'failed', 'suppressed', 'canceled']);
  let lastEvent = 'sent';

  while (Date.now() < deadline) {
    const response = await fetch(`https://api.resend.com/emails/${encodeURIComponent(emailId)}`, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8_000)
    });
    const payload = await response.json().catch(() => ({})) as { last_event?: string; message?: string };
    if (!response.ok) throw new Error(`resend_status_${response.status}_${String(payload.message ?? 'request_failed').slice(0, 48)}`);
    lastEvent = String(payload.last_event || 'sent');
    if (lastEvent === 'delivered' || lastEvent === 'opened' || lastEvent === 'clicked' || lastEvent === 'complained') return { lastEvent: 'delivered' };
    if (failureEvents.has(lastEvent)) throw new Error(`resend_delivery_${lastEvent}`);
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }

  throw new Error(`resend_delivery_timeout_last_event_${lastEvent}`);
}
