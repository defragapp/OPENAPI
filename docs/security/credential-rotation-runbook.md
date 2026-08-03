# Credential Rotation Runbook

Use this runbook whenever a credential may have appeared in source control, repository metadata, build output, screenshots, chat, logs, or an unapproved third-party system.

## Core rule

Treat the credential as compromised. Removing it from the latest commit does not revoke it or remove prior copies.

Never record a full secret in this runbook, an issue, pull request, commit message, screenshot, or incident report.

## Rotation sequence

For each credential:

1. Identify every legitimate consumer and required permission.
2. Create a replacement with the narrowest workable scope.
3. Store the replacement directly in the provider's protected secret store.
4. Update each legitimate consumer without exposing the value.
5. Verify the affected production workflow.
6. Revoke the former credential.
7. Confirm the former credential no longer authenticates.
8. Record the credential category, rotation date, affected service, verifier, and result without recording the value.

Do not revoke the active credential before its replacement is installed and verified unless active exploitation requires immediate containment.

## Sovereign.OS credential categories

Review and rotate as applicable:

- Cloudflare API tokens and service tokens.
- GitHub personal access tokens, deploy keys, and app credentials.
- Stripe restricted or secret API keys.
- Stripe webhook signing secrets.
- Resend API keys.
- Turnstile secret keys.
- Session, authentication, recovery, and invitation signing secrets.
- Third-party AI-provider credentials, if any.
- Legacy deployment-hook credentials.

Public identifiers such as Stripe price IDs, Cloudflare account IDs, D1 database IDs, and Turnstile site keys are not secrets and should not be rotated without a separate operational reason.

Cloudflare D1 does not normally use a conventional database password. Do not create or document one.

## Required verification

After relevant rotations, verify:

- Public landing and authenticated application availability.
- `/health` and `/ready`.
- Signup, login, passkey, recovery, and Turnstile behavior.
- Transactional email delivery.
- Stripe Checkout and Customer Portal creation.
- Stripe webhook signature rejection and valid event processing.
- Server-side entitlement projection.
- AI inference through the intended Cloudflare path.
- Cloudflare Workers Builds access to the private repository.

## Evidence record

Record only:

- Incident or change identifier.
- Credential category.
- Provider.
- Safe identifier such as a provider-generated key ID or last four characters when necessary.
- Date and operator.
- Consumers updated.
- Verification performed.
- Revocation result.

Do not record the credential value.
