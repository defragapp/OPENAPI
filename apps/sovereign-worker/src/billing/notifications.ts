import type { Env } from '../env';
import { buildSovereignEmail, sendOperationalEmail } from '../email';
import type { BillingInterval, PlanKey } from './stripe';

export type BillingNotificationKind =
  | 'activated'
  | 'cancellation_scheduled'
  | 'payment_attention'
  | 'returned_to_free';

export interface BillingNotificationInput {
  eventId: string;
  accountId: string;
  kind: BillingNotificationKind;
  interval?: BillingInterval | undefined;
  currentPeriodEnd?: string | undefined;
  status: string;
  effectivePlan: PlanKey;
}

const DEFAULT_APP_URL = 'https://app.defrag.app';

function emailFromAuthSubject(subject?: string | null): string | undefined {
  if (!subject?.startsWith('email:')) return undefined;
  const email = subject.slice('email:'.length).trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function billingUrl(env: Env): string {
  const url = new URL('/app', env.PUBLIC_APP_URL || DEFAULT_APP_URL);
  url.searchParams.set('panel', 'account');
  return url.toString();
}

function formattedDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

export async function notifyBillingLifecycle(env: Env, input: BillingNotificationInput): Promise<boolean> {
  try {
    const account = await env.DB.prepare('SELECT auth_subject FROM accounts WHERE id = ?')
      .bind(input.accountId)
      .first<{ auth_subject: string }>();
    const recipient = emailFromAuthSubject(account?.auth_subject);
    if (!recipient) return false;

    const periodEnd = formattedDate(input.currentPeriodEnd);
    const template = billingTemplate(env, input, periodEnd);
    await sendOperationalEmail(env, {
      to: recipient,
      subject: template.subject,
      text: template.text,
      html: template.html,
      idempotencyKey: `billing:${input.eventId}:${input.kind}`,
      category: 'operational'
    });
    return true;
  } catch (error) {
    console.warn('billing_notification_failed', {
      eventId: input.eventId,
      kind: input.kind,
      status: input.status,
      reason: error instanceof Error ? error.name : 'response'
    });
    return false;
  }
}

function billingTemplate(env: Env, input: BillingNotificationInput, periodEnd?: string) {
  const actionUrl = billingUrl(env);
  const cadence = input.interval === 'annual' ? 'annual' : input.interval === 'monthly' ? 'monthly' : undefined;

  if (input.kind === 'activated') {
    return {
      subject: 'Sovereign+ is active',
      ...buildSovereignEmail({
        eyebrow: 'Sovereign+ verified',
        title: 'Your expanded access is active.',
        intro: 'Stripe confirmed the subscription through a signed event. People, Systems, Library continuity, and the optional Covenant lens are now available according to your permissions.',
        actionLabel: 'Open Sovereign.OS',
        actionUrl,
        details: [
          cadence ? `Billing cadence: ${cadence}.` : 'Your current billing cadence is available in Billing controls.',
          'Access is controlled by the server-side Stripe entitlement, not by the checkout return page.',
          'You can manage payment details and subscription changes through the secure Stripe billing portal.'
        ],
        footer: 'Your Baseline remains yours regardless of plan. Sovereign+ changes capability access, not your personal foundation.'
      })
    };
  }

  if (input.kind === 'cancellation_scheduled') {
    return {
      subject: 'Sovereign+ cancellation scheduled',
      ...buildSovereignEmail({
        eyebrow: 'Billing update',
        title: 'Your Sovereign+ cancellation is scheduled.',
        intro: 'Stripe confirmed that the subscription will not renew. Paid capabilities remain available through the current billing period.',
        actionLabel: 'Review billing controls',
        actionUrl,
        details: [
          periodEnd ? `Sovereign+ remains active through ${periodEnd}.` : 'The effective cancellation date is available in the Stripe billing portal.',
          'Your private Baseline and Free access remain available after the paid period ends.',
          'You can reverse a scheduled cancellation through the Stripe billing portal when Stripe permits it.'
        ],
        footer: 'Saved information remains governed by the account retention and deletion controls you choose.'
      })
    };
  }

  if (input.kind === 'payment_attention') {
    return {
      subject: 'Sovereign+ billing needs attention',
      ...buildSovereignEmail({
        eyebrow: 'Payment attention',
        title: 'Your Sovereign+ billing needs attention.',
        intro: 'Stripe reported a subscription status that may limit paid capabilities. Update the payment method or review the subscription in the secure billing portal.',
        actionLabel: 'Open billing controls',
        actionUrl,
        details: [
          `Stripe subscription status: ${input.status.replaceAll('_', ' ')}.`,
          'Sovereign.OS does not collect or store card details.',
          'Free Baseline access remains available while billing is resolved.'
        ],
        footer: 'Paid access is restored only after Stripe confirms an eligible subscription state.'
      })
    };
  }

  return {
    subject: 'Your Sovereign.OS account is now on Free',
    ...buildSovereignEmail({
      eyebrow: 'Plan update',
      title: 'Your account has returned to Free.',
      intro: 'Stripe confirmed that Sovereign+ is no longer active. Your private Baseline, Today, Explore, and Free monthly allowance remain available.',
      actionLabel: 'Continue with Free',
      actionUrl,
      details: [
        'People, Systems, Library continuity, and Covenant access follow the current Free entitlement.',
        'Your account and Baseline were not deleted.',
        'You can choose Sovereign+ again from Billing controls.'
      ],
      footer: 'Plan changes never transfer another person’s permissions or expose private Baseline information.'
    })
  };
}
