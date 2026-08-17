# Credential Management and Rotation Runbook

Status: current credential-replacement/revocation engineering procedure.

Use this runbook when a protected credential must be replaced or revoked, including suspected exposure, provider policy change, scope correction, personnel/access change, or planned credential maintenance.

Never record a full secret in this runbook, an issue, pull request, commit message, screenshot, product log, or incident report.

## Replacement sequence

For each credential:

1. identify every legitimate consumer and required permission;
2. create/recover a valid replacement with the narrowest workable scope;
3. store it directly in the provider’s protected secret/configuration store;
4. update legitimate consumers without exposing the value;
5. verify the affected workflow;
6. revoke the former credential when replacement/containment state permits;
7. confirm the former credential no longer authenticates when revocation is required;
8. record only the credential category, provider-safe identifier, date, operator, consumers updated, and verification result.

Do not revoke an active production credential before a usable replacement is installed/verified unless immediate containment requires it.

## Sovereign.OS credential categories

May include:

- Cloudflare API/member/service credentials;
- GitHub personal/app/deploy credentials;
- Stripe restricted/secret API keys;
- Stripe webhook signing secrets;
- Resend API keys;
- Turnstile secret keys;
- session/auth/recovery/invitation signing material;
- future third-party provider credentials only if a separately approved capability actually uses them;
- legacy deployment credentials pending retirement.

Public identifiers such as Stripe price IDs, Cloudflare account IDs, D1 database IDs, and Turnstile site keys are not secret credentials.

Cloudflare D1 does not normally use a conventional database password. Do not invent or document one.

Worlds/video is not part of the current launch, so no video-provider credential is required for production acceptance.

## Required verification after a relevant credential change

Verify the affected subset of:

- public landing and authenticated app availability;
- `/health` and `/ready`;
- signup/login/passkey/recovery/Turnstile behavior;
- Resend delivery;
- Stripe Checkout/Portal creation and webhook signature handling;
- server-side entitlement projection;
- Cloudflare Workers AI inference through the intended Gateway;
- D1 migration/control access;
- API Shield/rate-limit reconciliation if the Cloudflare credential changed;
- exact-SHA production release path if a production deployment is required.

Current release authority is `docs/production-release.md`: exact current `origin/main` must pass `pnpm verify:cloudflare-build`, then the current text-first production mutation uses `pnpm production:release:text` for that same SHA. Historical Workers Builds access is not a current release acceptance criterion.

## Evidence record

Record only:

- incident/change identifier;
- credential category/provider;
- safe provider-generated identifier or bounded suffix when necessary;
- date/operator;
- consumers updated;
- verification performed;
- replacement/revocation result.

Do not record credential values.
