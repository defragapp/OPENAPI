# Security Incident Response Runbook

Status: current incident-response engineering runbook. This document does not make legal notification determinations.

This runbook covers suspected credential exposure, unauthorized repository access, customer-data exposure, account takeover, payment abuse, production compromise, and significant service abuse.

## 1. Contain

- Preserve owner access and verified recovery methods.
- Revoke unauthorized sessions, collaborators, tokens, deploy keys, apps, and service access when containment requires it.
- Disable an affected route, integration, or credential only when a safe replacement/containment path is ready, unless active exploitation requires immediate shutdown.
- Apply temporary Cloudflare restrictions when they reduce exposure without creating a larger customer/provider failure.
- Preserve evidence before destructive cleanup.

## 2. Preserve evidence

Record:

- detection time/source;
- affected service, route, account, repository, or credential category;
- relevant commit/event/request/provider audit identifiers and timestamps;
- actions taken and by whom;
- current production impact.

Do not copy full secrets, payment data, authentication cookies, private customer content, exact location history, or birth records into incident logs/issues.

## 3. Assess scope

Determine:

- what was exposed or changed;
- earliest/latest plausible exposure time;
- affected identities/environments/providers;
- whether production data was accessed, altered, exported, or deleted;
- whether auth, billing, policy, consent, or entitlements were affected;
- whether the issue remains exploitable.

Distinguish confirmed facts from assumptions/unresolved questions.

## 4. Eradicate and recover

- Replace/revoke compromised credentials using the credential-management runbook when applicable.
- Patch the root cause in the canonical OPENAPI implementation.
- Restore safe configuration from repository-owned sources of truth.
- Verify migrations, authentication boundaries, billing/webhooks, consent, privacy controls, release gates, and health/readiness.
- Monitor relevant provider audit logs/production telemetry for recurrence.

Current production recovery/release authority is `docs/production-release.md`. For the text-first launch, a repaired exact current `origin/main` SHA must pass `pnpm verify:cloudflare-build` before `pnpm production:release:text` performs the production mutation. GitHub Actions and historical Workers Builds are not recovery release authority.

Do not bypass exact-SHA gates merely because the change is urgent unless active exploitation requires a separate explicit containment action first.

## 5. Notify appropriately

Escalate to the repository owner immediately for confirmed/suspected exposure involving customer/account data, authentication/signing material, payment/Stripe data, production infrastructure control, unauthorized repository access, or material service interruption.

Legal, regulatory, customer, provider, insurer, or law-enforcement notification decisions require the owner and appropriate qualified counsel. Do not make unsupported claims about breach scope or obligations.

## 6. Close and improve

Before closure:

- confirm containment/remediation;
- confirm unauthorized/revoked access no longer works;
- confirm current exact-SHA repository and production checks pass;
- document root cause/contributing controls without secret values;
- strengthen automated tests/controls where practical;
- track unresolved provider-account/billing/permission items separately;
- remove temporary emergency controls that are no longer necessary;
- record whether any privacy/access/deletion evidence or external governance follow-up remains.
