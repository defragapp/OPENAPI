import type { Env } from './env';
import { buildSovereignEmail, sendOperationalEmail } from './email';

export type AccountDeletionNoticeState = 'scheduled' | 'cancelled';

interface AccountDeletionNoticeInput {
  jobId: string;
  state: AccountDeletionNoticeState;
  graceDays?: number;
}

const DEFAULT_APP_URL = 'https://app.defrag.app';
const DEFAULT_GRACE_DAYS = 14;

function emailFromAuthSubject(subject?: string | null): string | undefined {
  if (!subject?.startsWith('email:')) return undefined;
  const email = subject.slice('email:'.length).trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function accountActionUrl(env: Env): string {
  const url = new URL('/app', env.PUBLIC_APP_URL || DEFAULT_APP_URL);
  url.searchParams.set('panel', 'account');
  return url.toString();
}

export async function notifyAccountDeletionChange(
  env: Env,
  accountId: string,
  input: AccountDeletionNoticeInput
): Promise<boolean> {
  try {
    const account = await env.DB.prepare('SELECT auth_subject FROM accounts WHERE id = ?')
      .bind(accountId)
      .first<{ auth_subject: string }>();
    const recipient = emailFromAuthSubject(account?.auth_subject);
    if (!recipient) return false;

    const scheduled = input.state === 'scheduled';
    const graceDays = Number.isInteger(input.graceDays) && Number(input.graceDays) > 0
      ? Number(input.graceDays)
      : DEFAULT_GRACE_DAYS;
    const template = buildSovereignEmail({
      eyebrow: 'Account control',
      title: scheduled ? 'Account deletion is scheduled.' : 'Account deletion was cancelled.',
      intro: scheduled
        ? 'Your Sovereign.OS account remains available during the grace period. You can cancel deletion before the scheduled date.'
        : 'Your Sovereign.OS account will remain active. The queued deletion job has been cancelled.',
      actionLabel: scheduled ? 'Review or cancel deletion' : 'Return to Account & Library',
      actionUrl: accountActionUrl(env),
      details: scheduled
        ? [
            `Deletion is scheduled after a ${graceDays}-day grace period.`,
            'Any active subscription will be cancelled before account deletion completes.',
            'Cancelling during the grace period keeps your account and saved information in place.'
          ]
        : [
            'No account deletion will run from the cancelled request.',
            'Your current plan and account controls remain available.',
            'You can submit a new deletion request later from Account & Library.'
          ],
      footer: scheduled
        ? 'Account deletion remains under your control during the grace period.'
        : 'Your account remains active unless you submit and approve a new deletion request.'
    });

    await sendOperationalEmail(env, {
      to: recipient,
      subject: scheduled
        ? 'Sovereign.OS account deletion scheduled'
        : 'Sovereign.OS account deletion cancelled',
      ...template,
      idempotencyKey: `account-deletion:${input.jobId}:${input.state}`,
      category: 'operational'
    });
    return true;
  } catch (error) {
    console.warn('account_notification_failed', {
      kind: 'account_deletion',
      state: input.state,
      reason: error instanceof Error ? error.name : 'response'
    });
    return false;
  }
}
