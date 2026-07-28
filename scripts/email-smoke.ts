import type { Env } from '../apps/sovereign-worker/src/env';
import { buildSovereignEmail, sendOperationalEmail } from '../apps/sovereign-worker/src/email';

const apiKey = String(process.env.RESEND_API_KEY || '').trim();
const recipient = String(process.env.EMAIL_SMOKE_TEST_RECIPIENT || 'info@defrag.app').trim().toLowerCase();
const fromAddress = String(process.env.TRANSACTIONAL_FROM_EMAIL || 'info@defrag.app').trim().toLowerCase();
const contactAddress = String(process.env.PUBLIC_CONTACT_EMAIL || 'info@defrag.app').trim().toLowerCase();
const appVersion = String(process.env.GITHUB_SHA || process.env.WORKERS_CI_COMMIT_SHA || process.env.APP_VERSION || 'manual').trim();

if (!apiKey) throw new Error('RESEND_API_KEY is required for the live email smoke test.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) throw new Error('EMAIL_SMOKE_TEST_RECIPIENT must be a valid email address.');

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

const result = await sendOperationalEmail(env, {
  to: recipient,
  subject: `Sovereign.OS email delivery verified · ${appVersion.slice(0, 7)}`,
  ...template,
  idempotencyKey: `sovereign-email-smoke-${appVersion}`,
  category: 'operational'
});

console.log(JSON.stringify({
  ok: true,
  provider: result.provider,
  providerMessageId: result.id,
  recipientDomain: recipient.split('@')[1],
  fromDomain: fromAddress.split('@')[1],
  version: appVersion
}, null, 2));
