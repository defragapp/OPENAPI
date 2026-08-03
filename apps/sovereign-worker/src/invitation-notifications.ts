import type { Env } from './env';
import { buildSovereignEmail, sendOperationalEmail } from './email';
import type { ConsentScope } from './db/people';

export type InvitationNotificationKind =
  | 'accepted'
  | 'permission_granted'
  | 'permission_revoked'
  | 'expired';

export interface InvitationNotificationInput {
  invitationId: string;
  kind: InvitationNotificationKind;
  scope?: ConsentScope | undefined;
  decisionVersion?: number | undefined;
}

type InvitationNotificationContext = {
  account_id: string;
  invited_email_normalized: string | null;
  display_name: string | null;
  owner_subject: string | null;
};

const DEFAULT_APP_URL = 'https://app.defrag.app';

const scopeLabels: Record<ConsentScope, string> = {
  'pair.compare': 'relationship comparison',
  'system.include': 'system inclusion',
  'trait.display': 'shared Baseline themes',
  'framework.display': 'supporting framework detail',
  'current_conditions.use': 'temporary current conditions',
  'library.link': 'linked saved understanding',
  'covenant.include': 'optional Covenant context'
};

function emailFromAuthSubject(subject?: string | null): string | undefined {
  if (!subject?.startsWith('email:')) return undefined;
  const email = subject.slice('email:'.length).trim().toLowerCase();
  return validEmail(email) ? email : undefined;
}

function validEmail(value?: string | null): value is string {
  return Boolean(value && value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

function accountControlsUrl(env: Env): string {
  const url = new URL('/app', env.PUBLIC_APP_URL || DEFAULT_APP_URL);
  url.searchParams.set('panel', 'people');
  return url.toString();
}

export async function notifyInvitationLifecycle(env: Env, input: InvitationNotificationInput): Promise<boolean> {
  try {
    const context = await env.DB.prepare(`SELECT i.account_id, i.invited_email_normalized, p.display_name, a.auth_subject AS owner_subject
      FROM invitations i
      JOIN persons p ON p.id = i.invited_person_id
      JOIN accounts a ON a.id = i.account_id
      WHERE i.id = ?`)
      .bind(input.invitationId)
      .first<InvitationNotificationContext>();
    if (!context) return false;

    const ownerEmail = emailFromAuthSubject(context.owner_subject);
    const inviteeEmail = validEmail(context.invited_email_normalized) ? context.invited_email_normalized : undefined;
    const displayName = context.display_name?.trim() || 'this private connection';
    const actionUrl = accountControlsUrl(env);
    const template = lifecycleTemplate(input, displayName, actionUrl);
    const versionKey = input.decisionVersion ? `:v${input.decisionVersion}` : '';
    const deliveries: Promise<unknown>[] = [];

    if (ownerEmail) {
      deliveries.push(sendOperationalEmail(env, {
        to: ownerEmail,
        subject: template.ownerSubject,
        text: template.owner.text,
        html: template.owner.html,
        idempotencyKey: `invitation:${input.invitationId}:${input.kind}${versionKey}:owner`,
        category: 'consent_update'
      }));
    }
    if (inviteeEmail) {
      deliveries.push(sendOperationalEmail(env, {
        to: inviteeEmail,
        subject: template.inviteeSubject,
        text: template.invitee.text,
        html: template.invitee.html,
        idempotencyKey: `invitation:${input.invitationId}:${input.kind}${versionKey}:invitee`,
        category: 'consent_update'
      }));
    }

    if (deliveries.length === 0) return false;
    await Promise.all(deliveries);
    return true;
  } catch (error) {
    console.warn('invitation_notification_failed', {
      invitationId: input.invitationId,
      kind: input.kind,
      scope: input.scope,
      reason: error instanceof Error ? error.name : 'response'
    });
    return false;
  }
}

function lifecycleTemplate(input: InvitationNotificationInput, displayName: string, actionUrl: string) {
  if (input.kind === 'accepted') {
    return {
      ownerSubject: 'A Sovereign.OS invitation was accepted',
      inviteeSubject: 'Your Sovereign.OS invitation was accepted',
      owner: buildSovereignEmail({
        eyebrow: 'Private connection update',
        title: 'The invitation was accepted.',
        intro: `${displayName} is now connected to a verified Sovereign.OS account. No requested use is active until that person makes a separate consent decision for it.`,
        actionLabel: 'Review People',
        actionUrl,
        details: [
          'Acceptance verifies the account connection; it does not grant blanket access.',
          'Each requested use remains independently allowed or denied by the invited person.',
          'No raw birth input, exact private location, or private notes are included in this email.'
        ],
        footer: 'Consent can be changed or revoked later from the invited person’s own controls.'
      }),
      invitee: buildSovereignEmail({
        eyebrow: 'Private connection update',
        title: 'Your invitation was accepted.',
        intro: 'The account connection is verified. You still decide each requested use separately before any shared context becomes available.',
        actionLabel: 'Review your permissions',
        actionUrl,
        details: [
          'Acceptance does not grant blanket access.',
          'Each permission can be allowed, denied, or revoked independently.',
          'No private Baseline interpretation is included in this email.'
        ],
        footer: 'Understanding another person never requires surrendering control of your own information.'
      })
    };
  }

  if (input.kind === 'expired') {
    return {
      ownerSubject: 'A Sovereign.OS invitation expired',
      inviteeSubject: 'Your Sovereign.OS invitation expired',
      owner: buildSovereignEmail({
        eyebrow: 'Invitation expired',
        title: 'The private invitation expired.',
        intro: `The invitation for ${displayName} was not accepted before its expiration time. No permission was granted.`,
        actionLabel: 'Review People',
        actionUrl,
        details: [
          'The expired invitation link can no longer be used.',
          'No account was connected through this invitation.',
          'Create a new invitation only when both people are ready to review it.'
        ],
        footer: 'Expired invitations do not expose either person’s private Baseline information.'
      }),
      invitee: buildSovereignEmail({
        eyebrow: 'Invitation expired',
        title: 'This private invitation expired.',
        intro: 'The invitation link can no longer be used, and no permission was granted.',
        actionLabel: 'Open Sovereign.OS',
        actionUrl,
        details: [
          'Nothing was shared through the expired invitation.',
          'Ask the sender for a new invitation only when you want to review it.',
          'A new invitation will still require separate decisions for every requested use.'
        ],
        footer: 'Sovereign.OS does not treat silence or an expired link as consent.'
      })
    };
  }

  const scope = input.scope ? scopeLabels[input.scope] : 'requested use';
  const granted = input.kind === 'permission_granted';
  return {
    ownerSubject: `Sovereign.OS permission ${granted ? 'allowed' : 'revoked'}`,
    inviteeSubject: `Your Sovereign.OS permission was ${granted ? 'saved' : 'revoked'}`,
    owner: buildSovereignEmail({
      eyebrow: 'Permission update',
      title: granted ? 'A requested use was allowed.' : 'A permission was revoked.',
      intro: `${displayName} ${granted ? 'allowed' : 'revoked'} ${scope}. The server now applies that decision to the shared connection.`,
      actionLabel: 'Review People',
      actionUrl,
      details: [
        `Permission: ${scope}.`,
        granted ? 'Only the approved scope is available; other requested uses remain separate.' : 'The revoked scope is no longer available for new shared context.',
        'No private Baseline interpretation or exact source data is included in this email.'
      ],
      footer: 'The invited person remains in control of this permission and can change it again later.'
    }),
    invitee: buildSovereignEmail({
      eyebrow: 'Your permission update',
      title: granted ? 'Your permission was saved.' : 'Your permission was revoked.',
      intro: `Your decision for ${scope} is now recorded.`,
      actionLabel: 'Review your permissions',
      actionUrl,
      details: [
        `Permission: ${scope}.`,
        granted ? 'Only this approved use is available to the shared connection.' : 'This use is no longer available for new shared context.',
        'You can change the decision again from your own Sovereign.OS controls.'
      ],
      footer: 'Sovereign.OS records consent by scope rather than treating a relationship as blanket permission.'
    })
  };
}
